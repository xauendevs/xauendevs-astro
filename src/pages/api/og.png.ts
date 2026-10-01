import type { APIRoute } from "astro";
import { ImageResponse } from "@vercel/og";

const clamp = (value: string | null, maxLength: number, fallback: string) =>
  (value?.trim() || fallback).slice(0, maxLength);

const textNode = (text: string, style: Record<string, string | number>) => ({
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
export const config = { runtime: "edge" };

export const GET: APIRoute = ({ url }) => {
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
        fontFamily: "Noto Sans",
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
                fontSize: 30,
                fontWeight: 900,
                letterSpacing: "-0.04em",
              }),
              textNode(label, {
                padding: "10px 18px",
                borderRadius: 999,
                backgroundColor: "#f6b703",
                color: "#0d0d0d",
                fontSize: 18,
                fontWeight: 800,
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
                fontSize: 62,
                lineHeight: 1.08,
                fontWeight: 900,
                letterSpacing: "-0.045em",
              }),
              description
                ? textNode(description, {
                    fontSize: 21,
                    lineHeight: 1.3,
                    fontWeight: 500,
                    color: "rgba(255,255,255,0.72)",
                    maxWidth: "980px",
                  })
                : null,
              tags
                ? textNode(tags, {
                    fontSize: 22,
                    lineHeight: 1.2,
                    fontWeight: 600,
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
                fontSize: 25,
                fontWeight: 800,
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
                      fontSize: 21,
                      fontWeight: 700,
                      textAlign: "right",
                    }),
                    textNode(organizer, {
                      fontSize: 18,
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

  return new ImageResponse(element as any, {
    width: 1200,
    height: 630,
  });
};
