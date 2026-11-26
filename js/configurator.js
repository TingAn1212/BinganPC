/* BingAn PCs — configurator.js
   Prices mirror the `New Pricing` tab in the resale workbook (2026-11-20):
   tiers 900 / 1,050 / 1,300 · 500GB −40 · RGB +30 · DS900M +25 (Tier 1 only) ·
   Aqua Uno has no price change on Tiers 2 and 3 · monitor 165 · Windows S$155,
   free during the Holiday Sale. Warranty: 6 months S$80 / 1 year S$150, the
   same on every tier. If the tab changes, these numbers change with it. */

const TIERS = {
  "1": { name: "Tier 1 · Everyday", price: 900, spec: "RTX 3060 · Ryzen 5 3600 · 16GB · 1TB",
         case: "Aqua Uno", warranty: { "6m": 80, "12m": 150 } },
  "2": { name: "Tier 2 · Performance", price: 1050, spec: "RTX 3070 · Ryzen 5 5600 · 16GB · 1TB",
         case: "DarkFlash DS900M", warranty: { "6m": 80, "12m": 150 } },
  "3": { name: "Tier 3 · Enthusiast", price: 1300, spec: "RTX 3080 · Ryzen 5 5600X · 16GB · 1TB",
         case: "DarkFlash DS900M", warranty: { "6m": 80, "12m": 150 } },
};

const MONITOR_PRICE = 165;
const WINDOWS_PRICE = 155;
const WINDOWS_SALE_TEXT = "Free (Holiday Sale)";
const CASE_UPGRADE = 25; // Tier 1 -> DS900M; Aqua Uno stays same price on Tiers 2 and 3

const money = (n) => (n < 0 ? `−S$${Math.abs(n)}` : `S$${n.toLocaleString("en-SG")}`);

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("config");
  if (!form) return;

  const list = document.getElementById("summary-list");
  const totalEl = document.getElementById("summary-total");
  const caseHint = document.getElementById("case-hint");
  const w6 = document.getElementById("warranty-6m");
  const w12 = document.getElementById("warranty-12m");
  const copyBtn = document.getElementById("copy-spec");
  const copyNote = document.getElementById("copy-note");

  const val = (name) => {
    const el = form.querySelector(`input[name="${name}"]:checked`);
    return el ? el.value : null;
  };

  function current() {
    const tier = val("tier") || "1";
    const t = TIERS[tier];
    const warn = val("warranty") || "none";
    // Tier 1 ships in the Aqua Uno; the DS900M is a S$25 upgrade. Tiers 2 and 3
    // ship in the DS900M and can switch to the Aqua Uno at the same price.
    const isTier1 = tier === "1";
    const altCase = val("case") === "alt";
    const caseDelta = altCase && isTier1 ? CASE_UPGRADE : 0;
    const caseName = altCase ? (isTier1 ? "DarkFlash DS900M" : "Aqua Uno") : t.case;
    const warnAmount = warn === "none" ? 0 : t.warranty[warn];

    const lines = [
      { label: "Base", value: t.name, amount: t.price, isBase: true },
      { label: "Storage", value: val("storage") === "500gb" ? "500GB NVMe" : "1TB NVMe",
        amount: val("storage") === "500gb" ? -40 : 0 },
      { label: "Lighting", value: val("lighting") === "rgb" ? "RGB sync" : "Standard lighting",
        amount: val("lighting") === "rgb" ? 30 : 0 },
      { label: "Case", value: caseName, amount: caseDelta },
      { label: "Monitor", value: val("monitor") === "yes" ? '27" 1440p 180Hz' : "None",
        amount: val("monitor") === "yes" ? MONITOR_PRICE : 0 },
      { label: "Warranty",
        value: warn === "none" ? "None — S$50 diagnostic if needed" : warn === "6m" ? "6 months" : "1 year",
        amount: warnAmount },
      { label: "Windows", value: val("windows") === "yes" ? "Windows 11 activation" : "Not included",
        amount: 0,
        struck: val("windows") === "yes" ? WINDOWS_PRICE : null,
        sale: val("windows") === "yes" ? WINDOWS_SALE_TEXT : null },
    ];
    return { tier: t, lines, total: lines.reduce((s, l) => s + l.amount, 0) };
  }

  function render() {
    const { tier, lines, total } = current();

    list.innerHTML = lines
      .map((l) => {
        const delta = l.sale
          ? `<s class="price-was">${money(l.struck)}</s> <span class="sale-text">${l.sale}</span>`
          : !l.amount ? "" : l.isBase ? money(l.amount) : `${l.amount > 0 ? "+" : ""}${money(l.amount)}`;
        return `<li><span>${l.label}</span><b>${l.value}</b>${delta ? `<i>${delta}</i>` : ""}</li>`;
      })
      .join("");
    totalEl.textContent = money(total);

    const t = TIERS[val("tier") || "1"];
    if (w6) w6.textContent = `+${money(t.warranty["6m"])}`;
    if (w12) w12.textContent = `+${money(t.warranty["12m"])}`;

    if (caseHint) {
      const tier1 = val("tier") === "1";
      const stock = document.getElementById("case-stock");
      const alt = document.getElementById("case-alt");
      if (stock) stock.innerHTML = tier1
        ? "Aqua Uno<em>included</em>"
        : "DarkFlash DS900M<em>included</em>";
      if (alt) alt.innerHTML = tier1
        ? "DarkFlash DS900M<em>+S$25</em>"
        : "Aqua Uno<em>your pick</em>";
      if (caseHint) caseHint.textContent = tier1
        ? "Tier 1 ships in the Aqua Uno — the DS900M is +S$25."
        : "Tiers 2 and 3 ship in the DS900M — the Aqua Uno is also available at the same price.";
    }
    if (copyNote) copyNote.hidden = true;
  }

  function specText() {
    const { tier, lines, total } = current();
    const body = lines
      .map((l) => {
        const suffix = l.sale
          ? ` (${money(l.struck)} — ${l.sale})`
          : l.amount && !l.isBase ? ` (${l.amount > 0 ? "+" : ""}${money(l.amount)})` : "";
        return `- ${l.label}: ${l.value}${suffix}`;
      })
      .join("\n");
    return `Hi BingAn PCs, I'd like this build:\n\n${body}\n\nEstimated total: ${money(total)}\n\n(${tier.spec})`;
  }

  form.addEventListener("change", render);
  form.addEventListener("input", render);

  copyBtn?.addEventListener("click", async () => {
    const text = specText();
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    if (copyNote) copyNote.hidden = false;
  });

  render();
});
