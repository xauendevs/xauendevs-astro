import type { Pivo } from "@/types/Pivo";
import { query } from "./strapi";

export async function getPivosStrapi(): Promise<Pivo[]> {
  return query(
    "pivos?fields[0]=title&fields[1]=place&fields[2]=date&fields[3]=videoId&populate[image][fields][0]=url&populate[speakers][populate][photo][fields][0]=url&populate[speakers][populate]=socialNetwork&sort=date:desc"
  )
    .then((data) => {
      console.log(data);
      return {
        ...data,
        data: data.data?.map((item: any) => {
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

export async function getNextPivo(): Promise<Pivo[]> {
  return query(
    "pivos?fields[0]=title&fields[1]=place&fields[2]=date&populate[image][fields][0]=url&populate[speakers][populate][photo][fields][0]=url&populate[speakers][populate]=socialNetwork"
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
