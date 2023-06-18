import { useTheme } from '@mui/material'
import { GracefulStore, GracefulTheme } from '../provider'
import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import {
  AxiosOrFetchError,
  gracefulRequest,
} from '../graceful-request'
import axios, { AxiosRequestConfig } from 'axios'

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
  data: TData | null
  err: AxiosOrFetchError<T, TData> | null
}

export const useGracefulRequest = <T extends 'Axios' | 'Fetch', TData = any>(
  request: UseGracefulRequestProps<T>
) => {
  const { typeOfRequest } = request
  const { axios: userApi, ctx } = useGraceful()

  const [state, setState] = useState<
    UseGracefulRequestReturn<typeof typeOfRequest>
  >({
    isError: false,
    isLoading: false,
    data: null,
    err: null,
  })

  const gracefulError = useMemo(
    () => ctx.url === request.url && ctx.isError,
    [ctx]
  )

  const prepareRequest = useCallback(() => {
    switch (typeOfRequest) {
      case 'Axios':
        return (
          (userApi &&
            userApi<TData>({
              ...request,
            })) ||
          axios<TData>({
            ...request,
          })
        )
      case 'Fetch':
        return fetch(request.url, request)
      default:
        throw new Error('Invalid typeOfRequest parameter')
    }
  }, [typeOfRequest, request, userApi])

  useEffect(() => {
    gracefulRequest<typeof typeOfRequest, TData>(
      typeOfRequest,
      () => prepareRequest(),
      (err, res, { isLoading } = {}) => {
        if (isLoading) {
          setState((prevState) => ({
            ...prevState,
            isLoading,
          }))
        }

        if (err) {
          setState((prevState) => ({
            ...prevState,
            isError: true,
            err,
          }))
        }

        if (res) {
          setState((prevState) => ({
            ...prevState,
            isError: false,
            data: res,
          }))
        }
      }
    )
      .then((res) => {
        setState({
          isError: false,
          isLoading: false,
          err: null,
          data: res,
        })
      })
      .catch((err) => {
        setState({
          isError: true,
          isLoading: false,
          err,
          data: null,
        })
      })
  }, [gracefulRequest, typeOfRequest, prepareRequest])

  return {
    ...state,
    isError: state.isError || gracefulError,
  }
}
