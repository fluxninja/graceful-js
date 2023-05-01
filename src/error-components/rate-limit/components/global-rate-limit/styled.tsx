import { Box } from '@mui/material'
import { styled } from '@mui/material/styles'

export const GlobalRateLimitStyled = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  gap: theme.spacing(3),
}))
