// Movimiento y la parte viva de la portada. Todo es opcional: sin JS la página se ve entera.
const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let cleanups: Array<() => void> = [];

function reveal() {
  const items = document.querySelectorAll<HTMLElement>(".home [data-reveal]");
  if (!("IntersectionObserver" in window) || reduced()) {
    items.forEach((el) => el.classList.add("is-in"));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      });
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.05 },
  );
  items.forEach((el) => io.observe(el));
  // Red de seguridad: nada se queda oculto si el observador no llega a dispararse.
  const safety = window.setTimeout(() => items.forEach((el) => el.classList.add("is-in")), 4000);
  cleanups.push(() => {
    io.disconnect();
    window.clearTimeout(safety);
  });
}

/** Fundido lento entre las fotos de la sala (el gesto principal de la portada). */
function crossfade() {
  const root = document.querySelector<HTMLElement>("[data-crossfade]");
  const imgs = root ? [...root.querySelectorAll<HTMLImageElement>("img")] : [];
  if (imgs.length < 2 || reduced()) return;
  let current = 0;
  const tick = () => {
    if (document.hidden) return;
    imgs[current].classList.remove("is-on");
    current = (current + 1) % imgs.length;
    imgs[current].classList.add("is-on");
  };
  const id = window.setInterval(tick, 6000);
  cleanups.push(() => window.clearInterval(id));
}

/** Deriva suave de la foto de los resguardos al hacer scroll. */
function drift() {
  const photo = document.querySelector<HTMLElement>("[data-drift]");
  if (!photo || reduced()) return;
  const section = photo.parentElement!;
  let raf = 0;
  const update = () => {
    raf = 0;
    const r = section.getBoundingClientRect();
    const progress = (window.innerHeight - r.top) / (window.innerHeight + r.height);
    const clamped = Math.min(1, Math.max(0, progress));
    photo.style.transform = `translate3d(0, ${(clamped - 0.5) * -8}%, 0) scale(1.04)`;
  };
  const onScroll = () => {
    if (!raf) raf = requestAnimationFrame(update);
  };
  update();
  window.addEventListener("scroll", onScroll, { passive: true });
  cleanups.push(() => window.removeEventListener("scroll", onScroll));
}

/** La entrada está viva: cuenta atrás hasta la charla y cuántas personas tienen sitio. */
function ticket() {
  const live = document.querySelector<HTMLElement>("[data-countdown]");
  if (!live) return;
  const date = new Date(live.dataset.countdown!);
  const text = live.querySelector<HTMLElement>("[data-countdown-text]")!;
  const total = live.querySelector<HTMLElement>("[data-rsvp-total]")!;

  const render = () => {
    const ms = date.getTime() - Date.now();
    if (ms <= 0) {
      text.textContent = ms > -3 * 3600_000 ? "Está pasando ahora mismo." : "Esta ya pasó. Pronto, la siguiente.";
      return;
    }
    const minutes = Math.floor(ms / 60_000);
    const d = Math.floor(minutes / 1440);
    const h = Math.floor((minutes % 1440) / 60);
    const m = minutes % 60;
    const parts = d > 0 ? [`${d} ${d === 1 ? "día" : "días"}`, `${h} h`] : h > 0 ? [`${h} h`, `${m} min`] : [`${m} min`];
    text.textContent = `Empieza en ${parts.join(" y ")}.`;
  };
  render();
  const id = window.setInterval(render, 30_000);
  cleanups.push(() => window.clearInterval(id));

  const eventId = live.dataset.rsvpEvent;
  if (!eventId) return;
  fetch("/api/rsvp?eventId=" + encodeURIComponent(eventId))
    .then((r) => (r.ok ? r.json() : Promise.reject()))
    .then((data) => {
      if (typeof data?.count !== "number" || data.count < 1) return;
      total.textContent = `${data.count} ${data.count === 1 ? "persona ya tiene" : "personas ya tienen"} sitio.`;
      total.hidden = false;
    })
    .catch(() => {});
}

function init() {
  cleanups.forEach((fn) => fn());
  cleanups = [];
  if (!document.querySelector(".home")) return;
  reveal();
  crossfade();
  drift();
  ticket();
}

document.addEventListener("astro:page-load", init);
