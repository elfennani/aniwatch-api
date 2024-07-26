import { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { graphql } from "gql.tada";
import { fetchViewerId } from "../../request/fetch-viewer.js";
import { Activity } from "../../models/activity.js";


const paramsSchema = z.object({
  page: z.coerce.number(),
});

const querySchema = z.object({
  userId: z.coerce.number().optional(),
})

const showsByStatus: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.get('/:page', async function (request, reply): Promise<Activity[]> {
    const { page } = request.validate(paramsSchema, 'params');
    const { userId } = request.validate(querySchema, 'query');
    const client = request.getAnilistClient();

    const id = userId || (await fetchViewerId(client));

    if (!id) {
      throw fastify.httpErrors.unauthorized("You must be logged in");
    }

    try {
      const { activitiesPage } = await client.request(feed_query, {
        page,
        userId: id
      });

      console.log(activitiesPage)

      return activitiesPage?.activities
        ?.filter((activity) => activity?.__typename == "TextActivity" || activity?.__typename == "ListActivity")
        ?.map((activity): Activity => {
          if (activity?.__typename == "ListActivity") {
            let content = [activity.status, activity.progress, activity.media?.title?.userPreferred]

            return {
              id: activity.id,
              content: content.filter(Boolean).join(" "),
              type: "LIST",
              user_id: activity.userId!,
              user_name: activity.user?.name!,
              user_avatar: activity.user?.avatar?.medium!,
              created_at: new Date(activity.createdAt),
              likes: activity.likeCount,
              replies: activity.replyCount,
              show: {
                id: activity.media?.id!,
                name: activity.media?.title?.userPreferred!,
                image: activity.media?.coverImage?.large!,
              }
            }
          }

          if (activity?.__typename == "TextActivity") {
            return {
              id: activity.id,
              content: activity.text!,
              type: "LIST",
              user_id: activity.userId!,
              user_name: activity.user?.name!,
              user_avatar: activity.user?.avatar?.medium!,
              created_at: new Date(activity.createdAt),
              likes: activity.likeCount,
              replies: activity.replyCount,
            }
          }

          throw new Error("Unknown activity type");
        }) || [];
    } catch (_) {
      throw fastify.httpErrors.internalServerError("Something went wrong");
    }
  })
}

export default showsByStatus

const feed_query = graphql(`
  query FeedQuery($page: Int!, $userId: Int!) {
    activitiesPage:Page(page: $page,perPage: 25) {
      activities(userId:$userId,sort: [PINNED,ID_DESC]) {
        __typename
        ... on TextActivity {
          id
          text
          createdAt
          likeCount
          userId
          replyCount
          user{
            name
            avatar{
              medium
            }
          }
        }
        ... on ListActivity {
          id
          createdAt
          likeCount
          userId
          replyCount
          user{
            name
            avatar{
              medium
            }
          }
          media {
            id
            type
            title {
              userPreferred
            }
            seasonYear
            coverImage{
              large
            }
          }
          status
          progress
        }
      }
    }
  }
`);