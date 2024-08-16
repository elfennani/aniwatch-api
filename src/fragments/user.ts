import { FragmentOf, graphql } from "gql.tada";
import { User } from "../models/user.js";

export const userFragment = graphql(`
  fragment UserFragment on User @_unmask {
    id
    name
    bannerImage
    about(asHtml: true)
    avatar{
      large
      medium
    }
    statistics{
      anime{
        count
        meanScore
        episodesWatched
      }
      manga{
        count
        meanScore
        chaptersRead
      }
    }
  }
`)

export const mapUser = (user: FragmentOf<typeof userFragment>): User => {
  return {
    id: user.id,
    name: user.name,
    banner: user.bannerImage ?? undefined,
    icon: user.avatar?.large ?? undefined,
    icon_large: user.avatar?.medium ?? undefined,
    bio: user.about ?? undefined,
    anime_watched: user.statistics?.anime?.count ?? 0,
    anime_days_watched: user.statistics?.anime?.episodesWatched ?? 0,
    anime_mean_score: user.statistics?.anime?.meanScore ?? 0,
    manga_read: user.statistics?.manga?.count ?? 0,
    manga_chapters_read: user.statistics?.manga?.chaptersRead ?? 0,
    manga_mean_score: user.statistics?.manga?.meanScore ?? 0
  }
}