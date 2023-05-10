import { defer, lastValueFrom } from 'rxjs'
import { retry } from 'rxjs/operators'
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

export async function gracefulRequest<
  T extends 'Axios' | 'Fetch',
  R extends AxiosOrFetch<T>
>(typeOfRequest: T, promise: Promise<R>): Promise<R> {
  // Create a defer observable that will wrap the promise
  const requestObservable = defer(() => promise)

  const { headers: header, responseBody } = await getGracefulProps<T, R>(
    typeOfRequest,
    await promise
  )
  const { check, retryAfter, retryLimit } = checkHeaderAndBody(
    header,
    responseBody
  )

  const requestWithRetry = !check
    ? requestObservable.pipe()
    : requestObservable.pipe(
        retry({
          count: ~~retryLimit,
          delay: ~~retryAfter * 1000,
        })
      )
  return lastValueFrom(requestWithRetry)
}
