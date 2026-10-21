/**
 * Animación de "hackeo" de Halloween. Se carga bajo demanda desde HackIntro.astro.
 * Todo el contenido es fijo (no se interpola nada del usuario salvo el navegador/SO/pantalla,
 * que se escriben con textContent) y no se hace ninguna petición de red.
 */
const SEEN_KEY = "xd-hack";

const TEMPLATE = `
  <p class="hk-sr">Es una broma de Halloween: la web finge ser hackeada y enseguida se revela que es mentira. Pulsa Saltar, Escape o Enter para entrar directamente.</p>
  <button type="button" class="hk-skip" aria-label="Saltar la animación">Saltar · Esc</button>
  <div class="hk-term" aria-hidden="true">
    <div class="hk-titlebar"><i></i><i></i><i></i><span>root@xauendevs: ~</span></div>
    <div class="hk-out"></div>
  </div>
  <div class="hk-alert" aria-hidden="true">
    <div class="hk-alert-title">⚠ SISTEMA COMPROMETIDO ⚠</div>
    <div class="hk-alert-sub">TODA LA WEB ES NUESTRA · TODA LA WEB ES NUESTRA</div>
  </div>
  <div class="hk-reveal">
    <div class="hk-pumpkin" aria-hidden="true">🎃</div>
    <h2 class="hk-title">¡Feliz Halloween!</h2>
    <p class="hk-sub">Era una broma 😄 Tu navegador, tus cookies y tu historial de Stack Overflow están a salvo.</p>
    <button type="button" class="hk-enter">Entrar a la web →</button>
    <p class="hk-foot">Una broma de XauenDevs · Jaén</p>
  </div>
`;

function detectVictim(): string {
  const ua = navigator.userAgent;
  const browser = /Edg\//.test(ua)
    ? "Edge"
    : /OPR\//.test(ua)
      ? "Opera"
      : /Firefox\//.test(ua)
        ? "Firefox"
        : /Chrome\//.test(ua)
          ? "Chrome"
          : /Safari\//.test(ua)
            ? "Safari"
            : "tu navegador";
  const os = /Windows/.test(ua)
    ? "Windows"
    : /Android/.test(ua)
      ? "Android"
      : /iPhone|iPad|iPod/.test(ua)
        ? "iOS"
        : /Mac OS X/.test(ua)
          ? "macOS"
          : /Linux/.test(ua)
            ? "Linux"
            : "tu sistema";
  return `${browser} en ${os} (${screen.width}×${screen.height})`;
}

