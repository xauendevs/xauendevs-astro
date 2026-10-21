const tagRules: Array<[string, RegExp]> = [
  ["IA", /\bIA\b|inteligencia artificial|prompt/i],
  // «RAT» va en mayúsculas y como palabra suelta: con /i también casaba «ahórrate» o «tratamientos».
  ["Ciberseguridad", /[Cc]iberseguridad|[Ss]eguridad|\bRAT\b|FIDO|WebAuthn|[Tt]royano|[Bb]ounties|[Bb]rechas/],
  ["DevOps", /devops|ci\/cd|docker|kubernetes/i],
  ["Cloud", /cloud|aws|azure|vercel/i],
  ["Web", /web|frontend|backend|javascript|typescript/i],
  ["Datos", /datos|data|database|postgres|sql/i],
  ["Arquitectura", /arquitectura|arquitecto|diseño de sistemas/i],
];

export function getPivoTags(title: string): string[] {
  const tags = ["Charlas"];

  for (const [tag, rule] of tagRules) {
    if (rule.test(title)) {
      tags.push(tag);
    }
  }

  return tags;
}
