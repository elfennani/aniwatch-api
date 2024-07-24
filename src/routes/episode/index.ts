import { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { retry } from "ts-retry-promise";
import decrypt from "../../utils/decrypt.js";
import HlsSource from "../../models/hls-source.js";
import { parse } from "hls-parser";
import { MasterPlaylist } from "hls-parser/types.js";
import EpisodeLink from "../../models/episode-link.js";

const paramsSchema = z.object({
  allanimeId: z.string(),
  episode: z.coerce.number(),
});

const queryParams = z.object({
  type: z.enum(['sub', 'dub']).optional().default('sub'),
})

const M3U8_PROVIDERS = ["Luf-mp4", "Default"];
const MP4_PROVIDERS = ["S-mp4", "Kir", "Sak"];
const PROVIDERS = [...M3U8_PROVIDERS, ...MP4_PROVIDERS];

const episode: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.get('/:allanimeId/:episode', async function (request, reply) {
    console.log("first")
    const { allanimeId, episode } = request.validate(paramsSchema, 'params');
    const { type } = request.validate(queryParams, 'query');
    const client = fastify.getAllAnimeClient();

    console.log({
      allanimeId,
      episode,
      type
    })

    const response: QueryEpisode = await retry(
      () => client.request(query_episode, {
        showId: allanimeId,
        episodeString: episode.toString(),
        translationType: type,
      }),
      { retries: 3 }
    );

    if (!response.episode) {
      throw fastify.httpErrors.notFound("Episode not found")
    }


    const providers = response.episode.sourceUrls
      .filter((url) => PROVIDERS.includes(url.sourceName))
      .reduce(
        (prev, url) => {
          const baseUrl = "https://allanime.day";
          const path = url.sourceUrl.replace("--", "").match(/.{1,2}/g)?.map(decrypt).join("").replace("clock", "clock.json");
          const sourceUrl = baseUrl + path;

          return ({
            ...prev,
            [url.sourceName]: sourceUrl,
          });
        },
        {} as Record<string, string>
      );


    const [hls, mp4] = await Promise.all([getHlsLink(providers), getMp4Link(providers)]);

    return {
      hls,
      mp4,
      dubbed: type === 'dub'
    } satisfies EpisodeLink;
  })
}

export default episode

const getHlsLink = async (providers: Record<string, string>): Promise<HlsSource | undefined> => {
  const provider = Object.keys(providers).find((key) => M3U8_PROVIDERS.includes(key));
  if (!provider) return;
  const source = providers[provider]

  const res = await fetch(source);
  const data: any = await res.json();

  const link = data.links?.[0].link;
  if (!link) return;
  const hlsRes = await fetch(link);
  const hlsData = parse(await hlsRes.text()) as MasterPlaylist
  const variants = hlsData.variants.filter(v => !v.isIFrameOnly);

  const hlsBaseUrl = link.split("/").slice(0, -1).join("/") + "/";

  return {
    originalUrl: link,
    resolutions: variants.reduce((prev, variant) => {
      if (!variant.resolution) return prev;
      return ({
        ...prev,
        [variant.resolution.height]: variant.uri.startsWith("http") ? variant.uri : hlsBaseUrl + variant.uri
      });
    }, {} as Record<string, string>)
  }
}

const getMp4Link = async (providers: Record<string, string>): Promise<string | undefined> => {
  const provider = Object.keys(providers).find((key) => MP4_PROVIDERS.includes(key));
  if (!provider) return;
  const source = providers[provider]

  const res = await fetch(source);
  const data: any = await res.json();

  return data.links?.[0].link || data.links?.[0].src;
}

interface QueryEpisode {
  episode: {
    episodeString: string;
    sourceUrls: { sourceUrl: string; sourceName: string }[];
  };
}

const query_episode = `
  query ($showId: String!, $translationType: VaildTranslationTypeEnumType!, $episodeString: String!) {
    episode(
      showId: $showId
      translationType: $translationType
      episodeString: $episodeString
    ) {
      episodeString
      translationType
      sourceUrls
    }
  }
`;