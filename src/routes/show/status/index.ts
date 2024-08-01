import { FastifyPluginAsync } from "fastify";
import { graphql } from "gql.tada";
import { z } from "zod";
import { StatusDetails, statusDetailsSchema } from "../../../models/status-details.js";
import { mapStatus, reverseMapStatus } from "../../../models/status.js";

const paramsSchema = z.object({
  id: z.coerce.number(),
});

const bodySchema = z.object({
  data: statusDetailsSchema,
})

const showStatusByID: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.get("/:id", async function (request, reply): Promise<StatusDetails> {
    const { id } = request.validate(paramsSchema, "params");
    const client = request.getAnilistClient();

    const { media } = await client.request(media_query, { id });

    let startedAt: StatusDetails["startedAt"] = undefined;
    let completedAt: StatusDetails["completedAt"] = undefined;

    if (
      media?.mediaListEntry?.startedAt &&
      Object.values(media.mediaListEntry.startedAt).some((value) => value !== null)
    ) {
      startedAt = {
        year: media?.mediaListEntry?.startedAt?.year!,
        month: media?.mediaListEntry?.startedAt?.month!,
        day: media?.mediaListEntry?.startedAt?.day!
      }
    }

    if (
      media?.mediaListEntry?.completedAt &&
      Object.values(media.mediaListEntry.completedAt).some((value) => value !== null)
    ) {
      completedAt = {
        year: media?.mediaListEntry?.completedAt?.year!,
        month: media?.mediaListEntry?.completedAt?.month!,
        day: media?.mediaListEntry?.completedAt?.day!
      }
    }

    return {
      status: reverseMapStatus(media?.mediaListEntry?.status ?? undefined),
      score: media?.mediaListEntry?.score ?? 0,
      progress: media?.mediaListEntry?.progress ?? 0,
      favorite: media?.isFavourite ?? false,
      startedAt,
      completedAt
    }
  });
  fastify.post("/:id", async function (request, reply) {
    const { id } = request.validate(paramsSchema, "params");
    const { data } = request.validate(bodySchema, "body");

    const client = request.getAnilistClient();

    await client.request(update_status_query, {
      ...data,
      status: mapStatus(data.status),
      mediaId: id
    });
  })
};

export default showStatusByID;

const update_status_query = graphql(`
  mutation UPDATE_STATUS(
    $progress:Int,
    $mediaId:Int!, 
    $status: MediaListStatus, 
    $score:Float, 
    $startedAt: FuzzyDateInput, 
    $completedAt: FuzzyDateInput
  ){
    SaveMediaListEntry(
      mediaId: $mediaId, 
      progress: $progress, 
      status: $status,
      score: $score, 
      startedAt: $startedAt, 
      completedAt: $completedAt
    ){
      id
    }
  }
`);

const media_query = graphql(`
  query GetMedia($id: Int) {
    media: Media(id: $id) {
      isFavourite
      mediaListEntry {
        status
        score
        progress
        startedAt {
          year
          month
          day
        }
        completedAt {
          year
          month
          day
        }
      }
    }
  }
`);