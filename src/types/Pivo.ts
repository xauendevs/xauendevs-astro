import type { Charlante } from "./Charlante";

export interface Pivo {
  id: number;
  title: string;
  description: string;
  image: string;
  socialImage: string;
  date: Date;
  charlanteIds?: string[];
  speakers?: Charlante[];
  place?: string;
  videoId?: string;
}
