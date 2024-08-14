import { FragmentOf, graphql } from "gql.tada";
import { Show } from "../models/show.js";
import { reverseMapStatus } from "../models/status.js";

export const showFragment = graphql(`
  fragment ShowFragment on Media @_unmask{
    id
    title {
      userPreferred
    }
    episodes
    description
    coverImage {
      extraLarge
      medium
      large
      color
    }
    mediaListEntry{
      progress
      status
    } 
  }
`);

export const queryToShow = (data: FragmentOf<typeof showFragment>): Show => {
  return {
    id: data?.id!,
    name: data?.title?.userPreferred!,
    description: data?.description!,
    episodes: data?.episodes!,
    progress: data?.mediaListEntry?.progress || undefined,
    status: reverseMapStatus(data?.mediaListEntry?.status || undefined),
    image: {
      large: data?.coverImage?.large!,
      color: data?.coverImage?.color || undefined,
      medium: data?.coverImage?.medium!,
      original: data?.coverImage?.extraLarge!,
    },
  }
}