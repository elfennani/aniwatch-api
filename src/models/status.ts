import { z } from "zod";

export const statusSchema = z.enum(['watching', 'completed', 'on_hold', 'dropped', 'plan_to_watch', 'repeating'])

export type Status = z.infer<typeof statusSchema>

export const mapStatus = (status: Status) => {
  switch (status) {
    case 'watching':
      return 'CURRENT'
    case 'completed':
      return 'COMPLETED'
    case 'on_hold':
      return 'PLANNING'
    case 'dropped':
      return 'DROPPED'
    case 'plan_to_watch':
      return 'PAUSED'
    case 'repeating':
      return 'REPEATING'
  }
}

export const reverseMapStatus = (status: string | undefined | null) => {
  switch (status) {
    case 'CURRENT':
      return 'watching'
    case 'COMPLETED':
      return 'completed'
    case 'PLANNING':
      return 'on_hold'
    case 'DROPPED':
      return 'dropped'
    case 'PAUSED':
      return 'plan_to_watch'
    case 'REPEATING':
      return 'repeating'
  }
}