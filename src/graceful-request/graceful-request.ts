import { defer, from, lastValueFrom, tap, throwError, timer } from 'rxjs'
import { catchError, concatMap, retryWhen } from 'rxjs/operators'

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

export type AxiosOrFetch<T extends 'Axios' | 'Fetch'> = T extends 'Axios'
  ? AxiosResponse & { rateLimitInfo?: RateLimitInfo }
  : Response & { rateLimitInfo?: RateLimitInfo }

export type AxiosOrFetchError<T extends 'Axios' | 'Fetch'> = T extends 'Axios'
  ? AxiosError & { rateLimitInfo?: RateLimitInfo }
  : Response & { rateLimitInfo?: RateLimitInfo }

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
export async function gracefulRequest<T extends 'Axios' | 'Fetch'>(
  typeOfRequest: T,
  promiseFactory: () => Promise<AxiosOrFetch<T>>,
  callback: (
    err: AxiosOrFetchError<T> | null,
    response: AxiosOrFetch<T> | null
  ) => void = () => {}
): Promise<AxiosOrFetch<T>> {
  const requestObservable = defer(() => from(promiseFactory())).pipe(
    tap((value) => callback(null, value)),
    catchError((error) => {
      callback(error, null)
      return throwError(error)
    })
  )

  let err: any = null
  try {
    await promiseFactory()
  } catch (error) {
    err = error
  }
  if (!err) {
    return lastValueFrom(requestObservable)
  }
  const sendableRes =
    typeOfRequest === 'Axios' ? err?.response : err?.clone ? err.clone() : null

  if (!sendableRes) {
    return lastValueFrom(requestObservable)
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
    ? requestObservable.pipe(
        retryWhen((errors) =>
          errors.pipe(
            concatMap((error, i) => {
              return i < retryLimit - 1
                ? timer(~~retryAfter * 1000).pipe(
                    tap(() => callback({ ...error, rateLimitInfo }, null))
                  )
                : throwError({ ...error, rateLimitInfo })
            })
          )
        )
      )
    : requestObservable

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
