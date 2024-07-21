export interface Tag {
  id: number
  label: string
  percentage: number
  spoiler: boolean
}

type AniListTag = ({
  id: number;
  name: string;
  description: string | null;
  rank: number | null;
  isMediaSpoiler: boolean | null;
  isGeneralSpoiler: boolean | null;
} | null)

export const mapAniListTag = (tag: AniListTag): Tag => {
  if (!tag) {
    throw new Error('Tag not found')
  }
  return {
    id: tag.id,
    label: tag.name,
    percentage: tag.rank || 0,
    spoiler: tag.isMediaSpoiler || tag.isGeneralSpoiler || false
  }
}