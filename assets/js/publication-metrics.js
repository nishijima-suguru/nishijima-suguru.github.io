/**
 * Live publication badges from OpenAlex.
 *
 * Every publication entry rendered by _layouts/bib.liquid carries its DOI on a
 * `[data-metrics-for]` element. This resolves all of them against OpenAlex in a
 * single batched request (OpenAlex ORs up to 50 values per filter, so the whole
 * bibliography is normally one round trip) and adds at most two badges:
 *
 *   - the citation percentile, and only when it is genuinely notable
 *
 * Raw citation counts are deliberately absent: the Altmetric and Dimensions
 * badges beside each entry already carry numbers, and a third one per paper
 * buried the papers themselves.
 *
 * Everything here is progressive enhancement. The slots are empty in the served
 * HTML, so a failed request or a reader without JS sees the bibliography exactly
 * as it was before, with no empty frames or spinners left behind.
 */
(function () {
  "use strict";

  var CONFIG = window.__pubMetrics || {};
  var S = CONFIG.strings || {};
  var API = "https://api.openalex.org/works";
  var BATCH = 40; // OpenAlex allows 50 OR'ed filter values; leave headroom.
  var SELECT = ["doi", "citation_normalized_percentile"].join(",");

  // Below this, a percentile is not worth the pixels — "top 43%" says nothing.
  var PERCENTILE_FLOOR = 0.9;

  var slots = Array.prototype.slice.call(document.querySelectorAll("[data-metrics-for]"));
  if (!slots.length) return;

  /** OpenAlex returns DOIs as full https://doi.org/... URLs; entries store bare ones. */
  function normalizeDoi(doi) {
    if (!doi) return "";
    return String(doi)
      .trim()
      .toLowerCase()
      .replace(/^https?:\/\/(dx\.)?doi\.org\//, "");
  }

  function chunk(arr, size) {
    var out = [];
    for (var i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
    return out;
  }

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined && text !== null) node.textContent = text;
    return node;
  }

  var dois = [];
  var slotByDoi = {};
  slots.forEach(function (slot) {
    var doi = normalizeDoi(slot.getAttribute("data-metrics-for"));
    if (!doi) return;
    if (!slotByDoi[doi]) {
      slotByDoi[doi] = [];
      dois.push(doi);
    }
    slotByDoi[doi].push(slot);
  });
  if (!dois.length) return;

  function fetchBatch(batch) {
    var url =
      API +
      "?filter=doi:" +
      batch.map(encodeURIComponent).join("|") +
      "&per-page=" +
      batch.length +
      "&select=" +
      SELECT +
      (CONFIG.mailto ? "&mailto=" + encodeURIComponent(CONFIG.mailto) : "");
    return fetch(url, { headers: { Accept: "application/json" } }).then(function (res) {
      if (!res.ok) throw new Error("OpenAlex responded " + res.status);
      return res.json();
    });
  }

  function badge(label, title) {
    var chip = el("span", "metric");
    if (title) chip.title = title;
    chip.appendChild(el("span", "metric-label", label));
    return chip;
  }

  function renderEntry(slot, work) {
    var frag = document.createDocumentFragment();

    var pct = work.citation_normalized_percentile;
    if (pct && typeof pct.value === "number" && pct.value >= PERCENTILE_FLOOR) {
      var topN = Math.max(1, Math.round((1 - pct.value) * 100));
      var chip = badge((S.top_pct || "Top %{n}%").replace("%{n}", topN), S.percentile_title || "");
      chip.classList.add("metric-highlight");
      frag.appendChild(chip);
    }

    if (frag.childNodes.length) {
      slot.appendChild(frag);
      slot.classList.add("is-loaded");
    }
  }

  Promise.all(chunk(dois, BATCH).map(fetchBatch))
    .then(function (responses) {
      responses.forEach(function (payload) {
        (payload.results || []).forEach(function (work) {
          var key = normalizeDoi(work.doi);
          (slotByDoi[key] || []).forEach(function (slot) {
            renderEntry(slot, work);
          });
        });
      });
    })
    .catch(function (err) {
      // Leave the empty slots alone — a bibliography with no badges is a fine
      // fallback, and an error banner on every entry would be worse than silence.
      if (window.console && console.warn) console.warn("Publication badges unavailable:", err);
    });
})();
