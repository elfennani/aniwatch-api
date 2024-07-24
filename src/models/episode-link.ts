import HlsSource from "./hls-source.js";

interface EpisodeLink {
  hls?: HlsSource,
  mp4?: string,
  dubbed: boolean
}

export default EpisodeLink