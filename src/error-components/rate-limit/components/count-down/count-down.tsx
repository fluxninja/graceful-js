import React, { FC, PropsWithChildren, useEffect, useState } from 'react'
import { useGraceful, useGracefulTheme } from '../../../../hooks'
import { Box, Typography } from '@mui/material'

export interface CountDownProps {
  seconds: number
  retriesLeft?: number
}

export const CountDown: FC<PropsWithChildren<CountDownProps>> = ({
  seconds,
  retriesLeft = 0,
}) => {
  const theme = useGracefulTheme()

  const [timeLeft, setTimeLeft] = useState(seconds)

  useEffect(() => {
    setTimeLeft(seconds)
  }, [seconds])

  useEffect(() => {
    if (!retriesLeft) return
    setTimeLeft(seconds)
  }, [retriesLeft])

  useEffect(() => {
    if (!timeLeft) {
      return
    }
    const intervalId = setInterval(() => {
      setTimeLeft(timeLeft - 1)
    }, 1000)

    return () => clearInterval(intervalId)
  }, [timeLeft])

  return (
    <Box>
      {timeLeft ? (
        <>
          <Typography
            {...{
              fontSize: 16,
              fontWeight: '400',
            }}
          >
            {`Your estimated wait is`}
          </Typography>
          <Typography
            {...{
              fontSize: 24,
              fontWeight: '800',
              textAlign: 'center',
              sx: { color: theme.primary },
            }}
          >
            {`${timeLeft} seconds...`}
          </Typography>
        </>
      ) : (
        <Typography
          {...{
            fontSize: 16,
            fontWeight: '400',
            sx: { color: theme.secondary },
          }}
        >
          {`Currently, app is down. Please try again later.`}
        </Typography>
      )}
    </Box>
  )
}
