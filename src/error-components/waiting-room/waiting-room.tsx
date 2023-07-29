import React, { FC, useEffect, useState } from 'react'
import { maxRequestResolveTime } from '../../provider'
import { SharedError } from '../shared'
import { DefaultText } from '../types'
import { useGraceful } from '../../hooks'

type WaitingRoomText = 'sorry' | 'errorMessage' | 'message' | 'backSoon'

export const defaultWaitingRoomText: DefaultText<WaitingRoomText> = {
  sorry: `We’re sorry`,
  errorMessage: `Our site is currently experiencing heavy traffic.`,
  message: `You are in the waiting queue. Our team is working diligently to serve each user one by one. Thank you for your patience.`,
  backSoon: `We will be fully back soon`,
}

export interface WaitingRoomProps {
  isLoading: boolean
  text?: DefaultText<WaitingRoomText>
}

export const WaitingRoom: FC<WaitingRoomProps> = ({
  isLoading,
  text = defaultWaitingRoomText,
}) => {
  const { showError } = useWaitingRoom(isLoading)
  const { WaitingRoomErrorComponent } = useGraceful()

  return (
    <>
      {showError
        ? WaitingRoomErrorComponent || <SharedError text={text} />
        : null}
    </>
  )
}

export const useWaitingRoom = (isLoading: boolean) => {
  const [showError, setShowError] = useState(false)

  useEffect(() => {
    if (!isLoading) {
      setShowError(false)
      return
    }

    const timeout = setTimeout(() => {
      setShowError(true)
    }, maxRequestResolveTime * 1000)

    return () => {
      clearTimeout(timeout)
    }
  }, [isLoading])

  return { showError }
}
