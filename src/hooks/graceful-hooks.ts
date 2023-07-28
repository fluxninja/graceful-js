/* eslint-disable @typescript-eslint/no-explicit-any */
import { useTheme } from '@mui/material'
import { GracefulStore, GracefulTheme } from '../provider'
import { useCallback, useContext, useEffect, useState } from 'react'
import {
  AxiosOrFetch,
  AxiosOrFetchError,
  gracefulRequest,
} from '../graceful-request'

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

export declare type UseGracefulRequestProps<T extends 'Axios' | 'Fetch'> = {
  typeOfRequest: T
  requestFnc: () => Promise<AxiosOrFetch<T>>
  options?: {
    disabled?: boolean
  }
}

export declare type UseGracefulRequestReturn<
  T extends 'Axios' | 'Fetch',
  TData = any
> = {
  isError: boolean
  isLoading: boolean
  isRetry: boolean
  data: TData | null
  error: AxiosOrFetchError<T, TData> | null
  refetch: () => void
}

export declare type UseGracefulRequest = <
  T extends 'Axios' | 'Fetch',
  TData = any
>(
  request: UseGracefulRequestProps<T>
) => UseGracefulRequestReturn<T, TData>

export const useGracefulRequest: UseGracefulRequest = <
  T extends 'Axios' | 'Fetch',
  TData = any
>(
  request: UseGracefulRequestProps<T>
) => {
  const {
    typeOfRequest,
    requestFnc,
    options: { disabled = false } = {},
  } = request

  const [state, setState] = useState<
    Omit<UseGracefulRequestReturn<typeof typeOfRequest>, 'refetch'>
  >({
    isError: false,
    isLoading: false,
    isRetry: false,
    data: null,
    error: null,
  })

  const callGracefulRequest = useCallback(async () => {
    try {
      await gracefulRequest<typeof typeOfRequest, TData>(
        typeOfRequest,
        () => requestFnc(),
        (error, res, { isLoading, isRetry } = {}) => {
          setState({
            isLoading: !!isLoading,
            isRetry: !!isRetry,
            isError: !!error,
            data: res,
            error,
          })
        }
      )
    } catch (error) {
      setState((prevState) => ({
        ...prevState,
        isError: true,
        error: error as AxiosOrFetchError<typeof typeOfRequest, TData>,
      }))
    }
  }, [typeOfRequest])

  useEffect(() => {
    if (disabled) {
      return
    }
    callGracefulRequest()
  }, [callGracefulRequest, disabled])

  return {
    ...state,
    refetch: () => callGracefulRequest(),
  }
}
