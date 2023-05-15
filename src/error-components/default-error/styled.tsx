import { Box, styled } from '@mui/material'

export const DefaultErrorStyled = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: theme.spacing(3),
  maxWidth: 564,
  minHeight: 500,
  boxShadow: `0px 4px 4px rgba(0, 0, 0, 0.25)`,
}))
