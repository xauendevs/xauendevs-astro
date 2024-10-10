const { STRAPI_HOST, STRAPI_API_KEY } = import.meta.env;

export function query(url: string) {
  console.log(`${STRAPI_HOST}/api/${url}`);
  return fetch(`${STRAPI_HOST}/api/${url}`, {
    headers: {
      Authorization: `Bearer ${STRAPI_API_KEY}`,
    },
  }).then((res) => res.json());
}
