export declare type CreateErrorIdPayload = {
  url: string
  method: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  requestBody?: any
}

export const createErrorInfoKey = ({
  url,
  method = '',
  requestBody = {},
}: CreateErrorIdPayload) =>
  [url.toLowerCase(), method.toLowerCase(), JSON.stringify(requestBody)].join(
    '-'
  )
