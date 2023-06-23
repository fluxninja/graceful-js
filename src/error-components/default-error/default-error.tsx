import { FC } from 'react'
import { DefaultErrorStyled } from './styled'
import { Paper, Typography } from '@mui/material'
import { ErrorIcon } from '../error-icon'
import { useGracefulTheme } from '../../hooks'
import { DefaultText } from '../types'

export type DefaultErrorText = 'message'

export const defaultErrorText: DefaultText<DefaultErrorText, string> = {
  message: 'Something went wrong.',
}

export const DefaultError: FC<{
  text?: DefaultText<DefaultErrorText, string>
}> = ({ text = defaultErrorText }) => {
  const theme = useGracefulTheme()
  return (
    <DefaultErrorStyled component={Paper}>
      <ErrorIcon sx={{ width: '100%', height: 250 }} />
      <Typography
        {...{
          sx: {
            color: theme.secondary,
            fontWeight: '700',
          },
        }}
      >{`${text.message}`}</Typography>
    </DefaultErrorStyled>
  )
}
