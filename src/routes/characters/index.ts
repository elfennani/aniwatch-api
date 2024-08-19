import { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { graphql } from "gql.tada";
import { formatResource, pageInfoFragment } from "../../fragments/page-info.js";
import { Resource } from "../../models/paging-resource.js";
import { characterFragment, formatCharacter } from "../../fragments/character.js";
import { Character } from "../../models/character.js";

const params = z.object({
  showId: z.coerce.number()
})

const searchParams = z.object({
  page: z.coerce.number().default(1),
})

const characters: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.get('/:showId', async function (request, reply): Promise<Resource<Character>> {
    const { showId } = request.validate(params, "params")
    const { page } = request.validate(searchParams, 'query');
    const client = request.getAnilistClient();

    try {
      const { media } = await client.request(media_query, { page, id: showId });

      return formatResource(
        media?.characters?.pageInfo!,
        media?.characters?.edges?.map((character) => formatCharacter(character!)) || []
      );
    } catch (_) {
      throw fastify.httpErrors.internalServerError("Something went wrong");
    }
  })
}

export default characters

const media_query = graphql(`
  query GetCharacters($id: Int!, $page: Int!) {
    media:Media(id: $id){
      characters(page: $page,perPage: 25,sort: [ROLE]){
        edges{
          ...CharacterFragment
        }
        pageInfo{
          ...PageInfoFragment
        }
      }
    }
  }
`, [pageInfoFragment, characterFragment]);