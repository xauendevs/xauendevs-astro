import type { Partner } from "@/types/Partner";
import { query } from "./strapi";

export async function getPartners(): Promise<Partner[]> {
  return query(
    "partners?populate[logo][fields][0]=url"
  )
    .then((data) => {
      return {
        ...data,
        data: data.data.map((item: any) => {
         
          return {
            ...item,
            logo: item.logo?.url,
          };
        }),
      };
    })
    .then(({ data }) => data)
    .catch((err)=>console.log(err))
}
