import { FastifyPluginAsync, RouteGenericInterface } from "fastify";
import { z } from "zod";
import { Show } from "../../models/show.js";
import { graphql } from "gql.tada";
import { mapStatus } from "../../models/status.js";
import { queryToShow, showFragment } from "../../fragments/show.js";

interface IRoute extends RouteGenericInterface {
  Params: {
    status: string,
  },
  Querystring: {
    page?: string
  }
}

const paramsSchema = z.object({
  status: z.enum(['watching', 'completed', 'on_hold', 'dropped', 'plan_to_watch', 'repeating']),
});

const querySchema = z.object({
  page: z.coerce.number().optional().default(1),
  userId: z.coerce.number().optional(),
  all: z.coerce.boolean().optional().default(false),
})

const showsByStatus: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.get<IRoute>('/:status', async function (request, reply): Promise<Show[]> {
    const { status } = request.validate(paramsSchema, 'params');
    const { page, userId, all } = request.validate(querySchema, 'query');
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
        chunk: all ? 1 : page,
        perChunk: all ? 500 : 20
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
  query CompletedQuery($userId: Int!,$status: MediaListStatus!, $sort: [MediaListSort]!, $chunk:Int, $perChunk: Int) {
    collection:MediaListCollection(
      userId: $userId
      type: ANIME
      status: $status,
      sort: $sort,
      chunk: $chunk,
      perChunk: $perChunk,
      forceSingleCompletedList: false,
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