import { turso } from "@/lib/turso";
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

const { rows, columns } = await turso.execute("SELECT * FROM pivos");

const { rows: charlantesRows, columns: charlantesColumns } =
  await turso.execute("SELECT * FROM pivo_speakers");

const newPivos = rows.map((row) => {
  return columns.reduce((acc, column) => {
    if (column === "date") {
      acc[column] = new Date(row[column] as string);
    } else {
      acc[column] = row[column];
    }

    return acc;
  }, {} as Record<string, any>) as Omit<Pivo, "charlanteIds" | "charlantes">;
});

const newCharlantes = charlantesRows.map((row) => {
  return charlantesColumns.reduce((acc, column) => {
    acc[column] = row[column];
    return acc;
  }, {} as Record<string, any>) as { speaker_id: string; pivo_id: number };
});

const allPivos = newPivos.map((pivo) => {
  const charlanteIds = newCharlantes
    .filter((charlante) => charlante.pivo_id === Number(pivo.id))
    .map((charlante) => charlante.speaker_id);

  return { ...pivo, charlanteIds } as Pivo;
});

export const PIVOS: Pivo[] = addGetters(allPivos);
