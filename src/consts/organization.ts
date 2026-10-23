// Datos legales de la asociación tal como constan en el registro. Google para Organizaciones sin
// Fines de Lucro los compara con los de la solicitud: tienen que coincidir carácter a carácter.
export const ORGANIZATION = {
  name: "XauenDevs",
  legalForm: "Asociación sin ánimo de lucro",
  taxId: "G21870340",
  email: "hola@xauendevs.io",
  url: "https://xauendevs.io",
  /** Año en que empieza la comunidad; la asociación se inscribe después (`registry.date`). */
  foundingYear: 2017,
  registry: {
    name: "Registro de Asociaciones de Andalucía",
    number: "07315",
    /** ISO 8601, para el JSON-LD. */
    date: "2025-04-02",
    dateLabel: "2 de abril de 2025",
  },
  address: {
    street: "Calle Ronda, nº 1, Puente Tablas",
    postalCode: "23009",
    locality: "Jaén",
    region: "Jaén",
    country: "España",
    countryCode: "ES",
  },
};

export const ORGANIZATION_ADDRESS = `${ORGANIZATION.address.street}, ${ORGANIZATION.address.postalCode} ${ORGANIZATION.address.locality}, ${ORGANIZATION.address.country}`;
