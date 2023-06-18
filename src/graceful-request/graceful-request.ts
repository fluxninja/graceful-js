import { defer, from, lastValueFrom, tap, throwError, timer } from 'rxjs'
import { catchError, concatMap, finalize, retryWhen } from 'rxjs/operators'

import { GraphQLClient, RequestDocument, Variables } from 'graphql-request'
import { VariablesAndRequestHeadersArgs } from 'graphql-request/build/esm/types'
import type { TypedDocumentNode } from '@graphql-typed-document-node/core'

import {
  checkHeaderAndBody,
  createGracefulPropsWithAxios,
  createGracefulPropsWithFetch,
} from '../scenarios'
import { AxiosError, AxiosResponse } from 'axios'

export declare type RateLimitInfo = {
  retryAfter: number
  retryLimit: number
  rateLimitRemaining: number
  resetAfter: {
    resetTime?: Date
    deltaSeconds: any
  }
}

export type AxiosOrFetch<
  T extends 'Axios' | 'Fetch',
  TData = any
> = T extends 'Axios'
  ? AxiosResponse<TData> & { rateLimitInfo?: RateLimitInfo }
  : Omit<Response, 'json'> & {
      rateLimitInfo?: RateLimitInfo
      json: () => Promise<TData>
    }

export type AxiosOrFetchError<
  T extends 'Axios' | 'Fetch',
  TData = any
> = T extends 'Axios'
  ? AxiosError<TData> & { rateLimitInfo?: RateLimitInfo }
  : Omit<Response, 'json'> & {
      rateLimitInfo?: RateLimitInfo
      json: () => Promise<TData>
    }

export declare type GetGracefulPropsParams =
  | {
      typeOfRequest: 'Axios'
      response: AxiosOrFetch<'Axios'>
    }
  | {
      typeOfRequest: 'Fetch'
      response: AxiosOrFetch<'Fetch'>
    }
export const getGracefulProps = async (params: GetGracefulPropsParams) => {
  const { typeOfRequest, response } = params
  switch (typeOfRequest) {
    case 'Axios':
      return createGracefulPropsWithAxios(response)
    case 'Fetch':
      return await createGracefulPropsWithFetch(response.clone())
    default:
      throw new Error('Invalid typeOfRequest parameter')
  }
}

/**
 * Makes a graceful request using either Axios or Fetch.
 *
 * @param {'Axios' | 'Fetch'} typeOfRequest - The type of request to make.
 * @param {() => Promise<AxiosOrFetch<T>>} promiseFactory - A function that returns a promise that resolves to the response object.
 * @param {(err: AxiosOrFetch<T> | null, response: AxiosOrFetch<T> | null) => void} [callback=() => {}] - An optional callback function that is called with the error and response objects.
 * @returns {Promise<AxiosOrFetch<T>>} - A promise that resolves to the response object.
 */
export async function gracefulRequest<T extends 'Axios' | 'Fetch', TData = any>(
  typeOfRequest: T,
  promiseFactory: () => Promise<AxiosOrFetch<T>>,
  callback: (
    err: AxiosOrFetchError<T, TData> | null,
    response: AxiosOrFetch<T, TData> | null,
    info?: {
      isRetry?: boolean
      isLoading?: boolean
    }
  ) => void = () => {}
): Promise<AxiosOrFetch<T, TData>> {
  let err: any = null
  let responsePromise: AxiosOrFetch<T> | null = null
  let isLoading = false
  let isRetry = false
  try {
    isLoading = true
    responsePromise = await promiseFactory()
    isLoading = false
  } catch (error) {
    isLoading = false
    err = error
  }
  callback(null, null, { isLoading })
  if (!err && responsePromise) {
    callback(null, responsePromise, {
      isRetry,
      isLoading,
    })
    return responsePromise
  }
  const sendableRes =
    typeOfRequest === 'Axios' ? err?.response : err?.clone ? err.clone() : null
  callback(err, null)
  if (!sendableRes) {
    return err
  }
  const { headers, responseBody: data } =
    (await getGracefulProps({
      typeOfRequest,
      response: sendableRes,
    })) || {}
  const {
    retryAfter = 0,
    retryLimit = 0,
    rateLimitRemaining = 0,
    resetAfter = { deltaSeconds: 0 },
    check,
  } = checkHeaderAndBody(data, headers) || {}
  const rateLimitInfo: RateLimitInfo = {
    retryAfter,
    retryLimit,
    rateLimitRemaining,
    resetAfter,
  }
  const requestWithRetry = check
    ? defer(() => from(promiseFactory())).pipe(
        catchError((error) => {
          return throwError(error)
        }),
        retryWhen((errors) =>
          errors.pipe(
            concatMap((error, i) => {
              return i < retryLimit
                ? timer(~~retryAfter * 1000).pipe(
                    tap(() =>
                      callback({ ...error, rateLimitInfo }, null, {
                        isRetry: true,
                        isLoading: true,
                      })
                    ),
                    finalize(() => {
                      callback({ ...error, rateLimitInfo }, null, {
                        isRetry: false,
                        isLoading: false,
                      })
                    })
                  )
                : throwError({ ...error, rateLimitInfo })
            })
          )
        )
      )
    : defer(() => from(promiseFactory()))

  return lastValueFrom(requestWithRetry)
}

export const gracefulGraphQLRequest = async <
  T,
  V extends Variables = Variables
>(
  graphQLUrl: string,
  client: GraphQLClient,
  document: RequestDocument | TypedDocumentNode,
  ...variablesAndRequestHeaders: VariablesAndRequestHeadersArgs<V>
): Promise<T> => {
  const [variables, requestHeaders] = variablesAndRequestHeaders
  try {
    await gracefulRequest('Fetch', () =>
      fetch(graphQLUrl, {
        method: 'POST',
        headers: requestHeaders as Headers,
        body: JSON.stringify({
          query: document,
          variables: variables,
        }),
      }).then((res) => {
        if (!res.ok) throw res
        return res
      })
    )
  } catch (e) {
    throw e
  }

  return client.request<T, V>(document, ...variablesAndRequestHeaders)
}
