import React, { FC } from 'react'
import {
  GracefulProvider,
  useGracefulRequest,
} from '@fluxninja-tools/graceful-js'
import { Box } from '@mui/material'

export const App: FC = () => {
  return (
    <GracefulProvider>
      <TestComponent />
    </GracefulProvider>
  )
}

export const TestComponent: FC = () => {
  const response = useGracefulRequest<'Axios'>({
    typeOfRequest: 'Axios',
    url: '/api/rate-limit',
    method: 'GET',
  })
  return <Box>{JSON.stringify(response)}</Box>
}
