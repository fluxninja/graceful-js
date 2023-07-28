import React, { FC } from 'react'
import {
  GracefulProvider,
  GracefulError,
  useGracefulRequest,
} from '@fluxninja-tools/graceful-js'
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
        maxBackOffTime: 20,
      }}
    >
      <TestComponent />
    </GracefulProvider>
  )
}

export const TestComponent: FC = () => {
  const { isError, refetch } = useGracefulRequest<'Axios'>({
    typeOfRequest: 'Axios',
    requestFnc: () => api.get('/api/rate-limit'),
    options: {
      disabled: true,
    },
  })
  const { isError: pingError } = useGracefulRequest<'Axios'>({
    typeOfRequest: 'Axios',
    requestFnc: () => api.get('api/ping'),
  })

  return (
    <>
      <GridBox>
        <ColumnBox>
          <Button variant="contained" color="primary" onClick={() => refetch()}>
            Fetch Rate Limit
          </Button>
        </ColumnBox>
        <ColumnBox>
          {isError && (
            <GracefulError
              {...{
                url: 'http://localhost:3009/api/rate-limit',
                method: 'GET',
                // requestBody: {},
              }}
            />
          )}
        </ColumnBox>
      </GridBox>
      <ColumnBox>
        {pingError && (
          <GracefulError
            {...{
              url: 'http://localhost:3009/api/ping',
              method: 'GET',
              requestBody: '',
            }}
          />
        )}
      </ColumnBox>
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
