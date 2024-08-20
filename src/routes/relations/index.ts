import {FastifyPluginAsync} from "fastify";
import {z} from "zod";
import {graphql} from "gql.tada";
import {formatRelations, relationFragment} from "../../fragments/relation.js";
import {Relation} from "../../models/relation.js";

const params = z.object({
    showId: z.coerce.number()
})

const relations: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
    fastify.get('/:showId', async function (request, reply): Promise<Relation[]> {
        const { showId } = request.validate(params, "params")
        const client = request.getAnilistClient();

        try {
            const { media } = await client.request(media_query, { id: showId });

            return media?.relations?.edges?.map(edge => formatRelations(edge!!)) ?? [];
        } catch (e) {
            console.error(e)
            throw fastify.httpErrors.internalServerError("Something went wrong");
        }
    })
}

export default relations

const media_query = graphql(`
    query($id: Int!) {
        media:Media(id: $id){
            relations {
                edges {
                    ...RelationFragment
                }
            }
        }
    }
`, [relationFragment])