import fp from 'fastify-plugin'
import { GraphQLClient } from 'graphql-request';

export default fp(async (fastify, opts) => {
  fastify.decorate('getAllAnimeClient', function () {
    const headers = new Headers();
    headers.append("Referer", "https://allanime.to")
    headers.append("Agent", 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0')

    return new GraphQLClient("https://api.allanime.day/api", { headers });
  })
})

declare module 'fastify' {
  export interface FastifyInstance {
    getAllAnimeClient(): GraphQLClient;
  }
}
