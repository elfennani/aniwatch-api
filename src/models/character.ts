export interface Character {
  id: number;
  name: string;
  image?: string;
  image_sd?: string;
  role: "MAIN" | "SUPPORTING" | "BACKGROUND";
  voice_actors: {
    id: number;
    name: string;
    image?: string;
    language?: string;
  }[],
}