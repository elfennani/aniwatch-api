import { FastifyPluginAsync } from 'fastify'

const root: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.get('/', async function (request, reply) {
    return fastify.httpErrors.notFound("Request /shows instead")
  })
}

export default root;
