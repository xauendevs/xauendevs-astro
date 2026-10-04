import type { ExternalEvent } from "@/types/ExternalEvent";
import { query } from "./strapi";

export async function getExternalEventsStrapi(): Promise<ExternalEvent[]> {
  return query(
    "external-events?fields[0]=title&fields[1]=description&fields[2]=date&fields[3]=endDate&fields[4]=place&fields[5]=organizer&fields[6]=url&fields[7]=tags&fields[8]=mapQuery&populate[image][fields][0]=url&sort=date:asc"
  )
    .then((data) => {
      return {
        ...data,
        data: data.data?.map((item: any) => ({
          ...item,
          id: item.documentId ?? String(item.id),
          date: new Date(item.date),
          endDate: item.endDate ? new Date(item.endDate) : undefined,
          image: item.image?.url,
          tags: Array.isArray(item.tags) ? item.tags : [],
        })),
      };
    })
    .then(({ data }) => data ?? [])
    .catch((err) => {
      console.error("Error fetching external events from Strapi:", err);
      return [];
    });
}
