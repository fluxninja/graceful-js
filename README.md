## Graceful-js (FluxNinja UI package)
Graceful-js is built on the concept of interceptors. It provides two types of interceptors: one is a fetch interceptor, and the other is an axios interceptor.
To use `graceful-js` with browser fetch. You just have to wrap your app with `GracefulProvider` like so:
```javascript
<GracefulProvider>
  <App />
</GracefulProvider>
```
By doing so, graceful-js will intercept every fetch request response and will do its magic behind the scenes.
Graceful-js will do the following:
- Provide different `ui` components for each scenario.
- Read information from the body or headers. If a request fails, it will first look into the body of the error response then headers and see if it has the required information to do a retry in case of rate limit.

The only thing a user has to do after wrapping their app with `GracefulProvider` is to use `GracefulError` component as their primary error component, and it will take care of the rest. This error component renders different components according to the status code.

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
 */
export declare type Config = {
  axios?: AxiosInstance
  urlList?: string[]
  theme?: GracefulTheme
  errorComponentMap?: Map<number, JSX.Element>
  DefaultErrorComponent?: JSX.Element
}
```
Pass this config object to the `GracefulProvider` like so:
```javascript
import { GracefulProvider } from 'graceful-js';

const App:FC = () => (
<ThemeProvider>
	<GracefulProvider config={yourConfigObject}>
		<AppComponent />
	</GracefulProvider>
</ThemeProvider>
)
```
Then use `GracefulError` component:
```javascript
import { GracefulProvider, GracefulError } from 'graceful-js';
const api = axios.create({
	baseUrl: "yourbaseurl",
	headers: {}
})

const AppComponent = () => {
const [err, setErr] = React.useState(false)
  const apiCall = () => {
		api.get('/api').then(() => {
			setErr(false)
     }).catch((err) => {
			console.error(err)
			setErr(true)
		})
	}

   return (
			<>
				{
					err ? <GracefulError />:(
							// code to render if no error
						)
				}
			</>
		)
}
```

In the case of graphql, the library currently supports `graphql-request`. To implement graceful-js, after creating a graphql client, instead of using `client.request`, just use gracefulGraphQLRequest. Here is the code snippet:

```javascript
import { GraphQLClient, gql } from 'graphql-request';
import { useQuery } from 'react-query';
import { gracefulGraphQLRequest } from 'graceful-js';

export const gqlClient =  new GraphQLClient(`${API_SERVICE_URL}/graphql`, {
    headers: API_HEADERS,
});

export const queryHello = gql`
    query hello{
        hello
    }
`

export const useCharacterQuery = () => {
   return useQuery({
        queryKey: ['hello'],
        queryFn: () => gracefulGraphQLRequest(
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

```
To implement graphql with any other graphql client, just add an extra fetch request before calling the graphql endpoint with the package. This fetch request will get intercepted by graceful-js.

## Scenarios
To get support for the rate limiting scenario by using the response body, send the following inside the error response body.
```javascript
export declare type RateLimitResponseBody = {
  message: string // message in the response
  retryAfter: number // time in seconds after which retry will happen
  retryLimit: number // max number of retries if not resolved
  global: boolean // if true, full app is rate limited. ie. app is down
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
   * The number of seconds until the rate limit resets
   */
  'x-ratelimit-reset-after': string
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
**NOTE**: Retry will occur regardless of the status code if a retry-after time is provided in headers or body. If a retry limit is not provided, retry will occur once.
