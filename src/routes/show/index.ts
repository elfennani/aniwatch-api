import { FastifyPluginAsync } from "fastify"
import { graphql } from "gql.tada"
import { z } from "zod"
import { ShowDetails } from "../../models/show-details.js"
import { mapAniListTag } from "../../models/tag.js"
import { reverseMapStatus } from "../../models/status.js"
import { Episode } from "../../models/episode.js"
import { retry } from "ts-retry-promise"

const paramsSchema = z.object({
  id: z.coerce.number(),
})

const showByID: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.get('/:id', async function (request, reply): Promise<ShowDetails> {
    const { id } = request.validate(paramsSchema, 'params');
    const client = request.getAnilistClient();
    const allanime = fastify.getAllAnimeClient();

    const { media } = await client.request(media_query, { id });

    const search = media?.title?.userPreferred
    let episodes: Episode[] = [];
    let showId: string | undefined;

    const showSearch: ShowQuery = await retry(
      () => allanime.request(show_query, { search }),
      { retries: 3 }
    )
    const show = showSearch!!.shows.edges?.find(
      (show) => show.aniListId == id
    );

    showId = show?._id

    if (show && showId) {
      const max = show.availableEpisodesDetail.sub.length

      const allAnimeEpisodes: AllAnimeEpisodes = await retry(
        () => allanime.request(episodes_details_query, { showId, max }),
        { retries: 3 }
      );

      episodes = allAnimeEpisodes.episodeInfos.map(ep => ({
        id: ep._id,
        allanimeId: showId,
        animeId: id,
        episode: ep.episodeIdNum,
        name: `Ep ${ep.episodeIdNum}`,
        thumbnail: ep.thumbnails
          ?.filter((t) => !t.includes("cdnfile"))
          ?.map(t => t.startsWith("http") ? t : (source + t))?.[0],
        duration: ep.vidInforssub?.vidDuration,
        dubbed: show?.availableEpisodesDetail.dub.includes(String(ep.episodeIdNum)) ?? false
      })) ?? [];

      episodes = show.availableEpisodesDetail.sub.map(ep => {
        const details = allAnimeEpisodes.episodeInfos.find(info => info.episodeIdNum.toString() === ep);

        return ({
          id: details?._id ?? `EP-${ep}`,
          allanimeId: showId,
          animeId: id,
          episode: details?.episodeIdNum ?? Number(ep),
          name: `Ep ${ep}`,
          thumbnail: details?.thumbnails
            ?.filter((t) => !t.includes("cdnfile"))
            ?.map(t => t.startsWith("http") ? t : (source + t))?.[0],
          duration: details?.vidInforssub?.vidDuration,
          dubbed: show.availableEpisodesDetail.dub.includes(String(ep)) ?? false
        })
      })
    }


    return {
      id: media?.id!,
      allanimeId: showId!,
      name: media?.title?.userPreferred!,
      description: media?.description!,
      episodesCount: media?.episodes!,
      episodes,
      status: reverseMapStatus(media?.mediaListEntry?.status),
      progress: media?.mediaListEntry?.progress || undefined,
      genres: (media?.genres?.filter(Boolean) as string[] | undefined) || [],
      tags: media?.tags?.map(mapAniListTag) || [],
      season: media?.season!,
      year: media?.seasonYear!,
      banner: media?.bannerImage!,
      format: media?.format!,
      image: {
        large: media?.coverImage?.large!,
        medium: media?.coverImage?.medium!,
        original: media?.coverImage?.extraLarge!,
        color: media?.coverImage?.color || undefined
      }
    }
  })
}

export default showByID

const media_query = graphql(`
  query GetMedia($id: Int) {
    media:Media(id: $id) {
      id
      genres
      episodes
      description
      bannerImage
      seasonYear
      season
      format
      title {
        userPreferred
      }
      coverImage {
        extraLarge
        medium
        large
        color
      }
      mediaListEntry{
        progress
        status
      }
      tags{
        id
        name
        description
        rank
        isMediaSpoiler
        isGeneralSpoiler
      }
    }
  }
`);

// Thumbnail source for the ones without domain in them
const source = "https://wp.youtube-anime.com/aln.youtube-anime.com"

interface ShowQuery {
  shows: {
    edges: [
      {
        _id: string;
        aniListId: number;
        availableEpisodesDetail: {
          sub: string[];
          dub: string[];
          raw: string[];
        };
      }
    ];
  };
}


const show_query = `
  query($search: String) {
    shows(
        search: {
          query: $search
        }
        page: 1
      ) {
        edges {
          _id
          aniListId
          availableEpisodesDetail
        }
      }
  }
`;

interface EpisodeDetail {
  _id: string;
  episodeIdNum: number;
  thumbnails?: string[];
  vidInforssub?: {
    vidResolution: number;
    vidPath: string;
    vidSize: number;
    vidDuration: number;
  };
}

interface AllAnimeEpisodes {
  episodeInfos: EpisodeDetail[];
}

const episodes_details_query = `
  query($showId: String!, $max: Float!) {
    episodeInfos(showId:$showId,  episodeNumStart:0, episodeNumEnd:$max){
      _id
      thumbnails
      episodeIdNum
      vidInforssub
    }
  }
`;