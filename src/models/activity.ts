export interface Activity {
  id: number;
  content: string;
  type: "TEXT" | "LIST";
  user_id: number;
  user_name: string;
  user_avatar: string;
  show?: {
    id: number;
    name: string;
    image: string;
    type: "ANIME" | "MANGA";
    year?: number;
  }
  created_at: number;
  likes: number;
  replies: number;
}