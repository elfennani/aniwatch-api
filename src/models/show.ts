import { Status } from "./status.js";

export interface Show {
  id: number;
  name: string;
  status?: Status;
  description: string;
  episodes: number;
  progress?: number;
  image: {
    large: string;
    medium: string;
    original: string;
    color?: string;
  };
  banner?: string;
  updatedAt?: number;
}