# graceful-js

`graceful-js` is a robust React library that enhances API communication by intelligently handling retries and understanding rate limiting headers and bodies. It allows your application to recover gracefully from transient failures.

## Installation

Install using `npm` or `yarn`:

```shell
#npm
npm i @fluxninja/graceful-js
#yarn
yarn add @fluxninja/graceful-js
```

## Configuration

Configure `graceful-js` to suit your needs. If using `axios`, pass the `axios` instance to the config:

```javascript
export declare type Config = {
  axios?: AxiosInstance
  urlList?: string[]
  theme?: GracefulTheme
  errorComponentMap?: Map<number, JSX.Element>
  DefaultErrorComponent?: JSX.Element
  WaitingRoomErrorComponent?: JSX.Element
  maxBackOffTime?: number
  maxRequestResolveTime?: number
  exponentialBackOffFn?: ExponentialBackOffFn
}
```

Apply this config object to the `GracefulProvider`:

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

## Usage

Use `gracefulRequest` for support with rate limit headers and body. This function will retry requests based on the provided parameters:

```javascript
import { gracefulRequest } from 'graceful-js'

// gracefulRequest with Axios
gracefulRequest <
  'Axios' >
  ('Axios',
  () => api.get('yourEndpoint'),
  (err, success) => {
    if (err) {
      // action on error
      return
    }
    // action on success
  })
```

```javascript
import { gracefulRequest } from 'graceful-js'

// gracefulRequest with Fetch
gracefulRequest <
  'Fetch' >
  ('Fetch',
  () => fetch('yourEndpoint'),
  (err, success) => {
    if (err) {
      // action on error
      return
    }
    // action on success
  })
```

The `gracefulRequest` callback emits an error or success response at each retry, resolving with a promise when retries complete. It allows immediate user notification of errors without waiting for function resolution.

## Hooks

Use the `useGracefulRequest` hook:

```javascript
const { isError, refetch, data, isLoading, isRetry, error } =
  useGracefulRequest <
  'Axios' >
  {
    typeOfRequest: 'Axios',
    requestFnc: () => api.get('api/rate-limit'),
  }
```

The `useGraceful` hook can also be utilized to obtain the context of the last request response, in addition to a Map of application errors.

## Error Components

Use error components as follows:

```javascript
<GracefulError
  {...{
    url: 'http://localhost:3009/api/ping', // endpoint for which this error component is rendering
    method: 'GET', // method for the request
    requestBody: {}, // request body in request, omit it if no request body
  }}
/>
```

```javascript
;<GracefulErrorByStatus status={errorStatus} />
const { errorInfo } = useGraceful()
errorInfo.get('http://localhost:3009/api/rate-limit-get-{}') // create key with url + lowercase method + requestBody (if no request body add {})
```

## Scenarios

For rate limiting scenarios, send the following inside the error response body:

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

For rate limiting scenarios using headers, add the following headers:

**Note**: Rate limit headers are inspired by IETF draft. For more information, visit [IETF website](https://www.ietf.org/archive/id/draft-polli-ratelimit-headers-02.html)

```javascript
// Generic rate limit headers
export declare type RateLimitHeaders = {
  // The number of requests that can be made.
  'x-ratelimit-limit': string
  // The number of remaining requests that can be made.
  'x-ratelimit-remaining': string
  // The number of seconds(delta-seconds) until the rate limit resets.
  'x-ratelimit-reset': string
  // Returned only on HTTP 429 responses if the rate limit encountered is the global rate limit (not per-route).
  'x-ratelimit-global': string
  // The scope of the rate limit upto which it is valid. For example, "user" or "bot".
  'x-ratelimit-scope': string
  // The number of seconds after which the rate limit resets.
  'retry-after': string
}
```

**NOTE**: Retry will occur regardless of the error status code if a retry-after time is provided in headers or body.
