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
 * @param {() => Promise<AxiosOrFetch<T>>} requestFnc - A function that returns a promise that resolves to the response object.
 * @param {(err: AxiosOrFetch<T> | null, response: AxiosOrFetch<T> | null) => void} [callback=() => {}] - An optional callback function that is called with the error and response objects.
 * @returns {Promise<AxiosOrFetch<T>>} - A promise that resolves to the response object.
 */
export async function gracefulRequest<T extends 'Axios' | 'Fetch', TData = any>(
  typeOfRequest: T,
  requestFnc: () => Promise<AxiosOrFetch<T>>,
  callback: (
    err: AxiosOrFetchError<T, TData> | null,
    response: AxiosOrFetch<T, TData> | null,
    info?: {
      isRetry?: boolean
      isLoading?: boolean
    }
  ) => void = () => {},
  retryAttempts = 0
): Promise<AxiosOrFetch<T, TData>> {
  const findIsRetry = () => (retryAttempts > 0 ? true : false)
  const retryRequest = async (err: any) => {
    callback(err, null, {
      isRetry: findIsRetry(),
      isLoading: false,
    })
    const sendableRes = typeOfRequest === 'Axios' ? err?.response : err
    if (!sendableRes) {
      callback(err, null, {
        isRetry: findIsRetry(),
        isLoading: false,
      })
      throw err
    }

    const { headers, responseBody: data } = await getGracefulProps({
      typeOfRequest,
      response: sendableRes,
    })

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

    if (!check) {
      throw err
    }

    await new Promise((resolve) => setTimeout(resolve, ~~retryAfter * 1000))

    callback({ ...err, rateLimitInfo }, null, {
      isRetry: findIsRetry(),
      isLoading: false,
    })

    if (retryAttempts < retryLimit) {
      return await gracefulRequest(
        typeOfRequest,
        requestFnc,
        callback,
        retryAttempts + 1
      )
    }

    throw err
  }

  try {
    if (!findIsRetry()) {
      callback(null, null, {
        isRetry: findIsRetry(),
        isLoading: true,
      })
    }
    const response = await requestFnc()
    if ('ok' in response && !response.ok) {
      throw response
    }
    callback(null, response, {
      isRetry: findIsRetry(),
      isLoading: false,
    })
    return response
  } catch (err: any) {
    return await retryRequest(err)
  }
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
      })
    )
  } catch (e) {
    throw e
  }

  return client.request<T, V>(document, ...variablesAndRequestHeaders)
}
