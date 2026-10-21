/**
 * Easter egg: lluvia de aceitunas 🫒. Se carga bajo demanda desde EasterEgg.astro.
 * Todo es local: no hace peticiones ni guarda nada.
 */
const OLIVES = 60;
/** Duración máxima de la lluvia (ms): después se limpia todo. */
const DURATION = 6500;

/** Aceituna dibujada a mano: el emoji 🫒 no existe en Windows 10 y saldría como un recuadro. */
const olive = (fill: string, shine: string) =>
  `<svg viewBox="0 0 32 40" width="1em" height="1.25em"><path d="M16 9c1-4 4-7 9-8-1 4-4 7-9 8z" fill="#6b8e23"/><path d="M16 9V5" stroke="#5a4a2a" stroke-width="1.5" stroke-linecap="round"/><ellipse cx="16" cy="24" rx="11" ry="14" fill="${fill}"/><ellipse cx="12" cy="18" rx="3" ry="5" fill="${shine}" opacity=".55"/></svg>`;
const OLIVE_COLORS = [olive("#556b2f", "#c5d86d"), olive("#6b7d24", "#dfe89a"), olive("#2b2233", "#8a7a99")];

let running = false;

export function runEasterEgg() {
  if (running) return;
  running = true;

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const root = document.createElement("div");
  root.id = "xd-egg";
  root.setAttribute("aria-hidden", "true");

  // Con "reducir movimiento" solo sale el aviso, sin lluvia.
  if (!reduced) {
    for (let i = 0; i < OLIVES; i++) {
      const drop = document.createElement("span");
      drop.className = "xd-olive";
      drop.innerHTML = OLIVE_COLORS[i % OLIVE_COLORS.length];
      drop.style.left = `${Math.random() * 100}vw`;
      drop.style.fontSize = `${18 + Math.random() * 26}px`;
      drop.style.animationDuration = `${2.2 + Math.random() * 2.6}s`;
      drop.style.animationDelay = `${Math.random() * 1.8}s`;
      drop.style.setProperty("--spin", `${(Math.random() < 0.5 ? -1 : 1) * (180 + Math.random() * 540)}deg`);
      drop.style.setProperty("--drift", `${-40 + Math.random() * 80}px`);
      root.append(drop);
    }
  }

  const toast = document.createElement("div");
  toast.className = "xd-egg-toast";
  toast.setAttribute("role", "status");
  toast.innerHTML = `
    <strong>¡Modo aceituna activado!</strong>
    <span>Has encontrado el easter egg. Jaén produce casi la mitad del aceite de oliva de España… y algún que otro dev.</span>
    <span>Guárdanos el secreto… o cuéntalo en el próximo Pivo &amp; Code 🍺</span>
  `;

  document.body.append(root, toast);

  window.setTimeout(() => {
    toast.classList.add("is-leaving");
    root.classList.add("is-leaving");
    window.setTimeout(() => {
      root.remove();
      toast.remove();
      running = false;
    }, 600);
  }, DURATION);
}
