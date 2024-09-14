import { turso } from "@/lib/turso";
import type { Pivo } from "@/types/Pivo";
import { CHARLANTES } from "./charlantes";
import type { Charlante } from "@/types/Charlante";

const DEFAULT_PLACE = "Cuatro Gatos Coworking";

// const addGetters = (pivos: Pivo[]): Pivo[] => {
//   return pivos.map((pivo) => ({
//     ...pivo,
//     get charlantes() {
//       return CHARLANTES.filter((charlante) => {
//         return pivo.charlanteIds?.includes(charlante.id);
//       });
//     },
//     get location() {
//       return pivo.location || DEFAULT_PLACE;
//     },
//   }));
// };

export async function getPivos() {
  const { rows, columns } = await turso.execute(`SELECT
    Pivos.id,
    Pivos.title,
    Pivos.description,
    Pivos.date,
    Pivos.image,
    Pivos.location,
    COALESCE(
        json_group_array(
            json_object(
                'id', Speakers.id,
                'name', Speakers.name,
                'photo', Speakers.image
            )
        ),
        '[]'
    ) AS speakers
FROM
    Pivos
LEFT JOIN
    Pivos_Speakers ON Pivos.id = Pivos_Speakers.pivo_id
LEFT JOIN
    Speakers ON Pivos_Speakers.speaker_id = Speakers.id
GROUP BY
    Pivos.id
ORDER BY
    Pivos.date DESC;
`);

  const newPivos = rows.map((row) => {
    const pivo: Pivo = {
      id: row.id! as number,
      title: row.title as string,
      description: row.description as string,
      image: row.image as string,
      location: row.location as string,
      socialImage: row.socialImage as string,
      date: new Date(row.date as string),
    };
    const speakers: Charlante[] = JSON.parse(row.speakers as string);
    pivo.speakers = speakers.filter((speaker) => speaker.id);

    return pivo as Pivo;
  });

  return newPivos;
}

// const newCharlantes = charlantesRows.map((row) => {
//   return charlantesColumns.reduce((acc, column) => {
//     acc[column] = row[column];
//     return acc;
//   }, {} as Record<string, any>) as { speaker_id: string; pivo_id: number };
// });

// const allPivos = newPivos.map((pivo) => {
//   const charlanteIds = newCharlantes
//     .filter((charlante) => charlante.pivo_id === Number(pivo.id))
//     .map((charlante) => charlante.speaker_id);

//   return { ...pivo, charlanteIds } as Pivo;
// });
