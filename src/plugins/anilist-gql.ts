import fp from 'fastify-plugin'
import { GraphQLClient } from 'graphql-request';

export interface SupportPluginOptions {
  headers?: Record<string, string>
}

export default fp<SupportPluginOptions>(async (fastify, opts) => {
  fastify.decorateRequest('getAnilistClient', function () {
    const headers = {
      ...opts.headers,
      Authorization: this.headers.authorization,
    };

    return new GraphQLClient("https://graphql.anilist.co", { headers });
  })
})

declare module 'fastify' {
  export interface FastifyRequest {
    getAnilistClient(): GraphQLClient;
  }
}
