const { STRAPI_HOST } = import.meta.env;

export function query(url: string) {
  console.log(`${STRAPI_HOST}/api/${url}`);
  return fetch(`${STRAPI_HOST}/api/${url}`).then((res) => res.json());
}
