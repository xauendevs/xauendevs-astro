// Redondea el máximo del eje a un número «limpio» y par (su mitad también es una marca del eje).
export const niceMax = (value: number) => {
  if (value <= 4) return 4;
  const power = 10 ** Math.floor(Math.log10(value));
  const step = [1, 2, 3, 4, 5, 6, 8, 10].find((candidate) => candidate * power >= value) ?? 10;
  return step * power;
};
