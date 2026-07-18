const root = document.documentElement;
const header = document.querySelector("[data-header]");
const menuToggle = document.querySelector("[data-menu-toggle]");
const mobileNav = document.querySelector("[data-mobile-nav]");
const themeToggle = document.querySelector("[data-theme-toggle]");
const filterButtons = [...document.querySelectorAll("[data-filter]")];
const projectCards = [...document.querySelectorAll(".project-card[data-kind]")];
const copyEmailButton = document.querySelector("[data-copy-email]");
const copyStatus = document.querySelector("[data-copy-status]");
const email = "2412227@mail.nankai.edu.cn";

function setTheme(theme) {
  root.dataset.theme = theme;
  localStorage.setItem("harry-site-theme", theme);

  if (themeToggle) {
    themeToggle.innerHTML = theme === "dark" ? '<i data-lucide="sun"></i>' : '<i data-lucide="moon"></i>';
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }
}

const savedTheme = localStorage.getItem("harry-site-theme");
if (savedTheme) {
  setTheme(savedTheme);
} else {
  const prefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;
  setTheme(prefersLight ? "light" : "dark");
}

window.addEventListener("scroll", () => {
  header?.classList.toggle("is-scrolled", window.scrollY > 12);
});

menuToggle?.addEventListener("click", () => {
  const isOpen = mobileNav?.classList.toggle("is-open");
  document.body.classList.toggle("menu-open", Boolean(isOpen));
  menuToggle.setAttribute("aria-expanded", String(Boolean(isOpen)));
  menuToggle.innerHTML = isOpen ? '<i data-lucide="x"></i>' : '<i data-lucide="menu"></i>';
  window.lucide?.createIcons();
});

mobileNav?.addEventListener("click", (event) => {
  if (event.target instanceof HTMLAnchorElement) {
    mobileNav.classList.remove("is-open");
    document.body.classList.remove("menu-open");
    menuToggle?.setAttribute("aria-expanded", "false");
    if (menuToggle) {
      menuToggle.innerHTML = '<i data-lucide="menu"></i>';
      window.lucide?.createIcons();
    }
  }
});

themeToggle?.addEventListener("click", () => {
  setTheme(root.dataset.theme === "dark" ? "light" : "dark");
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const filter = button.dataset.filter || "all";

    filterButtons.forEach((item) => {
      const active = item === button;
      item.classList.toggle("is-active", active);
      item.setAttribute("aria-selected", String(active));
    });

    projectCards.forEach((card) => {
      const kinds = card.dataset.kind?.split(" ") || [];
      card.classList.toggle("is-hidden", filter !== "all" && !kinds.includes(filter));
    });
  });
});

copyEmailButton?.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(email);
    if (copyStatus) {
      copyStatus.textContent = "已复制";
    }
  } catch {
    window.location.href = `mailto:${email}`;
  }

  window.setTimeout(() => {
    if (copyStatus) {
      copyStatus.textContent = "复制邮箱地址";
    }
  }, 1600);
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);

document.querySelectorAll(".reveal").forEach((item) => revealObserver.observe(item));

function setupSignalCanvas() {
  const canvas = document.querySelector("[data-signal-canvas]");
  if (!(canvas instanceof HTMLCanvasElement)) return;

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const context = canvas.getContext("2d");
  if (!context) return;

  let width = 0;
  let height = 0;
  let points = [];
  let animationId = 0;

  function resize() {
    const rect = canvas.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    width = Math.max(1, Math.floor(rect.width));
    height = Math.max(1, Math.floor(rect.height));
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);

    const count = Math.max(30, Math.floor((width * height) / 38000));
    points = Array.from({ length: count }, (_, index) => ({
      x: (index * 127) % width,
      y: (index * 233) % height,
      vx: ((index % 5) - 2) * 0.08,
      vy: (((index + 2) % 5) - 2) * 0.08,
      phase: index * 0.37
    }));
  }

  function draw(time = 0) {
    context.clearRect(0, 0, width, height);
    context.fillStyle = root.dataset.theme === "light" ? "rgba(220, 231, 232, 0.72)" : "rgba(16, 22, 26, 0.72)";
    context.fillRect(0, 0, width, height);

    const accent = root.dataset.theme === "light" ? "36, 88, 211" : "117, 215, 188";
    const secondary = root.dataset.theme === "light" ? "15, 113, 95" : "143, 179, 255";

    points.forEach((point, index) => {
      if (!prefersReducedMotion) {
        point.x += point.vx + Math.sin(time * 0.0004 + point.phase) * 0.05;
        point.y += point.vy + Math.cos(time * 0.0004 + point.phase) * 0.05;
      }

      if (point.x < 0) point.x = width;
      if (point.x > width) point.x = 0;
      if (point.y < 0) point.y = height;
      if (point.y > height) point.y = 0;

      for (let otherIndex = index + 1; otherIndex < points.length; otherIndex += 1) {
        const other = points[otherIndex];
        const dx = point.x - other.x;
        const dy = point.y - other.y;
        const distance = Math.hypot(dx, dy);
        if (distance < 150) {
          const alpha = (1 - distance / 150) * 0.24;
          context.strokeStyle = `rgba(${accent}, ${alpha})`;
          context.lineWidth = 1;
          context.beginPath();
          context.moveTo(point.x, point.y);
          context.lineTo(other.x, other.y);
          context.stroke();
        }
      }

      context.fillStyle = `rgba(${index % 3 === 0 ? secondary : accent}, 0.72)`;
      context.fillRect(point.x - 1.5, point.y - 1.5, 3, 3);
    });

    if (!prefersReducedMotion) {
      animationId = window.requestAnimationFrame(draw);
    }
  }

  window.addEventListener("resize", resize);
  resize();
  draw();

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      window.cancelAnimationFrame(animationId);
    } else if (!prefersReducedMotion) {
      animationId = window.requestAnimationFrame(draw);
    }
  });
}

window.addEventListener("load", () => {
  window.lucide?.createIcons();
  setupSignalCanvas();
});
