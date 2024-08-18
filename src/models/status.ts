import { z } from "zod";

export const statusSchema = z.enum(['watching', 'completed', 'on_hold', 'dropped', 'plan_to_watch', 'repeating'])

export type Status = z.infer<typeof statusSchema>

export const mapStatus = (status: Status | undefined | null) => {
  switch (status) {
    case 'watching':
      return 'CURRENT'
    case 'completed':
      return 'COMPLETED'
    case 'plan_to_watch':
      return 'PLANNING'
    case 'dropped':
      return 'DROPPED'
    case 'on_hold':
      return 'PAUSED'
    case 'repeating':
      return 'REPEATING'
    default:
      return undefined
  }
}

export const reverseMapStatus = (status: string | undefined | null) => {
  switch (status) {
    case 'CURRENT':
      return 'watching'
    case 'COMPLETED':
      return 'completed'
    case 'PLANNING':
      return 'plan_to_watch'
    case 'DROPPED':
      return 'dropped'
    case 'PAUSED':
      return 'on_hold'
    case 'REPEATING':
      return 'repeating'
  }
}