import fp from 'fastify-plugin';
import { z } from 'zod';

export interface SupportPluginOptions {
  headers?: Record<string, string>
}

export default fp<SupportPluginOptions>(async (fastify, opts) => {
  fastify.decorateRequest('validate', function (schema, type: "query" | "body" | "params") {
    let data = this.params;

    if (type === "query") {
      data = this.query
    } else if (type === "body") {
      data = this.body
    }

    const parsed = schema.safeParse(data);
    if (parsed.error) {
      throw fastify.httpErrors.badRequest(JSON.stringify(parsed.error));
    }

    return parsed.data
  })
})

declare module 'fastify' {
  export interface FastifyRequest {
    validate<T extends z.ZodType>(schema: T, type: "query" | "body" | "params"): z.infer<T>;
  }
}
