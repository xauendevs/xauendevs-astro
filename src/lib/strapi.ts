const { STRAPI_HOST, STRAPI_API_KEY } = import.meta.env;

export async function query(url: string) {
  return fetch(`${STRAPI_HOST}/api/${url}`, {
    headers: {
      Authorization: `Bearer ${STRAPI_API_KEY}`,
    },
  }).then((res) => res.json());
}
