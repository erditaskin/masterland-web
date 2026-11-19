const atlasArt = {
  status(city, lang) {
    const active = city.release === "playable";
    return lang === "tr"
      ? (active ? "Oyunda" : "Yakında")
      : (active ? "In game" : "Coming soon");
  },
  sprite(crop) {
    if (!crop) return "";
    const [src, sw, sh, x, y, width, height] = crop;
    const scale = 46 / Math.max(width, height);
    return `<span class="game-sprite" style="width:${width * scale}px;height:${height * scale}px"><img alt="" aria-hidden="true" loading="lazy" decoding="async" src="${src}" style="width:${sw * scale}px;height:${sh * scale}px;left:${-x * scale}px;top:${-y * scale}px"></span>`;
  },
  producer(src) {
    return src ? `<img class="game-producer" src="${src}" alt="" width="46" height="46" loading="lazy">` : "";
  },
  standards(lang) {
    const tr = lang === "tr";
    const rows = tr ? [
      ["Tahta ve sürükleme", "6 × 9 ortak tahta. Ürünler hücreye orantılı ve ortalı oturur. Sürüklerken kaynak ürün ve vurgusu gizlenir. Geçersiz bırakmada ürün yerine döner."],
      ["Siparişler", "Bir, iki ve üç farklı ürün isteyen kartlar 1×, 1,25× ve 1,5× genişliğinde. Hazır siparişler öne gelir ve yeşil görünür. Tahtada tamamlanabilir siparişlerin ürünleri açık yeşil, karşılanmış kısmi gereksinimler koyu yeşil vurgulanır."],
      ["Üreticiler", "Beş üretici, ortalı ikonlar. Enerji ve bekleme göstergeleri altta. Üretici ayrıntısındaki ikon rafla aynı ölçekte."],
      ["Şehir teması", "Arka plan ekranı doldurur ve sayfalar arasında sabit kalır. Tabela, ilan, raf, tahta ve alt menü kendi şeffaf katmanlarına sahiptir. Metinler ve ikonlar oyun tarafından eklenir."],
      ["Ortak ekranlar", "Tahta, Koleksiyon, Şehirler, Depo ve Market aynı menü düzenini kullanır. Hesap, ayarlar ve şehir başarıları ortak arayüzü paylaşır."]
    ] : [
      ["Board and dragging", "Shared 6 × 9 grid with proportionally sized and centered items. The source item and highlight disappear during dragging. An invalid drop returns the item to its cell."],
      ["Orders", "Cards for one, two and three distinct products use 1×, 1.25× and 1.5× widths. Ready orders move first and turn green. The board uses bright green for items in ready orders and dark green for satisfied requirements in incomplete orders."],
      ["Producers", "Five producers with centered icons and compact energy and cooldown indicators at the bottom. Producer details use the shelf icon size."],
      ["City theme", "The full-screen city background stays consistent across pages. Sign, orders, shelf, board and bottom navigation use separate transparent layers with game-rendered text and icons."],
      ["Shared screens", "Board, Collection, Cities, Storage and Market share the navigation layout. Account, settings and city achievements share the same interface."]
    ];
    return `<section class="game-standards"><h2>${tr ? "Ortak şehir standardı" : "Shared city standard"}</h2><dl>${rows.map(([title, body]) => `<div><dt>${title}</dt><dd>${body}</dd></div>`).join("")}</dl></section>`;
  },
  rank(progress, lang) {
    const labels = lang === "tr" ? {gold:"altın",energy:"enerji",gems:"elmas"} : {gold:"coins",energy:"energy",gems:"gems"};
    const rewards = Object.entries(progress.reward).map(([key, value]) => `${value} ${labels[key]}`).join(" · ");
    return lang === "tr" ? `${progress.target} sipariş · ${rewards}` : `${progress.target} orders · ${rewards}`;
  }
};
