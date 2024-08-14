import { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { Show } from "../../models/show.js";
import { graphql } from "gql.tada";
import { queryToShow, showFragment } from "../../fragments/show.js";
import { formatResource, pageInfoFragment } from "../../fragments/page-info.js";
import { Resource } from "../../models/paging-resource.js";

const searchParams = z.object({
  query: z.string(),
  page: z.coerce.number().default(1),
})

const search: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.get('/', async function (request, reply): Promise<Resource<Show>> {
    const { query, page } = request.validate(searchParams, 'query');
    const client = request.getAnilistClient();

    try {
      const { anime } = await client.request(media_query, { page, query });

      return formatResource(anime?.pageInfo!, anime
        ?.media
        ?.map((media) => queryToShow(media!)) || []);
    } catch (_) {
      throw fastify.httpErrors.internalServerError("Something went wrong");
    }
  })
}

export default search

const media_query = graphql(`
  query SeachQuery($query: String!, $page: Int!) {
    anime: Page(perPage: 8, page: $page) {
      media(
        type: ANIME,
        search: $query,
        isAdult: false,
        sort: POPULARITY_DESC
      ) {
        ...ShowFragment
      }
      pageInfo{
        ...PageInfoFragment
      }
    }
  }
`, [pageInfoFragment, showFragment]);