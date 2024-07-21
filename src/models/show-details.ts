import { Episode } from "./episode.js"
import Season from "./season.js"
import { Status } from "./status.js"
import { Tag } from "./tag.js"

export interface ShowDetails {
  id: number
  allanimeId: number
  name: string
  description: string
  episodesCount: number
  episodes: Episode[]
  status?: Status
  progress?: number
  genres: string[]
  tags: Tag[]
  season: Season
  year: number
  banner: string
  format: string
  image: {
    large: string
    medium: string
    original: string
    color?: string
  }
}