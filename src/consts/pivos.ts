import type { Pivo } from "@/types/Pivo";
import { CHARLANTES } from "./charlantes";

const DEFAULT_PLACE = "Cuatro Gatos Coworking";

const addGetters = (pivos: Pivo[]): Pivo[] => {
  return pivos.map((pivo) => ({
    ...pivo,
    get charlantes() {
      return CHARLANTES.filter((charlante) => {
        return pivo.charlanteIds?.includes(charlante.id);
      });
    },
    get location() {
      return pivo.location || DEFAULT_PLACE;
    },
  }));
};

export const PIVOS: Pivo[] = addGetters([
  {
    id: "pivo29",
    title: "Diseño UI/UX para desarrolladores",
    description:
      "Diseño UI/UX para desarrolladores para el usuario del usuario del usuario",
    charlanteIds: ["jose-cruz"],
    date: new Date(2024, 4, 10, 19, 0),
    image: "",
    socialImage: "cartel.png",
  },
  {
    id: "pivo20",
    title: "Como complicarte la vida haciendo un blog con Next.js y Github",
    description: `Alberto Tejero, desarrollador frontend en Bravent, nos va a contar como podemos construir nuestro blog totalmente GRATIS utilizando Github y Nextjs. En principio esta pivoandcode está pensada para hacerla en plan charla, si alguien quiere llevar su portátil puede hacerlo pero no aseguramos que pueda haber hueco en las mesas.`,
    charlanteIds: ["alberto-tejero"],
    date: new Date(2023, 2, 20, 19, 0),
    image: "",
    socialImage: "cartel.webp",
  },
  {
    id: "pivo1",
    title: "Accesibilidad Web, Git y NodeJS",
    description: `Primera edición de #pivoandcode donde Antonio Molina nos hablará sobre HTML5 y CSS, Daniel Redondo hará una breve introducción a Git y por último Alberto Tejero creará una pequeña integración continua con hook de git y pm2.`,
    charlanteIds: ["alberto-tejero", "daniel-redondo", "antonio-molina"],
    date: new Date(2018, 1, 22, 19, 30),
    image: "",
    socialImage: "image.png",
    location: "Bar 'JM'",
  },
  {
    id: "pivo2",
    title: "Tratamientos de datos meteorológicos con python",
    description: ``,
    charlanteIds: ["pedro-d-diez"],
    date: new Date(2018, 2, 16, 20, 0),
    image: "",
    socialImage: "image.png",
    location: "Café Teatro Central",
  },
  {
    id: "pivo3",
    title: "Hotdog or Not Hotdog",
    description: `Daremos una introducción amena al Machine Learning y veremos como hacer un clasificador de «Salchicha o No Salchicha» desde cero utilizando redes neuronales.`,
    charlanteIds: ["abdallah-abedraba"],
    date: new Date(2018, 3, 20, 20, 0),
    image: "",
    socialImage: "image.png",
    location: "Bodeguita La Fragua",
  },
  {
    id: "pivo4",
    title: "Kafka + Mensajería",
    description: `En un momento en el que todo el mundo habla sobre microservicios, se hace especialmente importante que éstos puedan funcionar de forma autónoma con las mínimas dependencias con otros sistemas externos`,
    charlanteIds: ["diego-montesinos"],
    date: new Date(2018, 4, 28, 20, 0),
    image: "",
    socialImage: "image.png",
    location: "Que No! Cervezas i mas",
  },
  {
    id: "pivo5",
    title: "Wordpress: El Framework desconocido",
    description: `El CMS mñas usado, WordPress, oculta un gran poder tras su sencillo manejo por parte de cualquier usuario. En la charla veremos como los programadores podemos utilizar esta herramienta para crear proyectos complejos con ejemplos prácticos y reales.`,
    charlanteIds: ["samuel-rocha"],
    date: new Date(2018, 9, 5, 19, 30),
    image: "",
    socialImage: "image.png",
    location: "Espacio de Arte Azur",
  },
  {
    id: "pivo6",
    title: "Ganar dinero en internet es posible",
    description: `Hablaremos de SEO (Posicionamiento en buscadores) una de las profesiones que más han emergido en los últimos años. Veremos casos reales de cómo se gana dinero en Internet con proyectos propios y trabajando para empresas. También veremos los primeros pasos a dar si queremos adentrarnos en el mundo de ganar dinero online de verdad, sin productos milagro ni engaños.`,
    charlanteIds: ["guillermo-del-pino"],
    date: new Date(2018, 10, 9, 19, 30),
    image: "",
    socialImage: "image.png",
    location: "Espacio de Arte Azur",
  },
  {
    id: "pivo7",
    title: "Productividad y organización - apps y metdologías",
    description: `Hablaremos de SEO (Posicionamiento en buscadores) una de las profesiones que más han emergido en los últimos años. Veremos casos reales de cómo se gana dinero en Internet con proyectos propios y trabajando para empresas. También veremos los primeros pasos a dar si queremos adentrarnos en el mundo de ganar dinero online de verdad, sin productos milagro ni engaños.`,
    charlanteIds: ["carlos-villalon"],
    date: new Date(2019, 1, 1, 19, 30),
    image: "",
    socialImage: "image.png",
    location: "Espacio de Arte Azur",
  },
]);
