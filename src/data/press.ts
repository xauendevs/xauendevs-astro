/**
 * Apariciones de XauenDevs en prensa. Basta con pegar la URL: el titular, la entradilla, la imagen de
 * cabecera, el medio y la fecha se sacan de la propia noticia (ver src/lib/press.ts).
 *
 *   "https://extrajaen.com/jaen/...",
 *
 * Si quieres cambiar algo, pon un objeto: cualquier campo que escribas manda sobre lo que saque la web.
 *
 *   { url: "https://www.diariojaen.es/...", date: "2026-10-01" },
 *   { url: "https://...", title: "Titular a mano", image: "/img/prensa/foto.webp", outlet: "Radio Jaén" },
 */
export interface PressEntry {
  url: string;
  /** AAAA-MM-DD. Si falta, se usa la fecha de publicación de la noticia. */
  date?: string;
  title?: string;
  description?: string;
  image?: string;
  outlet?: string;
  /** Logo del medio para el sello sobre la imagen. Si falta, se saca de su web. */
  logo?: string;
}

export const PRESS: Array<string | PressEntry> = [
  // Facebook no da titular ni fecha y su imagen caduca: todo a mano.
  {
    url: "https://www.facebook.com/AyuntamientodeJaen/posts/1548790643948886/",
    date: "2026-10-22",
    title: "El Banco de España acoge la 42.ª edición de Pivo&Code",
    description:
      "Encuentro de la comunidad tecnológica jiennense para compartir conocimientos, conectar profesionales y debatir.",
    image: "/img/prensa/ayuntamiento-jaen-pivocode-42.jpg",
    outlet: "Ayuntamiento de Jaén",
  },
  "https://www.canalsurmas.es/videos/409399-noticias-2-ja%C3%A9n-mi%C3%A9rcoles-30-de-septiembre-canal-sur",
  "https://www.diariojaen.es/jaen/el-banco-de-espana-acogera-un-encuentro-para-analizar-el-impacto-de-la-ia-en-el-futuro-del-desarrollo-de-software-NA11666586",
  "https://www.horajaen.com/2026/10/20/banco-de-espana-jaen-pivo-code-42-inteligencia-artificial/",
  "https://extrajaen.com/jaen/el-banco-de-espana-acogera-este-viernes-la-42-edicion-de-pivoandcode",
  "https://www.planomato.com/es/jaen/p/pivocode-42-edicion-jaen",
  "https://fundacioninnovasur.com/xauendevs-paralelo-37-jaen/",
  "https://www.diariojaen.es/jaen/imefe-asiste-a-la-inauguracion-de-paralelo-37-ME11626864",
  "https://www.europapress.es/andalucia/noticia-encuentro-tecnologico-paralelo-37-reunira-jaen-estudiantes-profesionales-empresas-sector-20260911174245.html",
  "https://www.horajaen.com/2026/09/26/encuentro-tecnologico-paralelo-37-jaen/",
  "https://www.jaenhoy.es/jaen/imefe-impulsa-paralelo-37-jornada-tecnologica-jaen_0_2007932847.html",
  "https://extrajaen.com/jaen/imefe-impulsa-el-encuentro-tecnologico-paralelo-37",
  "https://www.andaluciainformacion.es/articulo/jaen-universidad/paralelo-37-reunira-jaen-120-participantes-torno-tecnologia-innovacion/202609111228573474342.html"
];
