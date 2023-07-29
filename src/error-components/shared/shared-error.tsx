import React, { FC, PropsWithChildren } from 'react'
import { SharedErrorGrid, SharedErrorWrapper } from './styled'
import { Paper, Typography, TypographyProps } from '@mui/material'
import { ErrorIcon } from '../error-icon'
import { useGracefulTheme } from '../../hooks'
import { DefaultText } from '../types'

type SharedErrorText = 'sorry' | 'errorMessage' | 'message' | 'backSoon'

export interface SharedErrorProps {
  text: DefaultText<SharedErrorText>
}

export const SharedError: FC<PropsWithChildren<SharedErrorProps>> = ({
  children,
  text,
}) => {
  const theme = useGracefulTheme()

  const commonCss: TypographyProps = {
    sx: {
      color: theme.text,
    },
  }

  return (
    <SharedErrorWrapper
      component={Paper}
      sx={{
        boxShadow: `0px 4px 4px rgba(0, 0, 0, 0.25)`,
      }}
    >
      <SharedErrorGrid>
        <ErrorIcon htmlColor={theme.primary} sx={{ width: 200, height: 125 }} />
        <SharedErrorWrapper>
          <Typography
            {...{
              ...commonCss,
              fontSize: 24,
              fontWeight: '700',
              lineHeight: '29px',
            }}
          >
            {text.sorry}
          </Typography>
          <Typography
            {...{
              ...commonCss,
              fontSize: 16,
              fontWeight: '600',
              lineHeight: '130%',
              sx: ({ palette }) => ({
                color: palette.error.main,
              }),
            }}
          >
            {text.errorMessage}
          </Typography>
        </SharedErrorWrapper>
      </SharedErrorGrid>

      <SharedErrorWrapper>
        <Typography
          {...{
            ...commonCss,
            fontSize: 16,
            fontWeight: '400',
            lineHeight: '130%',
          }}
        >
          {text.message}
        </Typography>
        <Typography
          {...{
            ...commonCss,
            fontSize: 16,
            fontWeight: '400',
            lineHeight: '130%',
            color: theme.secondary,
          }}
        >
          {children}
        </Typography>
        <Typography
          {...{
            ...commonCss,
            fontSize: 16,
            fontWeight: '400',
            lineHeight: '130%',
          }}
        >
          {text.backSoon}
        </Typography>
      </SharedErrorWrapper>
    </SharedErrorWrapper>
  )
}
