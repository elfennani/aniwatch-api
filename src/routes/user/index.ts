import { FastifyPluginAsync } from "fastify";
import { graphql } from "gql.tada";
import { z } from "zod";
import { User } from "../../models/user.js";

const params = z.object({
  id: z.coerce.number(),
});

const userById: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.get("/:id", async function (request, reply): Promise<User> {
    const { id } = request.validate(params, "params");
    const client = request.getAnilistClient();
    console.log(`REQUESTING USER (${id})`)

    const { user } = await client.request(user_query, { id });

    if (!user) {
      throw fastify.httpErrors.notFound("User not found")
    }

    return {
      id,
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
  });
};

export default userById;

const user_query = graphql(`
  query UserQuery($id: Int!) {
    user:User(id:$id){
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
  }
`);