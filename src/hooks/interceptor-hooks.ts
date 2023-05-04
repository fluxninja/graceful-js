import { Config, GracefulContext } from '../provider'
import { Dispatch, SetStateAction, useEffect } from 'react'

import { FetchScenariosFnc } from '../types'
import {
  axiosDecider,
  createGracefulPropsWithAxios,
  fetchDecider,
} from '../scenarios'
import { AxiosInstance, AxiosResponse } from 'axios'
import { GraphQLClient, RequestDocument, Variables } from 'graphql-request'
import { VariablesAndRequestHeadersArgs } from 'graphql-request/build/esm/types'
import type { TypedDocumentNode } from '@graphql-typed-document-node/core'

const { fetch: windowFetch } = window

export const useInterceptors = (
  setGracefulContext: Dispatch<SetStateAction<GracefulContext>>,
  config?: Config
) => {
  const { urlList = [], axios = null } = config || {}
  const baseSenariosBinded = baseScenarios.bind(
    null,
    setGracefulContext,
    urlList
  )

  useEffect(() => {
    fetchInterceptor(baseSenariosBinded)
    axiosInterceptor(setGracefulContext, axios)
  }, [])
}

export declare type BaseScenarios = (
  setGracefulContext: Dispatch<SetStateAction<GracefulContext>>,
  urlList: string[],
  url: RequestInfo | URL,
  options: RequestInit | undefined,
  res: Response
) => Promise<Response>

export const baseScenarios: BaseScenarios = async (
  setGracefulContext,
  urlList,
  url,
  options,
  res
) => {
  if (urlList.length && !urlList.includes(res.url)) return res
  const decidedRes = await fetchDecider(setGracefulContext, url, options, res)

  return decidedRes
}

export const fetchInterceptor = (senarios: FetchScenariosFnc) => {
  window.fetch = async function (...args) {
    const [url, options] = args
    const res = await windowFetch(...args)
    return senarios(url, options, res)
  }
}

export const axiosSuccess = (
  setGracefulContext: Dispatch<SetStateAction<GracefulContext>>
) => {
  return async (res: AxiosResponse) => {
    setGracefulContext({
      ctx: createGracefulPropsWithAxios(res),
    })
    return res
  }
}

export const axiosInterceptor = (
  setGracefulContext: Dispatch<SetStateAction<GracefulContext>>,
  axios: AxiosInstance | null
) => {
  if (!axios) return
  axios.interceptors.response.use(
    axiosSuccess(setGracefulContext),
    axiosDecider(axios, setGracefulContext)
  )
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
    await fetch(graphQLUrl, {
      method: 'POST',
      headers: requestHeaders as Headers,
      body: JSON.stringify({
        query: document,
        variables: variables,
      }),
    })
  } catch (e) {
    console.error(e)
    throw e
  }

  return client.request<T, V>(document, ...variablesAndRequestHeaders)
}
