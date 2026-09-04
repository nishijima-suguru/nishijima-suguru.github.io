---
page_id: publications
layout: page
permalink: /publications/
title: 論文一覧
nav: true
nav_order: 2
---

<p>
  Google Scholarは<a href="https://scholar.google.co.jp/citations?user=HYB-2zQAAAAJ&hl" target="_blank" rel="noopener">こちら</a>
</p>

<!-- ページ内リンク。以前は position: fixed で画面左に固定していたため、
     狭い画面では本文に重なっていた。通常フローに戻している。 -->
<nav class="page-jumplist" aria-label="ページ内リンク">
  <a href="#original-papers">原著論文</a>
  <a href="#japanese-reviews">日本語総説</a>
</nav>

<h1 id="original-papers">原著論文</h1>

<div class="publications">
  {% bibliography %}
</div>

<h1 id="japanese-reviews">日本語総説</h1>

<div class="publications">
  {% bibliography --file papers-jp.bib --template bib-jp %}
</div>
