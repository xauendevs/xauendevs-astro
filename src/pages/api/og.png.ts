import type { APIRoute } from "astro";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";

const require = createRequire(import.meta.url);

const robotoRegular = readFileSync(
  require.resolve("@fontsource/roboto/files/roboto-latin-400-normal.woff")
);
const robotoBold = readFileSync(
  require.resolve("@fontsource/roboto/files/roboto-latin-700-normal.woff")
);

const clamp = (value: string | null, maxLength: number, fallback: string) =>
  (value?.trim() || fallback).slice(0, maxLength);

const textNode = (
  text: string,
  style: Record<string, string | number>
) => ({
  type: "div",
  props: {
    style: {
      display: "flex",
      ...style,
    },
    children: text,
  },
});

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
  const params = url.searchParams;
  const title = clamp(params.get("title"), 140, "Eventos en Jaén");
  const date = clamp(params.get("date"), 90, "Próximamente");
  const place = clamp(params.get("place"), 100, "Jaén");
  const organizer = clamp(params.get("organizer"), 80, "XauenDevs");
  const label = clamp(params.get("label"), 30, "EVENTO");
  const tags = clamp(params.get("tags"), 90, "");
  const description = clamp(params.get("description"), 180, "");

  const element = {
    type: "div",
    props: {
      style: {
        display: "flex",
        position: "relative",
        flexDirection: "column",
        justifyContent: "space-between",
        width: "100%",
        height: "100%",
        padding: "64px",
        backgroundColor: "#0d0d0d",
        color: "#ffffff",
        overflow: "hidden",
      },
      children: [
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
            },
            children: [
              textNode("XauenDevs", {
                fontFamily: "Roboto",
                fontSize: 30,
                fontWeight: 700,
                letterSpacing: "-0.04em",
              }),
              textNode(label, {
                fontFamily: "Roboto",
                padding: "10px 18px",
                borderRadius: 999,
                backgroundColor: "#f6b703",
                color: "#0d0d0d",
                fontSize: 18,
                fontWeight: 700,
                letterSpacing: "0.12em",
              }),
            ],
          },
        },
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              flexDirection: "column",
              width: "100%",
              maxWidth: "1040px",
              gap: "18px",
            },
            children: [
              textNode(title, {
                fontFamily: "Roboto",
                fontSize: 62,
                lineHeight: 1.08,
                fontWeight: 700,
                letterSpacing: "-0.045em",
              }),
              description
                ? textNode(description, {
                    fontFamily: "Roboto",
                    fontSize: 21,
                    lineHeight: 1.3,
                    fontWeight: 400,
                    color: "rgba(255,255,255,0.72)",
                    maxWidth: "980px",
                  })
                : null,
              tags
                ? textNode(tags, {
                    fontFamily: "Roboto",
                    fontSize: 22,
                    lineHeight: 1.2,
                    fontWeight: 700,
                    color: "#f6b703",
                  })
                : null,
            ].filter(Boolean),
          },
        },
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              flexDirection: "row",
              alignItems: "flex-end",
              justifyContent: "space-between",
              width: "100%",
              gap: "40px",
              paddingTop: "28px",
              borderTop: "1px solid rgba(255,255,255,0.18)",
            },
            children: [
              textNode(date, {
                fontFamily: "Roboto",
                fontSize: 25,
                fontWeight: 700,
              }),
              {
                type: "div",
                props: {
                  style: {
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-end",
                    gap: "6px",
                    maxWidth: "430px",
                  },
                  children: [
                    textNode(place, {
                      fontFamily: "Roboto",
                      fontSize: 21,
                      fontWeight: 700,
                      textAlign: "right",
                    }),
                    textNode(organizer, {
                      fontFamily: "Roboto",
                      fontSize: 18,
                      fontWeight: 400,
                      color: "rgba(255,255,255,0.62)",
                      textAlign: "right",
                    }),
                  ],
                },
              },
            ],
          },
        },
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              position: "absolute",
              right: 0,
              top: 0,
              width: "18px",
              height: "100%",
              backgroundColor: "#f6b703",
            },
            children: "",
          },
        },
      ],
    },
  };

  const svg = await satori(element, {
    width: 1200,
    height: 630,
    fonts: [
      {
        name: "Roboto",
        data: robotoRegular,
        weight: 400,
        style: "normal",
      },
      {
        name: "Roboto",
        data: robotoBold,
        weight: 700,
        style: "normal",
      },
    ],
  });

  const png = new Resvg(svg).render().asPng();

  return new Response(new Uint8Array(png), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
};
