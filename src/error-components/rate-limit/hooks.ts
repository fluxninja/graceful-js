import { useGraceful } from '../../hooks'

export type RateLimitScenariosReturn = {
  isRateLimited: boolean
}

export const RATE_LIMITED_STATUS = 429

export const useRateLimitScenarios = (): RateLimitScenariosReturn => {
  const {
    ctx: { isError, status },
  } = useGraceful()

  if (!isError || status !== RATE_LIMITED_STATUS)
    return { isRateLimited: false }

  return { isRateLimited: true }
}
