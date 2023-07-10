## Graceful-js (FluxNinja UI package)
Install using `npm` or `yarn`

```shell
#npm
npm i @fluxninja-tools/graceful-js
#yarn
yarn add @fluxninja-tools/graceful-js
```
Graceful-js is a powerful and intuitive React library designed to enhance your API communication by seamlessly handling retries based on status codes and intelligently understanding rate limiting headers and bodies. Its ability to automatically handle retries, allowing your application to gracefully recover from transient failures. Whether you're dealing with intermittent server issues or temporary network glitches, this library will make sure your API requests are retried in a controlled and efficient manner.

Graceful-js is built on the concept of interceptors. It provides two types of interceptors fetch and axios.
To use `graceful-js` with browser fetch. You just have to wrap your app with `GracefulProvider` like so:

```javascript
<GracefulProvider>
  <App />
</GracefulProvider>
```

The only thing a user has to do after wrapping their app with `GracefulProvider` is to use `GracefulError` component as their primary error component, and it will take care of the rest. This error component renders different components according to the status code. You have to pass url as parameter to error component. If you are fetching same url with different body at multiple places pass request body to error component as well. This is used to uniquely identify request made by app.

## Custom Config

Here is how you can configure `graceful-js` according to your needs. If you are using axios, make sure you pass the axios instance to the config. You can create an instance by using `axios.create`.

```javascript
/**
 * Configuration object for the GracefulProvider component.
 * @property {AxiosInstance} axios - An Axios instance to use for making HTTP requests.
 * @property {string[]} urlList - A list of URLs to intercept and handle gracefully.
 * @property {GracefulTheme} theme - The theme object to use for styling the error components.
 * @property {Map<number, JSX.Element>} errorComponentMap - A map of HTTP status codes to custom error components to render for each code.
 * @property {JSX.Element} DefaultErrorComponent - The default error component to render if no custom component is provided for a given status code.
 * @property {number} maxBackOffTime - Maximum wait time for retry. It is used in exponential back off. Default is 20 sec.
 */
export declare type Config = {
  axios?: AxiosInstance
  urlList?: string[]
  theme?: GracefulTheme
  errorComponentMap?: Map<number, JSX.Element>
  DefaultErrorComponent?: JSX.Element
  maxBackOffTime?: number
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
import { gracefulRequest } from 'graceful-js';

// gracefulRequest with Axios
   gracefulRequest<'Axios'>('Axios',
     () => api.get(/api),
     (err, success) => {
       if(err){
       	// action on error
	return
       }
       // action on success
    })

// gracefulRequest with fetch
   gracefulRequest<'Fetch'>('Fetch',
    () => fetch('yourEndPoint'),
    (err, success) => {
      if(err){
        // action on error
        return
      }
      // action on success
    })
```

Callback in `gracefulRequest` emit error or success response on every retry and it resolves with a promise once retries are done. This callback can be useful to show error to the user right away without waiting for the function to get resolved.

You can then use `GracefulError` component like so:

```javascript
import { GracefulProvider, GracefulError, gracefulRequest } from 'graceful-js';
const api = axios.create({
	baseUrl: "yourbaseurl",
	headers: {}
})

const AppComponent = () => {
const [err, setErr] = React.useState(false)
  const apiCall = () => {
    gracefulRequest('Axios', () => api.get(/api), (err, success) => {
       if(err){
       	setErr(true)
	return
       }
       setErr(false)
    })
 }

   return (
	<>
	  {
	   err ? <GracefulError
		   url="https://website.com/api/endpoint"
		   requestBody={{ userID: "foo" }}
		  />:(
		// code to render if no error
		<h1>Api call is successful</h1>
		)
	   }
	   <button onClick={apiCall}>Click to fetch</button>
	</>
	)
}
```

In the case of graphql, the library currently supports `graphql-request`. To implement `graceful-js`, after creating a graphql client, instead of using `client.request` use `gracefulGraphQLRequest`. In case of graphQL, it's mendatory to pass `requestBody` to `GracefulError` component. Pass an object of `{ query, variables }`. Here is the code snippet:

```javascript
import { GraphQLClient, gql } from 'graphql-request'
import { useQuery } from 'react-query'
import { gracefulGraphQLRequest } from 'graceful-js'

export const gqlClient = new GraphQLClient(`${API_SERVICE_URL}/graphql`, {
  headers: API_HEADERS,
})

export const queryHello = gql`
  query hello {
    hello
  }
`

export const useCharacterQuery = () => {
  return useQuery({
    queryKey: ['hello'],
    queryFn: () =>
      gracefulGraphQLRequest(
        `${API_SERVICE_URL}/graphql`,
        gqlClient,
        queryHello,
        undefined,
        API_HEADERS
      ),
    enabled: false,
    retry: false,
  })
}

// use graceful error like so:
;<GracefulError
  url={`${API_SERVICE_URL}/graphql`}
  requestBody={{
    query: queryHello,
    variables: {}, // if there are any variables
  }}
/>
```

To implement graphql with any other graphql client, just add an extra `gracefulRequest` with fetch before calling the graphql endpoint with the package. This fetch request will get intercepted by graceful-js.

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
        disabled?: boolean;
    };
};
export declare type UseGracefulRequestReturn<T extends 'Axios' | 'Fetch', TData = any> = {
    isError: boolean;
    isLoading: boolean;
    isRetry: boolean;
    data: TData | null;
    error: AxiosOrFetchError<T, TData> | null;
    refetch: () => void;
};
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
