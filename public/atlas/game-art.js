const atlasArt = {
  sprite(crop) {
    const [src, sw, sh, x, y, width, height] = crop;
    const scale = 46 / Math.max(width, height);
    return `<span class="game-sprite" style="width:${width * scale}px;height:${height * scale}px"><img alt="" loading="lazy" decoding="async" src="${src}" style="width:${sw * scale}px;height:${sh * scale}px;left:${-x * scale}px;top:${-y * scale}px"></span>`;
  },
  rank(progress, lang) {
    const labels = lang === "tr" ? {gold:"altın",energy:"enerji",gems:"elmas"} : {gold:"coins",energy:"energy",gems:"gems"};
    const rewards = Object.entries(progress.reward).map(([key, value]) => `${value} ${labels[key]}`).join(" · ");
    return lang === "tr" ? `${progress.target} sipariş · ${rewards}` : `${progress.target} orders · ${rewards}`;
  }
};
