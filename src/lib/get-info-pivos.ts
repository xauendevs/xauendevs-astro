import type { Pivo } from "@/types/Pivo";
import { query } from "./strapi";

export async function getPivosStrapi(): Promise<Pivo[]> {
  return query(
    "pivos?fields[0]=title&fields[1]=description&fields[2]=place&fields[3]=date&fields[4]=endDate&fields[5]=videoId&fields[6]=saraosLink&populate[image][fields][0]=url&populate[speakers][populate][photo][fields][0]=url&populate[speakers][populate][socialNetwork]=true&sort=date:desc"
  )
    .then((data) => {
      return {
        ...data,
        data: data.data?.map((item: any) => {
          return {
            ...item,
            date: new Date(item.date),
            endDate: item.endDate ? new Date(item.endDate) : undefined,
            image: item.image?.url,
            speakers: item.speakers.map((speaker: any) => {
              return {
                ...speaker,
                photo: speaker.photo?.url,
              };
            }),
          };
        }),
      };
    })
    .then(({ data }) => data)
    .catch((err) => console.log(err));
}

export async function getNextPivo(): Promise<Pivo[]> {
  return query(
    "pivos?fields[0]=title&fields[1]=description&fields[2]=place&fields[3]=date&populate[image][fields][0]=url&populate[speakers][populate][photo][fields][0]=url&populate[speakers][populate][socialNetwork]=true"
  )
    .then((data) => {
      return {
        ...data,
        data: data.data.map((item: any) => {
          return {
            ...item,
            date: new Date(item.date),
            image: item.image?.url,
            speakers: item.speakers.map((speaker: any) => {
              return {
                ...speaker,
                photo: speaker.photo?.url,
              };
            }),
          };
        }),
      };
    })
    .then(({ data }) => data)
    .catch((err) => console.log(err));
}
