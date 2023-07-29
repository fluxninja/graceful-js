## Graceful-js (FluxNinja UI package)

Install using `npm` or `yarn`

```shell
#npm
npm i @fluxninja-tools/graceful-js
#yarn
yarn add @fluxninja-tools/graceful-js
```

Graceful-js is a powerful and intuitive React library designed to enhance your API communication by seamlessly handling retries based on status codes and intelligently understanding rate limiting headers and bodies. Its ability to automatically handle retries, allowing your application to gracefully recover from transient failures. Whether you're dealing with intermittent server issues or temporary network glitches, this library will make sure your API requests are retried in a controlled and efficient manner.

## Config Graceful

Here is how you can configure `graceful-js` according to your needs. If you are using axios, make sure you pass the axios instance to the config. You can create an instance by using `axios.create`.

```javascript
/**
 * Configuration object for the GracefulProvider component.
 * @property {AxiosInstance} axios - An Axios instance to use for making HTTP requests.
 * @property {string[]} urlList - A list of URLs to intercept and handle gracefully.
 * @property {GracefulTheme} theme - The theme object to use for styling the error components.
 * @property {Map<number, JSX.Element>} errorComponentMap - A map of HTTP status codes to custom error components to render for each code.
 * @property {JSX.Element} DefaultErrorComponent - The default error component to render if no custom component is provided for a given status code.
 * @property {JSX.Element} WaitingRoomErrorComponent - The error component to render for the waiting room.
 * @property {number} maxBackOffTime - maximum exponential back-off time in seconds. Default is 20 seconds.
 * @property {number} maxRequestResolveTime - maximum time in seconds to wait for a request to resolve. Default is 10 seconds.
 */
export declare type Config = {
  axios?: AxiosInstance
  urlList?: string[]
  theme?: GracefulTheme
  errorComponentMap?: Map<number, JSX.Element>
  DefaultErrorComponent?: JSX.Element
  WaitingRoomErrorComponent?: JSX.Element
  maxBackOffTime?: number
  maxRequestResolveTime?: number
}
```

Pass this config object to the `GracefulProvider` like so:

```javascript
import { GracefulProvider } from 'graceful-js'

const App: FC = () => (
  <ThemeProvider>
    <GracefulProvider config={yourConfigObject}>
      <AppComponent />
    </GracefulProvider>
  </ThemeProvider>
)
```

To get support for the rate limit headers and body use `gracefulRequest` instead of a regular fetch or axios. This function will retry according to the provided parameters. In case there is no Retry-After provided by server, library do retries in case of 429, 503 and 504 using exponential back off. Here is how you use `gracefulRequest` with `Axios` and `fetch`.

```javascript
import { gracefulRequest } from 'graceful-js'

// gracefulRequest with Axios
gracefulRequest <
  'Axios' >
  ('Axios',
  () => api.get('yourEndPoint'),
  (err, success) => {
    if (err) {
      // action on error
      return
    }
    // action on success
  })

// gracefulRequest with fetch
gracefulRequest <
  'Fetch' >
  ('Fetch',
  () => fetch('yourEndPoint'),
  (err, success) => {
    if (err) {
      // action on error
      return
    }
    // action on success
  })
```

Callback in `gracefulRequest` emit error or success response on every retry and it resolves with a promise once retries are done. This callback can be useful to show error to the user right away without waiting for the function to get resolved.

## Hooks

You can also use `useGracefulRequest` hook. Here is the code snippet.

```javascript
  const { isError, refetch, data, isLoading, isRetry, error } = useGracefulRequest<'Axios'>({
    typeOfRequest: 'Axios',
    requestFnc: () => api.get('api/rate-limit'),
  })

  // here are the hook types:

export declare type UseGracefulRequestProps<T extends 'Axios' | 'Fetch'> = {
    typeOfRequest: T;
    requestFnc: () => Promise<AxiosOrFetch<T>>;
    options?: {
      // if disabled, api call will happen when called refetch
        disabled?: boolean;
    };
};
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
```

You can also use `useGraceful` hook to get last request response context along with a Map of errors happened in the app.

## Error Components

To use error components user can use use the following:

```javascript

<GracefulError
  {...{
    url: 'http://localhost:3009/api/ping', // endpoint for which this error component is rendering
    method: 'GET', // method for the request
    requestBody: {}, // request body in request, omit it if no request body
  }}
/>
// or
<GracefulErrorByStatus status={errorStatus} />
const { errorInfo } = useGraceful()

errorInfo.get('http://localhost:3009/api/rate-limit-get-{}') // create key with url + lowercase method + requestBody (if no request body add {})
```

## Scenarios

To get support for the rate limiting scenario by using the response body, send the following inside the error response body.

```javascript
export declare type RateLimitResponseBody = {
  message: string // message in the response
  retryAfter: number // time in seconds after which retry will happen
  retryLimit: number // max number of retries if not resolved
  global: boolean // if true, full app is rate limited. ie. app is down
  rateLimitRemaining: number // Remaining rate limit
  rateLimitReset: number // delta seconds after which rate-limit will reset
}
```

To get support for rate limiting scenario by using headers. Add following headers:

```javascript
/**
 * Generic rate limit headers
 */
export declare type RateLimitHeaders = {
  /**
   * The number of requests that can be made
   */
  'x-ratelimit-limit': string
  /**
   * The number of remaining requests that can be made
   */
  'x-ratelimit-remaining': string
  /**
   * The number of seconds(delta-seconds) until the rate limit resets
   */
  'x-ratelimit-reset': string
  /**
   * Returned only on HTTP 429 responses if the rate limit encountered is the global rate limit (not per-route)
   */
  'x-ratelimit-global': string
  /**
   * The scope of the rate limit upto which it is valid. For example,
   * "user" or "bot"
   */
  'x-ratelimit-scope': string
  /**
   * The number of seconds after which the rate limit resets
   */
  'retry-after': string
}
```

**NOTE**: Retry will occur regardless of the error status code if a retry-after time is provided in headers or body.
