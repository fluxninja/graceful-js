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
}

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
  const { typeOfRequest, requestFnc } = request

  const [state, setState] = useState<
    UseGracefulRequestReturn<typeof typeOfRequest>
  >({
    isError: false,
    isLoading: false,
    isRetry: false,
    data: null,
    err: null,
  })

  const callGracefulRequest = useCallback(async () => {
    try {
      await gracefulRequest<typeof typeOfRequest, TData>(
        typeOfRequest,
        () => requestFnc(),
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
  }, [typeOfRequest, setState])

  useEffect(() => {
    callGracefulRequest()
  }, [typeOfRequest])

  return state
}
