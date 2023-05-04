import React, { FC, PropsWithChildren, useEffect, useState } from 'react'
import { useGracefulTheme } from '../../../../hooks'
import { Box, Typography } from '@mui/material'
import { DefaultText } from '../../../types'

export interface CountDownProps {
  seconds: number
  retriesLeft?: number
  text?: DefaultText<CountDownText>
}

type CountDownText = 'wait' | 'seconds' | 'down'

export const defaultCountDownText: DefaultText<CountDownText> = {
  wait: 'Your estimated wait is',
  seconds: 'seconds...',
  down: 'Currently, app is down. Please try again later.',
}

export const CountDown: FC<PropsWithChildren<CountDownProps>> = ({
  seconds,
  retriesLeft = 0,
  text = defaultCountDownText,
}) => {
  const theme = useGracefulTheme()

  const [timeLeft, setTimeLeft] = useState(seconds)

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
            {text.wait}
          </Typography>
          <Typography
            {...{
              fontSize: 24,
              fontWeight: '800',
              textAlign: 'center',
              sx: { color: theme.primary },
            }}
          >
            {`${timeLeft} ${text.seconds}`}
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
          {text.down}
        </Typography>
      )}
    </Box>
  )
}
