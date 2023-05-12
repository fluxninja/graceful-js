import { defer, from, lastValueFrom, of, tap } from 'rxjs'
import { delay, retry } from 'rxjs/operators'
import {
  checkHeaderAndBody,
  createGracefulPropsWithAxios,
  createGracefulPropsWithFetch,
} from '../scenarios'
import { AxiosResponse } from 'axios'
import { initialContextProps } from '../provider'

type AxiosOrFetch<T extends 'Axios' | 'Fetch'> = T extends 'Axios'
  ? AxiosResponse<any, any>
  : Response

export const getGracefulProps = async <
  T extends 'Axios' | 'Fetch',
  R extends AxiosOrFetch<T>
>(
  typeOfRequest: T,
  response: R
) => {
  switch (typeOfRequest) {
    case 'Axios':
      return createGracefulPropsWithAxios(response as AxiosResponse)
    case 'Fetch':
      return await createGracefulPropsWithFetch(
        (response as unknown as Response).clone()
      )
    default:
      return initialContextProps.ctx
  }
}

export async function gracefulRequest<T extends 'Axios' | 'Fetch'>(
  typeOfRequest: T,
  promiseFactory: () => Promise<AxiosOrFetch<T>>,
  callback: (
    err: AxiosOrFetch<T> | null,
    response: AxiosOrFetch<T> | null
  ) => void = () => {}
): Promise<AxiosOrFetch<T>> {
  const requestObservable = defer(() => from(promiseFactory()))
  let err: any
  try {
    await promiseFactory()
  } catch (error) {
    err = error
  }
  const sendableRes = typeOfRequest === 'Axios' ? err.response : err.clone()
  const { headers, responseBody: data } = await getGracefulProps(
    typeOfRequest,
    sendableRes
  )
  const {
    retryAfter = 0,
    retryLimit = 0,
    check,
  } = checkHeaderAndBody(data, headers) || {}

  const requestWithRetry = check
    ? requestObservable.pipe(
        tap((res) => callback(null, res)),
        retry({
          count: retryLimit,
          delay: (error) => {
            callback(error, null)
            return of(error).pipe(delay(~~retryAfter * 1000))
          },
        })
      )
    : requestObservable

  return lastValueFrom(requestWithRetry)
}
