export interface Episode {
  id: string
  allanimeId: string
  animeId: number
  episode: number;
  name: string
  dubbed: boolean
  thumbnail?: string
  duration?: number;
}