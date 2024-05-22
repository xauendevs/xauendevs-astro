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
  {
    id: "pivo8",
    title: "XVIII Pivo&Code: Machine Learning",
    description:
      "Antonio Paredes, un cientifico loco y amante de las guitarras nos va a hacer una pequeña introducción a este mundo del Machine Learning.",
    charlanteIds: ["antonio-paredes"],
    date: new Date(2020, 4, 24, 19, 0, 0),
    image: "",
    socialImage: "xviii-pivo-and-code.jpeg",
    location: "",
  },
  {
    id: "pivo9",
    title:
      "I PivoCode&House: SEO Local, cómo ponerte en el centro de tu ciudad",
    description:
      "Que vamos a ver con Carlos García…\n¿Qué es el SEO local? Cuales son la principales diferencias entre el SEO tradicional. Cómo podemos trabajar el SEO local. Cómo usar Google My Business para nuestra estrategia de SEO local. Ronda de preguntas y dudas.",
    charlanteIds: ["carlos-garcia"],
    date: new Date(2020, 3, 26, 19, 0, 0),
    image: "",
    socialImage: "i-pivo-code-and-house.png",
    location: "",
  },
  {
    id: "pivo10",
    title: "XVII Pivo&Code: Ruta de la Isla de Java a la de Kotlin",
    description:
      "Cuando Jetbrains introdujo Kotlin y más aun cuando Google anunció que éste sería el primer lenguaje para aplicaciones de Android, tuvo un gran impacto en la comunidad, donde muchas empresas y desarrolladores empezaron su expedición a la Isla de Kotlin.\nEn esta charla se mostrará un fantástico viaje en el que partiremos de código en Java y lo iremos transformando a Kotlin enseñando las ventajas y el potencial que este lenguaje nos brinda día a día.",
    charlanteIds: ["rocio-ortega"],
    date: new Date(2020, 2, 21, 19, 0, 0),
    image: "",
    socialImage: "xvii-pivo-and-code.png",
    location: "",
  },
  {
    id: "pivo11",
    title: "XVI Pivo&Code: Cómo empezar con AWS sin arruinarte en el intento",
    description:
      "¿Por qué usar la nube? Todo el mundo habla de ello, pero ¿qué ventajas me puede proporcionar usarla? Se hará una breve introducción a AWS y como empezar a usar los servicios básicos de forma gratuita. Veremos como interactuar con el panel de AWS, levantar una máquina y ver la monitorización. El objetivo es usar AWS cuando tengamos cosas que probar y que no nos suene a chino cuando alguien nos hable del apasionante mundo del cloud computing.",
    charlanteIds: ["lorena-del-moral"],
    date: new Date(2020, 1, 24, 19, 0, 0),
    image: "",
    socialImage: "xvi-pivo-and-code.png",
    location: "",
  },
  {
    id: "pivo12",
    title: "XV Pivo&Code: Flutter: Un SDK para gobernarlos a todos",
    description:
      "Durante la charla se hablará sobre Flutter, el SDK de moda. Flutter es el nuevo framework mobile de Google para crear interfaces nativas de alta calidad en iOS y Android en un tiempo récord. Pero los planes de los de Mountain View tienen planes más ambiciosos para su nueva herramienta. Hablaremos de todo ello, y veremos los pros y cons que han surgido al implementar Flutter en un proyecto empresarial real.",
    charlanteIds: ["antonio-cantero"],
    date: new Date(2019, 12, 13, 19, 0, 0),
    image: "",
    socialImage: "xv-pivo-and-code.png",
    location: "",
  },
  {
    id: "pivo13",
    title: "XIV Pivo&Code: Construir microservicios en el mundo real",
    description:
      "Cansado de teoría que no hay forma de aterrizarla en el código? ¿No te paran de vender que con tener una API REST ya tienes un microservicio? En esta charla se mostrarán casos de uso y problemas de la vida real a la hora de crear microservicios y como solventarlos.",
    charlanteIds: ["alberto-vara"],
    date: new Date(2019, 11, 15, 19, 0, 0),
    image: "",
    socialImage: "xiv-pivo-and-code.jpeg",
    location: "",
  },
  {
    id: "pivo14",
    title: "XIII Pivo&Code: Django, framework para desarrollo web en python",
    description:
      "Django: framework para desarrollo web en python\nDjango facilita la creación de mejores aplicaciones Web de forma más rápida y con menos código.",
    charlanteIds: ["pedro-d-diez"],
    date: new Date(2019, 10, 25, 19, 0, 0),
    image: "",
    socialImage: "xiii-pivo-and-code.png",
    location: "",
  },
  {
    id: "pivo15",
    title:
      "XII Pivo&Code: Inteligencia Artificial: la evolución de las máquinas",
    description:
      "Que es, de donde viene, por donde empezar, como funciona, nos dominará skynet? Si alguna vez te han inquietado estas preguntas en relación a la inteligencia artificial esta es tu charla! Haremos un viaje por la historia de esta ciencia, alguna demo interesante y sobre todo matemáticas.. Bueno eso mejor para otra charla… os espero!!",
    charlanteIds: ["daniel-garcia"],
    date: new Date(2019, 9, 27, 19, 0, 0),
    image: "",
    socialImage: "xii-pivo-and-code.png",
    location: "",
  },
  {
    id: "pivo16",
    title: "XI Pivo&Code: Realtime & isomorphic apps",
    description:
      "Jonathan Izquierdo y Jose Carlos Liébana nos hablarán sobre como construir una app utilizando el mismo lenguaje tanto en backend, utilizando NestJS(framework de NodeJS), como para la parte de frontend, con Angular. Todo esto unido con GraphQL para la comunicación entre ellos.\nTambién será una buena oportunidad para aquellos que buscan una nueva opción en Jaén para trabajar en una gran empresa, ya que están buscando desarrolladores y product owners.",
    charlanteIds: ["jonathan-izquierdo", "jose-carlos-liebana"],
    date: new Date(2019, 4, 26, 19, 0, 0),
    image: "",
    socialImage: "xi-pivo-and-code.jpeg",
    location: "",
  },
  {
    id: "pivo17",
    title: "X Pivo&Code: Iníciate en Ruby on Rails",
    description:
      "Aunque Kotlin es un lenguaje que no es del todo nuevo, Google ha hecho que repunte su popularidad, pero en este evento queremos demostrar que Kotlin no es un lenguaje sólo para Android. Vamos a usar Kotlin en el lado del servidor y jugar con algunos framework para hacer microservicios. Algunos también añaden el prefijo micro y hablan de microframeworks, vamos a jugar con todo esto y ver que los lenguajes no se cierran a un solo propósito.",
    charlanteIds: ["daniel-redondo"],
    date: new Date(2019, 3, 19, 19, 0, 0),
    image: "",
    socialImage: "x-pivo-and-code.jpeg",
    location: "",
  },
  {
    id: "pivo18",
    title: "IX Pivo&Code: Kata de refactoriación de código",
    description:
      "Aprovechando la visita de Codium a Dapda nos brindarán la oportunidad de realizar una kata con ellos en la #pivoandcode9. Para esta kata será necesario que cada asistente acuda con su portátil. Una kata es un ejercicio sobre un código existente para aplicar refactoring, tests o patrones buscando así la excelencia en el código y la mantenibilidad.",
    charlanteIds: ["jordi-anguela", "luis-rovirosa"],
    date: new Date(2019, 3, 5, 19, 0, 0),
    image: "",
    socialImage: "ix-pivo-and-code.jpeg",
    location: "",
  },
  {
    id: "pivo19",
    title: "VIII Pivo&Code: Iníciate en Ruby on Rails",
    description:
      "Charla orientada a desarrolladores con experiencia en otros lenguajes/frameworks que quieran familiarizarse con Ruby on Rails. Te ayudamos a conocer este exitoso framework para que, con un poco de práctica, no tengas que volver a rechazar una oferta o proyecto de Ruby on Rails.",
    charlanteIds: ["francisco-sanchez"],
    date: new Date(2019, 2, 8, 19, 0, 0),
    image: "",
    socialImage: "viii-pivo-and-code.jpeg",
    location: "",
  },
  {
    id: "pivo20",
    title: "VII Pivo&Code: Productividad y organización",
    description:
      "En esta edición trataremos sobre como organizar nuestras tareas y proyectos para ser más eficientes en nuestros proyectos digitales. Mostrando Apps y una metodologia de uso para las mismas. Os enseñaremos como aprender a reducir el estrés y los olvidos, ayudándote a concentrarte en completar tareas, no en tratar de recordarlas.",
    charlanteIds: ["carlos-villalon"],
    date: new Date(2019, 2, 1, 19, 0, 0),
    image: "",
    socialImage: "vii-pivo-and-code.jpeg",
    location: "",
  },
  {
    id: "pivo21",
    title: "VI Pivo&Code: Como ganar dinero en internet",
    description:
      "Hablaremos de SEO (Posicionamiento en buscadores) una de las profesiones que más han emergido en los últimos años. Veremos casos reales de cómo se gana dinero en Internet con proyectos propios y trabajando para empresas. También veremos los primeros pasos a dar si queremos adentrarnos en el mundo de ganar dinero online de verdad, sin productos milagro ni engaños.",
    charlanteIds: ["guillermo-del-pino"],
    date: new Date(2018, 11, 9, 19, 0, 0),
    image: "",
    socialImage: "vi-pivo-and-code.jpeg",
    location: "",
  },
  {
    id: "pivo22",
    title: "V Pivo&Code: WordPress: El Framework desconocido",
    description:
      "El CMS mñas usado, WordPress, oculta un gran poder tras su sencillo manejo por parte de cualquier usuario. En la charla veremos como los programadores podemos utilizar esta herramienta para crear proyectos complejos con ejemplos prácticos y reales.",
    charlanteIds: ["samuel-rocha"],
    date: new Date(2018, 10, 5, 19, 0, 0),
    image: "",
    socialImage: "v-pivo-and-code.jpeg",
    location: "",
  },
  {
    id: "pivo23",
    title: "IV Pivo&Code: Kafka + Mensajería",
    description:
      "En un momento en el que todo el mundo habla sobre microservicios, se hace especialmente importante que éstos puedan funcionar de forma autónoma con las mínimas dependencias con otros sistemas externos",
    charlanteIds: ["diego-montesinos"],
    date: new Date(2018, 6, 28, 19, 0, 0),
    image: "",
    socialImage: "iv-pivo-and-code.jpeg",
    location: "",
  },
  {
    id: "pivo24",
    title: "III Pivo&Code: Hotdog or Not Hotdog",
    description:
      "Daremos una introducción amena al Machine Learning y veremos como hacer un clasificador de «Salchicha o No Salchicha» desde cero utilizando redes neuronales.",
    charlanteIds: ["abdallah-abedraba"],
    date: new Date(2018, 4, 20, 19, 0, 0),
    image: "",
    socialImage: "iii-pivo-and-code.png",
    location: "",
  },
  {
    id: "pivo25",
    title: "II Pivo&Code: Tratamientos de datos meteorológicos con python",
    description:
      "Primera edición de #pivoandcode donde Antonio Molina nos hablará sobre HTML5 y CSS, Daniel Redondo hará una breve introducción a Git y por último Alberto Tejero creará una pequeña integración continua con hook de git y pm2.",
    charlanteIds: ["pedro-d-diez"],
    date: new Date(2018, 3, 16, 19, 0, 0),
    image: "",
    socialImage: "ii-pivo-and-code.png",
    location: "",
  },
  {
    id: "pivo26",
    title: "I Pivo&Code: Accesibilidad web, GIT y NodeJS",
    description:
      "Primera edición de #pivoandcode donde Antonio Molina nos hablará sobre HTML5 y CSS, Daniel Redondo hará una breve introducción a Git y por último Alberto Tejero creará una pequeña integración continua con hook de git y pm2.",
    charlanteIds: ["alberto-tejero", "antonio-molina", "daniel-redondo"],
    date: new Date(2018, 2, 18, 19, 0, 0),
    image: "",
    socialImage: "i-pivo-and-code.png",
    location: "",
  },
]);
