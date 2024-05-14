import type { Charlante } from "./Charlante";

export interface Pivo {
  id: string;
  title: string;
  description: string;
  image: string;
  socialImage: string;
  date: Date;
  charlanteIds: string[];
  charlantes?: Charlante[];
  location?: string;
}
