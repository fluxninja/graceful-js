import { ReactNode } from 'react'

export declare type DefaultText<
  K extends string = string,
  V extends ReactNode = string
> = Record<K, V>
