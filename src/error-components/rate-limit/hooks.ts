import { useGracefulContext } from '../../hooks'

export type RateLimitScenariosReturn = {
  isRateLimited: boolean
}

export const RATE_LIMITED_STATUS = 429

export const useRateLimitScenarios = (): RateLimitScenariosReturn => {
  const { isError, status } = useGracefulContext()

  if (!isError || status !== RATE_LIMITED_STATUS)
    return { isRateLimited: false }

  return { isRateLimited: true }
}
