module.exports = {
  content: ["_site/**/*.html", "_site/**/*.js"],
  css: ["_site/assets/css/*.css"],
  output: "_site/assets/css/",
  skippedContentGlobs: ["_site/assets/**/*.html"],

  // These class names never appear in the built HTML — assets/js/publication-metrics.js
  // creates the elements at runtime after OpenAlex responds. PurgeCSS does scan the JS
  // and its default extractor should find them as string literals, but if it ever misses
  // one the badge silently renders unstyled in production and nowhere else. Cheap insurance.
  safelist: ["metric", "metric-label", "metric-highlight", "is-loaded"],
};
