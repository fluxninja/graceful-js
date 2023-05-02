import {
  Dialog,
  DialogProps,
  Paper,
  Typography,
  TypographyProps,
} from '@mui/material'
import React, { FC, PropsWithChildren, ReactNode, useMemo } from 'react'
import { GlobalRateLimitStyled } from './styled'
import { ErrorIcon } from '../../../error-icon'
import { useGraceful, useGracefulTheme } from '../../../../hooks'
import { DefaultText } from '../../../types'
import { CountDown } from '../count-down'

export declare type GlobalRateLimitText = 'sorry' | 'message' | 'thankYou'

export const defaultGlobalRateLimitText: DefaultText<
  GlobalRateLimitText,
  ReactNode
> = {
  sorry: `We’re sorry`,
  message: (
    <>
      Our site is currently experiencing heavy traffic.
      <b> Please wait in line for a few seconds </b>while we work to get
      everything up and running smoothly.
    </>
  ),
  thankYou: `Thank you for your patience.`,
}

export interface GlobalRateLimitProps {
  dialogProps: DialogProps
  retryAfter: number
  text?: DefaultText<GlobalRateLimitText, ReactNode>
}

export const GlobalRateLimit: FC<PropsWithChildren<GlobalRateLimitProps>> = ({
  dialogProps,
  retryAfter,
  text = defaultGlobalRateLimitText,
}) => {
  const theme = useGracefulTheme()
  const {
    ctx: { retriesLeft },
  } = useGraceful()
  return (
    <Dialog
      {...{
        ...dialogProps,
        PaperComponent: Paper,
        maxWidth: 'sm',
        PaperProps: {
          sx: { p: 3 },
        },
      }}
    >
      <GlobalRateLimitStyled>
        <ErrorIcon htmlColor={theme.primary} sx={{ width: 450, height: 350 }} />
        <Typography
          {...{
            fontSize: 36,
            fontWeight: '700',
          }}
        >
          {text.sorry}
        </Typography>
        <Typography {...typographyCommonProps}>{text.message}</Typography>
        <CountDown seconds={retryAfter} retriesLeft={retriesLeft} />
        <Typography {...typographyCommonProps}>{text.thankYou}</Typography>
      </GlobalRateLimitStyled>
    </Dialog>
  )
}

export const typographyCommonProps: TypographyProps = {
  fontSize: 16,
  fontWeight: '400',
  sx: {
    width: '90%',
    margin: '0 auto',
    textAlign: 'center',
  },
}

export const ApplyGlobalRateLimitError: FC<PropsWithChildren> = ({
  children,
}) => {
  const {
    ctx: { status, responseBody, headers },
  } = useGraceful()
  const isGlobalRateLimited = useMemo(() => {
    if (status !== 429) {
      return false
    }

    return (
      responseBody?.global === true ||
      headers?.['x-ratelimit-global'] === 'true'
    )
  }, [headers, responseBody, status])

  const retryAfter = useMemo(() => {
    if (!isGlobalRateLimited) return 0
    const retryAfterHeader = headers?.['retry-after']
    const retryAfterBody = responseBody?.retryAfter

    return retryAfterBody || parseInt(retryAfterHeader) || 0
  }, [headers, responseBody, isGlobalRateLimited])

  return (
    <>
      <GlobalRateLimit
        {...{
          dialogProps: {
            open: isGlobalRateLimited,
          },
          retryAfter,
        }}
      />
      {!isGlobalRateLimited && children}
    </>
  )
}
