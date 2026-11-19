(() => {
  const {cities, professions, ranks, rankProgress} = atlasCatalog;
  const byId = (id) => document.getElementById(id);
  const text = (tr, en) => lang === "tr" ? tr : en;
  const local = (label) => label[lang];
  const escape = (value) => String(value).replace(/[&<>"']/g, (c) => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const normalize = (value) => value.toLocaleLowerCase(lang).normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ı/g, "i");
  let lang = window.masterlandLanguage.current;
  let selected = cities.find((city) => city.producers && `#${city.id}` === location.hash) ?? cities[0];
  let pending = null;

  function status(city) {
    return city.producers ? text("Şehri aç", "Explore city") : text("Yakında", "Coming soon");
  }

  function renderDirectory() {
    const query = normalize(byId("atlas-search").value.trim());
    const matches = cities.filter((city) => {
      const labels = [city.name.tr, city.name.en];
      for (const producer of city.producers ?? []) {
        labels.push(producer.name.tr, producer.name.en);
        for (const item of producer.items) labels.push(item.name.tr, item.name.en);
      }
      return labels.some((label) => normalize(label).includes(query));
    });
    byId("city-directory").innerHTML = matches.length ? matches.map((city) =>
      `<button type="button" class="atlas-city ${city.producers ? "city-guide-link" : ""}" data-city="${city.id}" aria-pressed="${city === (pending ?? selected)}">
       <span class="atlas-city-index">${cities.indexOf(city) + 1}</span><span>${escape(local(city.name))}</span><small>${status(city)}</small>
       </button>`).join("") : `<p>${text("Sonuç bulunamadı.", "No results found.")}</p>`;
  }

  function renderPins() {
    byId("map-pins").innerHTML = cities.map((city, i) =>
      `<button type="button" class="atlas-pin ${city.producers ? "active-city" : "upcoming-city"}" data-city="${city.id}"
       style="left:${city.position[0]}%;top:${city.position[1]}%" aria-label="${escape(local(city.name))} · ${status(city)}"
       aria-pressed="${city === (pending ?? selected)}" title="${escape(local(city.name))} · ${status(city)}">${i + 1}</button>`).join("");
  }

  function renderStatus() {
    const mapNotice = byId("map-notice");
    mapNotice.hidden = !pending;
    mapNotice.textContent = pending ? `${local(pending.name)} · ${status(pending)}` : "";
    byId("atlas-status").textContent = pending
      ? `${local(pending.name)} · ${text("Yakında", "Coming soon")}`
      : text("Altın işaretler şehir rehberini açar.", "Gold markers open city guides.");
  }

  function renderDetail() {
    const city = selected;
    const cityProfessions = [...new Set(city.producers.map((producer) => producer.profession))];
    const itemCount = city.producers.reduce((sum, producer) => sum + producer.items.length, 0);
    byId("city-detail").innerHTML = `
      <header class="city-guide-heading">
        <div><h2 id="city-heading" tabindex="-1">${escape(local(city.name))}</h2><p>${escape(local(city.theme))}</p>
          <p>${city.producers.length} ${text("üretici", "producers")} · ${itemCount} ${text("ürün", "items")}</p></div>
        <img src="${city.scene}" alt="" width="220" height="120" loading="lazy">
      </header>
      <h3>${text("Üretim zincirleri", "Production chains")}</h3>
      <div class="chain-list">${city.producers.map((producer, i) => `
        <details${i === 0 ? " open" : ""}>
          <summary><img src="${producer.image}" alt="" width="42" height="42" loading="lazy">
            <span><strong>${escape(local(producer.name))}</strong><small>${escape(local(professions[producer.profession]))} · ${producer.items.length} ${text("ürün", "items")}</small></span></summary>
          <ol>${producer.items.map((item) => `<li>${atlasArt.sprite(item.sprite)}<span>${escape(local(item.name))}</span></li>`).join("")}</ol>
        </details>`).join("")}</div>
      <section class="city-mastery">
        <h3>${text("Ustalık ve ödüller", "Mastery and rewards")}</h3>
        <p>${cityProfessions.map((id) => escape(local(professions[id]))).join(" · ")}</p>
        <p>${text("Bir şehrin tüm uzmanlıklarında aynı kademeye ulaş ve birleşik unvanı kazan.", "Reach the same rank in every specialty to earn the combined city title.")}</p>
        <details><summary>${text("Unvanları ve ödülleri gör", "See titles and rewards")}</summary>
          <ol>${ranks.map((rank, i) => `<li><strong>${escape(local(rank))} ${escape(local(city.combo))}</strong><span>${atlasArt.rank(rankProgress[i], lang)}</span><small>${cityProfessions.map((id) => escape(local(rank) + " " + local(professions[id]))).join(" · ")}</small></li>`).join("")}</ol>
        </details>
      </section>`;
  }

  function refreshSelection() {
    document.querySelectorAll("[data-city]").forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.city === (pending ?? selected).id));
    });
    renderStatus();
  }

  function choose(city) {
    if (!city.producers) {
      pending = city;
      refreshSelection();
      return;
    }
    pending = null;
    selected = city;
    history.replaceState(null, "", `#${city.id}`);
    refreshSelection();
    renderDetail();
    const heading = byId("city-heading");
    heading.focus({preventScroll:true});
    byId("city-detail").scrollIntoView({block:"start"});
  }

  document.querySelector(".atlas-overview").addEventListener("click", (event) => {
    const button = event.target.closest("[data-city]");
    if (button) choose(cities.find((city) => city.id === button.dataset.city));
  });
  byId("atlas-search").addEventListener("input", renderDirectory);
  window.addEventListener("masterland:language", (event) => {
    lang = event.detail;
    document.title = text("Masterland Atlası", "Masterland World Atlas");
    renderPins();
    renderDirectory();
    renderStatus();
    renderDetail();
  });
  if (location.hash === `#${selected.id}`) {
    window.addEventListener("load", () => byId("city-detail").scrollIntoView(), {once:true});
  }
})();
