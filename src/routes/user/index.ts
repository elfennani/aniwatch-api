import { FastifyPluginAsync } from "fastify";
import { graphql } from "gql.tada";
import { z } from "zod";
import { User } from "../../models/user.js";
import { mapUser, userFragment } from "../../fragments/user.js";

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

    return mapUser(user)
  });

  fastify.get("/", async function (request) {
    const client = request.getAnilistClient();
    console.log(`REQUESTING VIEWER`)

    const { user } = await client.request(user_query);

    if (!user) {
      throw fastify.httpErrors.notFound("User not found")
    }

    return mapUser(user)
  })
};

export default userById;

const user_query = graphql(`
  query UserQuery {
    user:Viewer{
      ...UserFragment
    }
  }
`, [userFragment]);