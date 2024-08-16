import { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { Show } from "../../models/show.js";
import { graphql } from "gql.tada";
import { mapStatus } from "../../models/status.js";
import { queryToShow, showFragment } from "../../fragments/show.js";

const paramsSchema = z.object({
  status: z.enum(['watching', 'completed', 'on_hold', 'dropped', 'plan_to_watch', 'repeating']),
});

const querySchema = z.object({
  userId: z.coerce.number().optional(),
})

const showsByStatus: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.get('/:status', async function (request, reply): Promise<Show[]> {
    const { status } = request.validate(paramsSchema, 'params');
    const { userId } = request.validate(querySchema, 'query');
    const client = request.getAnilistClient();

    const id = userId || (await client.request(viewer_query)).Viewer?.id;

    if (!id) {
      throw fastify.httpErrors.unauthorized("You must be logged in");
    }

    try {
      const { collection } = await client.request(media_query, {
        userId: id,
        status: mapStatus(status)!,
        sort: ["UPDATED_TIME_DESC"],
      });

      return collection
        ?.lists
        ?.[0]
        ?.entries
        ?.map((entry) => queryToShow(entry?.media!)) || [];
    } catch (_) {
      throw fastify.httpErrors.internalServerError("Something went wrong");
    }
  })
}

export default showsByStatus

const media_query = graphql(`
  query CompletedQuery($userId: Int!,$status: MediaListStatus!, $sort: [MediaListSort]!) {
    collection:MediaListCollection(
      userId: $userId
      type: ANIME
      status: $status,
      sort: $sort,
    ) {
      lists {
        entries {
          media{
            ...ShowFragment
          }
        }
      }
    }
  }
`, [showFragment]);

const viewer_query = graphql(`
  query ViewerQuery {
    Viewer {
      id
    }
  }
`);