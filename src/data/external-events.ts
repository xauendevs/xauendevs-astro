export interface ExternalEvent {
  id: string;
  title: string;
  description: string;
  date: Date;
  endDate?: Date;
  place: string;
  organizer: string;
  url: string;
  tags: string[];
  image?: string;
  mapQuery?: string;
}

export const externalEvents: ExternalEvent[] = [
  {
    id: "jaen-tech-presentation-2026",
    title: "Presentación institucional de Jaén Tech",
    description:
      "Presentación de Jaén Tech ante la sociedad y las instituciones de Jaén.",
    date: new Date("2026-10-22T18:00:00+02:00"),
    place: "Banco de España, Jaén",
    organizer: "Jaén Tech",
    url: "https://www.jaentech.com/",
    tags: ["Comunidad", "Tecnología"],
    image: "/img/events/jaen-tech-2026.svg",
    mapQuery: "Calle Juan Montilla 7, 23002 Jaén, España",
  },
  {
    id: "caepia-2026",
    title: "CAEPIA'26 · XXI Conferencia Española de Inteligencia Artificial",
    description:
      "Conferencia científica y tecnológica dedicada a la investigación y los avances en inteligencia artificial.",
    date: new Date("2026-11-11T09:00:00+01:00"),
    endDate: new Date("2026-11-13T18:00:00+01:00"),
    place: "Antigua Escuela de Magisterio, Jaén",
    organizer: "Universidad de Jaén",
    url: "https://simidat.ujaen.es/caepia26/",
    tags: ["IA", "Datos", "Investigación"],
    image: "/img/events/caepia-2026.svg",
    mapQuery: "Antigua Escuela de Magisterio, Calle Virgen de la Cabeza 2C, 23008 Jaén, España",
  },
  {
    id: "science-week-uja-2026",
    title: "XXVI Semana de la Ciencia",
    description:
      "Talleres, charlas, actividades en laboratorios, exposiciones y Cafés con Ciencia.",
    date: new Date("2026-11-03T09:30:00+01:00"),
    endDate: new Date("2026-11-15T14:00:00+01:00"),
    place: "Campus de Jaén y Linares",
    organizer: "Universidad de Jaén",
    url: "https://www.ujaen.es/servicios/ucc/eventos/xxvi-semana-de-la-ciencia",
    tags: ["Ciencia", "Datos", "IA"],
    image: "/img/events/semana-ciencia-uja-2026.svg",
    mapQuery: "Campus Las Lagunillas, 23071 Jaén, España",
  },
];
