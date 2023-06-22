import { useTheme } from '@mui/material'
import { GracefulStore, GracefulTheme } from '../provider'
import { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { AxiosOrFetchError, gracefulRequest } from '../graceful-request'
import { AxiosRequestConfig } from 'axios'

export const useGraceful = () => useContext(GracefulStore)

export const useGracefulTheme = () => {
  const { theme } = useGraceful()
  const muiTheme = useTheme()

  const gracefulTheme: GracefulTheme = {
    primary: theme?.primary ?? muiTheme.palette.primary.main,
    secondary: theme?.secondary ?? muiTheme.palette.secondary.main,
    text: theme?.text ?? muiTheme.palette.text.primary,
  }
  return gracefulTheme
}

export declare type UseGracefulRequestProps<T extends 'Axios' | 'Fetch'> =
  T extends 'Axios'
    ? AxiosRequestConfig & { url: string; typeOfRequest: T }
    : RequestInit & { url: string; typeOfRequest: T }

export declare type UseGracefulRequestReturn<
  T extends 'Axios' | 'Fetch',
  TData = any
> = {
  isError: boolean
  isLoading: boolean
  isRetry: boolean
  data: TData | null
  err: AxiosOrFetchError<T, TData> | null
}

export const useGracefulRequest = <T extends 'Axios' | 'Fetch', TData = any>(
  request: UseGracefulRequestProps<T>
) => {
  const { typeOfRequest } = request
  const { axios: userApi } = useGraceful()

  const [state, setState] = useState<
    UseGracefulRequestReturn<typeof typeOfRequest>
  >({
    isError: false,
    isLoading: false,
    isRetry: false,
    data: null,
    err: null,
  })

  const prepareRequest = useCallback(async () => {
    switch (typeOfRequest) {
      case 'Axios':
        if (!userApi) {
          setState((prevState) => ({
            ...prevState,
            isError: true,
            err: null,
          }))
          throw new Error('Missing axios instance')
        }
        return userApi<TData>({
          ...request,
        })
      case 'Fetch':
        return fetch(request.url, request)
      default:
        throw new Error('Invalid typeOfRequest parameter')
    }
  }, [typeOfRequest, userApi])

  useEffect(() => {
    const request = async () => {
      try {
        await gracefulRequest<typeof typeOfRequest, TData>(
          typeOfRequest,
          () => prepareRequest(),
          (err, res, { isLoading, isRetry } = {}) => {
            setState({
              isLoading: !!isLoading,
              isRetry: !!isRetry,
              isError: !!err,
              data: res,
              err,
            })
          }
        )
      } catch (err) {
        setState((prevState) => ({
          ...prevState,
          isError: true,
        }))
      }
    }

    request()
  }, [gracefulRequest, typeOfRequest, prepareRequest])

  return state
}
