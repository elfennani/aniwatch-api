export interface User {
  id: number;
  icon?: string;
  icon_large?: string;
  banner?: string;
  name: string;
  bio?: string;
  anime_watched: number;
  anime_days_watched: number;
  anime_mean_score: number;
  manga_read: number;
  manga_chapters_read: number;
  manga_mean_score: number;
}