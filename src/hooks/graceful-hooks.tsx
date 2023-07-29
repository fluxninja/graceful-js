/* eslint-disable @typescript-eslint/no-explicit-any */
import { useTheme } from '@mui/material'
import { GracefulStore, GracefulTheme } from '../provider'
import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'
import {
  AxiosOrFetch,
  AxiosOrFetchError,
  gracefulRequest,
} from '../graceful-request'
import { GracefulErrorByStatus, WaitingRoom } from '../error-components'

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
  errorComponent: JSX.Element | null
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
    errorComponent: null,
  })

  const requestRef = useRef<() => Promise<AxiosOrFetch<T, TData>>>(() =>
    requestFnc()
  )

  const callGracefulRequest = useCallback(async () => {
    try {
      await gracefulRequest<typeof typeOfRequest, TData>(
        typeOfRequest,
        requestRef.current,
        (error, res, { isLoading, isRetry } = {}) => {
          const errorStatus =
            typeOfRequest === 'Axios'
              ? error?.status ||
                (
                  error as unknown as {
                    response: {
                      status: number
                    }
                  }
                )?.response?.status
              : error?.status

          setState({
            isLoading: !!isLoading,
            isRetry: !!isRetry,
            isError: !!error,
            data: res,
            error,
            errorComponent: errorStatus ? (
              <GracefulErrorByStatus status={errorStatus} />
            ) : (
              <WaitingRoom isLoading={!!isLoading} />
            ),
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
  }, [typeOfRequest, setState, requestRef])

  useEffect(() => {
    if (disabled) {
      return
    }
    callGracefulRequest()
  }, [callGracefulRequest, disabled])

  return {
    ...state,
    refetch: callGracefulRequest,
  }
}
