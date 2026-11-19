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
  const viewport = byId("atlas-viewport");
  const world = byId("atlas-world");
  const image = world.querySelector("img");
  const imageRatio = Number(image.getAttribute("width")) / Number(image.getAttribute("height"));
  let scale = 1;
  let x = 0;
  let y = 0;
  let drag;
  let requestedWidth = 0;
  const tileLayer = byId("atlas-detail-tiles");
  const tiles = [
    {name:"west", left:20, top:70, width:772, height:434},
    {name:"east", left:880, top:50, width:772, height:434},
    {name:"south", left:425, top:445, width:772, height:434},
    {name:"bakery", left:650, top:215, width:560, height:315},
    {name:"bazaar", left:1100, top:246, width:560, height:315},
  ];
  const sourceWidth = Number(image.getAttribute("width"));
  const sourceHeight = Number(image.getAttribute("height"));
  for (const tile of tiles) {
    tile.left /= sourceWidth;
    tile.top /= sourceHeight;
    tile.width /= sourceWidth;
    tile.height /= sourceHeight;
  }

  function updateTiles(w, h) {
    world.style.setProperty("--pin-scale", String(1 / scale));
    tileLayer.classList.toggle("visible", scale >= 1.22);
    if (scale < 1.22) return;
    for (const tile of tiles) {
      const left = x + tile.left * w * scale;
      const top = y + tile.top * h * scale;
      const visible = left < viewport.clientWidth && top < viewport.clientHeight
        && left + tile.width * w * scale > 0 && top + tile.height * h * scale > 0;
      if (!visible || tile.image) continue;
      const detail = new Image();
      detail.alt = "";
      detail.decoding = "async";
      Object.assign(detail.style, {
        left: tile.left * 100 + "%",
        top: tile.top * 100 + "%",
        width: tile.width * 100 + "%",
        height: tile.height * 100 + "%",
      });
      detail.onload = () => detail.classList.add("loaded");
      detail.src = `/assets/game/atlas-detail-${tile.name}.webp`;
      tile.image = detail;
      tileLayer.append(detail);
    }
  }
  const pointer = new Map();
  const clamp = (value, min, max) => Math.max(min, Math.min(value, max));

  function draw() {
    const w = Math.max(viewport.clientWidth, viewport.clientHeight * imageRatio);
    const h = w / imageRatio;
    world.style.width = w + "px";
    world.style.height = h + "px";
    x = clamp(x, viewport.clientWidth - w * scale, 0);
    y = clamp(y, viewport.clientHeight - h * scale, 0);
    world.style.transform = `translate(${x}px,${y}px) scale(${scale})`;
    const sampleWidth = Math.ceil(w * scale / 128) * 128;
    if (sampleWidth !== requestedWidth) {
      requestedWidth = sampleWidth;
      image.sizes = `${sampleWidth}px`;
    }
    updateTiles(w, h);
  }

  function center(city, zoom = 1) {
    scale = zoom;
    draw();
    const [px, py] = city?.position ?? [50, 50];
    x = viewport.clientWidth / 2 - world.offsetWidth * scale * px / 100;
    y = viewport.clientHeight / 2 - world.offsetHeight * scale * py / 100;
    draw();
  }

  function zoomBy(factor, cx = viewport.clientWidth / 2, cy = viewport.clientHeight / 2) {
    const next = clamp(scale * factor, 1, 2.3);
    x = cx - (cx - x) * next / scale;
    y = cy - (cy - y) * next / scale;
    scale = next;
    draw();
  }

  const span = () => {
    const [a, b] = pointer.values();
    return b ? Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY) : 0;
  };
  viewport.addEventListener("pointerdown", (event) => {
    if (event.target.closest("button") || event.button !== 0) return;
    pointer.set(event.pointerId, event);
    drag = event;
    viewport.setPointerCapture(event.pointerId);
    viewport.classList.add("dragging");
  });
  viewport.addEventListener("pointermove", (event) => {
    if (!pointer.has(event.pointerId)) return;
    const previous = span();
    pointer.set(event.pointerId, event);
    if (previous) {
      const [a, b] = pointer.values();
      const bounds = viewport.getBoundingClientRect();
      zoomBy(span() / previous, (a.clientX + b.clientX) / 2 - bounds.left, (a.clientY + b.clientY) / 2 - bounds.top);
    }
    else if (drag?.pointerId === event.pointerId) {
      x += event.clientX - drag.clientX;
      y += event.clientY - drag.clientY;
      draw();
    }
    drag = event;
  });
  function stopDrag(event) {
    pointer.delete(event.pointerId);
    drag = pointer.values().next().value;
    if (!drag) viewport.classList.remove("dragging");
  }
  viewport.addEventListener("wheel", (event) => {
    if (!event.ctrlKey && !event.metaKey) return;
    event.preventDefault();
    const bounds = viewport.getBoundingClientRect();
    zoomBy(Math.exp(-event.deltaY * 0.008), event.clientX - bounds.left, event.clientY - bounds.top);
  }, {passive:false});
  viewport.addEventListener("pointerup", stopDrag);
  viewport.addEventListener("pointercancel", stopDrag);
  byId("zoom-in").addEventListener("click", () => zoomBy(1.25));
  byId("zoom-out").addEventListener("click", () => zoomBy(0.8));
  byId("zoom-reset").addEventListener("click", () => center());
  new ResizeObserver(draw).observe(viewport);

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
    byId("map-pins").innerHTML = cities.map((city) =>
      `<button type="button" class="atlas-pin ${city.producers ? "active-city" : "upcoming-city"}" data-city="${city.id}"
       style="left:${city.position[0]}%;top:${city.position[1]}%" aria-label="${escape(local(city.name))} · ${status(city)}"
       aria-pressed="${city === (pending ?? selected)}" title="${escape(local(city.name))} · ${status(city)}">${city.producers ? escape(local(city.name)) : "•"}</button>`).join("");
  }

  function renderStatus() {
    const mapNotice = byId("map-notice");
    mapNotice.hidden = !pending;
    mapNotice.textContent = pending ? `${local(pending.name)} · ${status(pending)}` : "";
    byId("atlas-selection").innerHTML = `<img src="${selected.scene}" alt=""><h2>${escape(local(selected.name))}</h2>
      <p>${escape(local(selected.theme))}</p><button type="button" data-open-guide>${text("Şehri keşfet", "Explore city")}</button>`;
    byId("zoom-in").setAttribute("aria-label", text("Yakınlaştır", "Zoom in"));
    byId("zoom-out").setAttribute("aria-label", text("Uzaklaştır", "Zoom out"));
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
    center(city, 1.25);
    const directory = document.querySelector(".atlas-directory");
    if (directory.open) {
      directory.open = false;
      directory.querySelector("summary").focus({preventScroll:true});
    }
  }

  document.querySelector(".atlas-overview").addEventListener("click", (event) => {
    const button = event.target.closest("[data-city]");
    if (button) choose(cities.find((city) => city.id === button.dataset.city));
    if (event.target.closest("[data-open-guide]")) {
      byId("city-heading").focus({preventScroll:true});
      byId("city-detail").scrollIntoView({block:"start"});
    }
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
  center(location.hash ? selected : null, location.hash ? 1.25 : 1);
})();
