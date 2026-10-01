const tagRules: Array<[string, RegExp]> = [
  ["IA", /\bIA\b|inteligencia artificial|prompt/i],
  ["Ciberseguridad", /ciberseguridad|seguridad|RAT|FIDO|WebAuthn/i],
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