export async function runHackIntro(): Promise<void> {
  const root = document.getElementById("hack-intro");
  if (!root || root.dataset.run === "1") return;
  root.dataset.run = "1";
  try {
    sessionStorage.setItem(SEEN_KEY, "1");
  } catch {
    /* navegación privada: no pasa nada, simplemente podría repetirse */
  }

  new Image().src = "/img/halloween-overlay.webp"; // precarga para la pantalla final
  root.innerHTML = TEMPLATE;

  const out = root.querySelector<HTMLElement>(".hk-out")!;
  const skipButton = root.querySelector<HTMLButtonElement>(".hk-skip")!;
  const enterButton = root.querySelector<HTMLButtonElement>(".hk-enter")!;

  let skipped = false;
  let finished = false;
  let wake: (() => void) | null = null;

  // Espera que se puede cortar al instante cuando alguien salta la animación.
  const wait = (ms: number) =>
    new Promise<void>((resolve) => {
      if (skipped) return resolve();
      const timer = window.setTimeout(() => {
        wake = null;
        resolve();
      }, ms);
      wake = () => {
        window.clearTimeout(timer);
        resolve();
      };
    });

  const onKey = (event: KeyboardEvent) => {
    if (event.key === "Escape" || event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      skip();
    }
  };

  function finish() {
    if (finished) return;
    finished = true;
    document.removeEventListener("keydown", onKey);
    root!.classList.add("is-leaving");
    // La entrada del hero se repite justo cuando desaparece la broma.
    document.querySelectorAll<HTMLElement>(".reveal").forEach((el) => {
      el.style.animation = "none";
      void el.offsetWidth;
      el.style.animation = "";
    });
    window.setTimeout(() => {
      root!.remove();
      document.documentElement.removeAttribute("data-hack");
    }, 650);
  }

  function skip() {
    if (skipped) return;
    skipped = true;
    wake?.();
    finish();
  }

  document.addEventListener("keydown", onKey);
  root.addEventListener("pointerdown", skip);
  skipButton.focus({ preventScroll: true });

  // --- helpers de terminal -------------------------------------------------
  const line = (cls = "") => {
    const el = document.createElement("div");
    el.className = `hk-line ${cls}`.trim();
    out.appendChild(el);
    return el;
  };
  const text = (value: string, cls = "") => {
    const el = line(cls);
    el.textContent = value;
    return el;
  };

  async function typeCommand(command: string) {
    const el = line();
    el.innerHTML = `<span class="hk-prompt">root@xauendevs:~#</span> <span class="hk-typed"></span><span class="hk-cursor"></span>`;
    const typed = el.querySelector<HTMLElement>(".hk-typed")!;
    for (const char of command) {
      if (skipped) return;
      typed.textContent += char;
      await wait(16 + Math.random() * 24);
    }
    el.querySelector(".hk-cursor")?.remove();
    await wait(260);
  }

  async function row(label: string, status = "OK", delay = 260) {
    if (skipped) return;
    const el = line("hk-row");
    el.innerHTML = `<span class="hk-label"></span><i class="hk-dots"></i><b class="hk-ok"></b>`;
    el.querySelector<HTMLElement>(".hk-label")!.textContent = label;
    el.querySelector<HTMLElement>(".hk-ok")!.textContent = status;
    await wait(delay);
  }

  async function progress(label: string, duration = 1000) {
    if (skipped) return;
    const el = line("hk-row");
    el.innerHTML = `<span class="hk-label"></span><span class="hk-meter"><span class="hk-fill"></span></span><b class="hk-pct">0%</b>`;
    el.querySelector<HTMLElement>(".hk-label")!.textContent = label;
    const fill = el.querySelector<HTMLElement>(".hk-fill")!;
    const pct = el.querySelector<HTMLElement>(".hk-pct")!;
    const steps = 14;
    for (let i = 1; i <= steps; i++) {
      if (skipped) return;
      const value = Math.round((i / steps) * 100);
      fill.style.width = `${value}%`;
      pct.textContent = `${value}%`;
      await wait(duration / steps + Math.random() * 30);
    }
    await wait(150);
  }

  // --- guion ----------------------------------------------------------------
  await wait(300);
  await typeCommand("./hackear_xauendevs.sh --modo=halloween");
  if (skipped) return;

  text(`[+] Víctima detectada: ${detectVictim()}`);
  await wait(320);
  await row("[+] Saltándose el firewall");
  await row("[+] Robando todas las cookies 🍪");
  await progress("[+] Descargando tu historial de Stack Overflow");
  await row("[+] Inyectando calabazas en el DOM 🎃");
  if (skipped) return;
  text("[!] ACCESO TOTAL CONCEDIDO", "hk-warn");
  await wait(450);
  if (skipped) return;

  // Alerta
  root.classList.add("is-alert");
  await wait(1600);
  if (skipped) return;
  root.classList.remove("is-alert");

  text("> compilando broma.exe ...");
  await wait(420);
  if (skipped) return;
  text("ERROR 418: soy una tetera ☕. Esto era una broma.", "hk-warn");
  await wait(850);
  if (skipped) return;

  // Revelación
  root.classList.add("is-reveal");
  enterButton.focus({ preventScroll: true });
  await wait(4200);
  finish();
}
