export interface Episode {
  id: string
  allanimeId: string
  animeId: number
  name: string
  episode: number;
  dubbed: boolean
  thumbnail?: string
  duration?: number;
}