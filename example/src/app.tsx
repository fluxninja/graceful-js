import React, { FC } from 'react'
import {
  GracefulProvider,
  GracefulError,
  useGracefulRequest,
} from '@fluxninja/graceful-js'
import { Box, Button, styled } from '@mui/material'
import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:3009',
})

export const App: FC = () => {
  return (
    <GracefulProvider
      config={{
        axios: api,
        maxBackOffTime: 10,
        maxRequestResolveTime: 8,
      }}
    >
      <TestComponent />
    </GracefulProvider>
  )
}

export declare type RateLimitErrorResponse = {
  message: string
  retryAfter: number
  retryLimit: number
  rateLimitRemaining: number
  rateLimitReset: number
  sentBody: {
    name: string
  }
}

export const TestComponent: FC = () => {
  const { isError, refetch, errorComponent } = useGracefulRequest<
    'Axios',
    RateLimitErrorResponse,
    {
      name: string
    }
  >({
    typeOfRequest: 'Axios',
    requestFnc: (data) =>
      api({
        url: '/api/rate-limit',
        method: 'POST',
        data,
      }),
    options: {
      disabled: true,
    },
  })
  const { isError: pingError } = useGracefulRequest<'Axios'>({
    typeOfRequest: 'Axios',
    requestFnc: () => api.get('api/ping'),
  })

  const { errorComponent: waitRoomError } = useGracefulRequest<'Axios'>({
    typeOfRequest: 'Axios',
    requestFnc: () => api.get('api/wait-room'),
  })

  return (
    <>
      <GridBox>
        <ColumnBox>
          <Button
            variant="contained"
            color="primary"
            onClick={() =>
              refetch({
                name: 'graceful-js',
              })
            }
          >
            Fetch Rate Limit
          </Button>
        </ColumnBox>
        <ColumnBox>{isError && errorComponent}</ColumnBox>
      </GridBox>
      <ColumnBox>
        {pingError && (
          <GracefulError
            {...{
              url: 'http://localhost:3009/api/ping',
              method: 'GET',
            }}
          />
        )}
      </ColumnBox>
      <ColumnBox>{waitRoomError}</ColumnBox>
    </>
  )
}

const ColumnBox = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: 500,
})

const GridBox = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gridGap: theme.spacing(2),
  width: '100%',
  [theme.breakpoints.down('sm')]: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
}))
