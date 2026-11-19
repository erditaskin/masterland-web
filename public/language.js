(() => {
  const key = "masterland-language";
  const isLanguage = (value) => value === "tr" || value === "en";
  let selected;
  try {
    const saved = localStorage.getItem(key);
    if (isLanguage(saved)) selected = saved;
  } catch {}

  function apply(lang) {
    document.documentElement.lang = lang;
    document.querySelectorAll("[data-language]").forEach((element) => {
      element.hidden = element.dataset.language !== lang;
    });
    document.querySelectorAll("[data-tr]").forEach((element) => {
      element.textContent = element.dataset[lang];
    });
    document.querySelectorAll("[data-set-language]").forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.setLanguage === lang));
    });
    window.dispatchEvent(new CustomEvent("masterland:language", { detail: lang }));
  }

  window.masterlandLanguage = {
    current: selected ?? "en",
    choose(lang) {
      if (!isLanguage(lang)) return;
      selected = this.current = lang;
      try {
        localStorage.setItem(key, lang);
      } catch {}
      apply(lang);
    },
  };

  document.addEventListener("DOMContentLoaded", () => {
    const language = window.masterlandLanguage;
    apply(language.current);
    document.querySelectorAll("[data-set-language]").forEach((button) => {
      button.addEventListener("click", () => language.choose(button.dataset.setLanguage));
    });
    if (selected) return;

    // Cloudflare supplies the visitor's ISO country code on the same origin.
    fetch("/cdn-cgi/trace", { credentials: "omit", signal: AbortSignal.timeout(2500) })
      .then((response) => response.ok ? response.text() : "")
      .then((trace) => {
        if (!selected && /^loc=TR\s*$/m.test(trace)) {
          language.current = "tr";
          apply("tr");
        }
      })
      .catch(() => {});
  }, { once: true });
})();
