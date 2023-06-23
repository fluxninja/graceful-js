import React, { CSSProperties, FC } from 'react'
import {
  GracefulProvider,
  useGracefulRequest,
  GracefulError,
} from '@fluxninja-tools/graceful-js'
import { Box } from '@mui/material'
import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:3009',
})

export const App: FC = () => {
  return (
    <GracefulProvider
      config={{
        axios: api,
      }}
    >
      <TestComponent />
    </GracefulProvider>
  )
}

export const TestComponent: FC = () => {
  const { isError } = useGracefulRequest<'Axios'>({
    typeOfRequest: 'Axios',
    requestFnc: () => api.get('api/rate-limit'),
  })
  const { isError: pingError } = useGracefulRequest<'Axios'>({
    typeOfRequest: 'Axios',
    requestFnc: () => api.get('api/ping'),
  })

  return (
    <>
      <Box sx={containerCSS}>
        {isError && (
          <GracefulError
            {...{
              url: 'http://localhost:3009/api/rate-limit',
            }}
          />
        )}
      </Box>
      <Box sx={containerCSS}>
        {pingError && (
          <GracefulError
            {...{
              url: 'http://localhost:3009/api/ping',
            }}
          />
        )}
      </Box>
    </>
  )
}

const containerCSS: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: 500,
}
