import { FragmentOf, graphql } from "gql.tada";
import { Character } from "../models/character.js";

export const characterFragment = graphql(`
  fragment CharacterFragment on CharacterEdge @_unmask{
    id
    name
    role
    voiceActors{
      id
      image {
        medium
      }
      name{
        userPreferred
      }
      languageV2
    }
    node {
      id
      image {
        large
        medium
      }
      name {
        userPreferred
      }
    }
  }
`);

export const formatCharacter = (character: FragmentOf<typeof characterFragment>): Character => {
  return {
    id: character.id!,
    name: character.node?.name?.userPreferred!,
    image: character.node?.image?.large || undefined,
    image_sd: character.node?.image?.medium || undefined,
    role: character.role!,
    voice_actors: character.voiceActors?.map(va => ({
      id: va?.id!,
      image: va?.image?.medium ?? undefined,
      language: va?.languageV2 ?? undefined,
      name: va?.name?.userPreferred!,
    } satisfies Character["voice_actors"][0])) ?? []
  }
}