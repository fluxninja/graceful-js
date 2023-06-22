import React, { CSSProperties, FC, useEffect } from 'react'
import {
  GracefulProvider,
  useGracefulRequest,
  GracefulError,
  gracefulRequest,
  useGraceful,
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
    url: '/api/rate-limit',
    method: 'GET',
  })

  return (
    <>
      <Box sx={containerCSS}>
        {isError && <GracefulError errorComponentID="rate-limit-error" />}
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
