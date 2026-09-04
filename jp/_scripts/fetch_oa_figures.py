#!/usr/bin/env python3
"""Download the lead figure of each open-access paper in the bibliography.

Publisher PDFs are copyrighted, but an article published under CC BY (or CC
BY-NC) may be redistributed with attribution — figures included. This script
finds which of your papers qualify and pulls their lead figure so it can be used
as the entry thumbnail, instead of you exporting one by hand for every paper.

The pipeline, per DOI:

  1. Europe PMC search  -> PMCID + the article's license string.
  2. The license gate   -> anything that is not a CC licence permitting reuse is
                           skipped. This is the whole point; do not loosen it.
  3. fullTextXML        -> the <fig> elements, in document order.
  4. PMC's image CDN    -> the actual JPEG, resolved from the `image-cloudpmc-urn`
                           processing instruction that PMC embeds beside each
                           <graphic>.

Images are downloaded once and committed to the repo rather than hotlinked, so
the site does not depend on NCBI being up and jekyll-imagemagick can generate
the responsive webp variants.

Usage:
    python3 _scripts/fetch_oa_figures.py              # report only, no writes
    python3 _scripts/fetch_oa_figures.py --download   # also save the images
    python3 _scripts/fetch_oa_figures.py --download --write-bib
"""

from __future__ import annotations

import argparse
import json
import re
import sys
import time
import urllib.parse
import urllib.request
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
BIB = REPO / "_bibliography" / "papers.bib"
OUT_DIR = REPO / "assets" / "img" / "publication_preview"

EPMC = "https://www.ebi.ac.uk/europepmc/webservices/rest"
PMC_CDN = "https://cdn.ncbi.nlm.nih.gov/pmc/"
UA = "nishijima-suguru.github.io figure fetcher (+https://nishijima-suguru.github.io)"

# Licences that permit redistribution of the figure with attribution. Europe PMC
# reports these lowercased and unpunctuated, e.g. "cc by", "cc by-nc-nd".
# ND ("no derivatives") still allows verbatim reproduction, so it stays in.
ALLOWED_LICENSES = ("cc by", "cc-by", "cc0", "public domain")


def get(url: str, timeout: int = 30, attempts: int = 3) -> bytes:
    """GET with retries — Europe PMC returns an occasional 504 under load."""
    last = None
    for attempt in range(attempts):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA})
            with urllib.request.urlopen(req, timeout=timeout) as resp:
                return resp.read()
        except Exception as exc:  # noqa: BLE001
            last = exc
            if attempt < attempts - 1:
                time.sleep(2 * (attempt + 1))
    raise last  # type: ignore[misc]


# @string / @comment / @preamble are bibtex directives, not works. Matching them
# as entries made the parser hand the *next* entry's DOI to a bogus citekey.
NON_ENTRY_TYPES = {"string", "comment", "preamble"}


def parse_bib(path: Path) -> list[tuple[str, str, str]]:
    """Return (citekey, doi, title) for every entry that has a DOI."""
    text = path.read_text(encoding="utf-8")
    out = []
    for match in re.finditer(r"@(\w+)\{([^,]+),(.*?)\n\}", text, re.S):
        entry_type, key, body = match.group(1).lower(), match.group(2).strip(), match.group(3)
        if entry_type in NON_ENTRY_TYPES:
            continue
        doi = re.search(r"doi\s*=\s*\{([^}]*)\}", body)
        title = re.search(r"title\s*=\s*\{([^}]*)\}", body)
        if doi:
            out.append((key, doi.group(1).strip(), (title.group(1) if title else "").strip()))
    return out


def lookup(doi: str) -> dict | None:
    """Europe PMC record for a DOI, or None if it has none."""
    query = urllib.parse.quote(f'DOI:"{doi}"')
    url = f"{EPMC}/search?query={query}&resultType=core&format=json"
    try:
        data = json.loads(get(url))
    except Exception as exc:  # noqa: BLE001 - report and move on
        print(f"    ! Europe PMC lookup failed: {exc}", file=sys.stderr)
        return None
    results = data.get("resultList", {}).get("result", [])
    return results[0] if results else None


def license_ok(license_str: str) -> bool:
    lic = (license_str or "").strip().lower()
    return any(lic.startswith(prefix) for prefix in ALLOWED_LICENSES)


def lead_figure(pmcid: str) -> tuple[str, str, str] | None:
    """(cdn_path, filename, label) of the figure to use, or None.

    Prefers a graphical abstract when the journal supplies one — it is designed
    to stand alone at thumbnail size, which is exactly what is wanted here —
    and otherwise takes the first numbered figure.
    """
    try:
        xml = get(f"{EPMC}/{pmcid}/fullTextXML").decode("utf-8", "replace")
    except Exception as exc:  # noqa: BLE001
        print(f"    ! full text unavailable: {exc}", file=sys.stderr)
        return None

    figures = []
    for fig in re.findall(r"<fig\b.*?</fig>", xml, re.S):
        urn = re.search(r"<\?image-cloudpmc-urn\s+urn:cdn:([^?]+?)\s*\?>", fig)
        name = re.search(r'xlink:href="([^"]+)"', fig)
        if not urn or not name:
            continue
        label = re.search(r"<label>(.*?)</label>", fig, re.S)
        label_text = re.sub(r"<[^>]+>", "", label.group(1)).strip() if label else ""
        figures.append((urn.group(1).strip(), name.group(1), label_text))

    # Some <fig> elements are typeset tables. A table rendered at thumbnail size
    # is unreadable noise, so they never win.
    figures = [f for f in figures if not f[2].lower().lstrip().startswith("table")]
    if not figures:
        return None
    for fig in figures:
        if "graphical abstract" in fig[2].lower():
            return fig
    return figures[0]


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--download", action="store_true", help="save the images to assets/img/publication_preview/")
    ap.add_argument("--write-bib", action="store_true", help="add preview/preview_license keys to papers.bib")
    args = ap.parse_args()

    entries = parse_bib(BIB)
    print(f"{len(entries)} entries with a DOI in {BIB.relative_to(REPO)}\n")

    found: dict[str, dict] = {}
    for key, doi, title in entries:
        print(f"  {key}  ({doi})")
        record = lookup(doi)
        time.sleep(0.34)  # be polite to Europe PMC
        if not record:
            print("    - not in Europe PMC")
            continue

        lic = record.get("license", "")
        pmcid = record.get("pmcid")
        if not pmcid:
            print(f"    - no PMC record (license: {lic or 'unknown'})")
            continue
        if not license_ok(lic):
            print(f"    - license '{lic or 'unknown'}' does not permit reuse — skipped")
            continue

        fig = lead_figure(pmcid)
        time.sleep(0.34)
        if not fig:
            print(f"    - {pmcid}, license '{lic}', but no extractable figure")
            continue

        cdn_path, filename, label = fig
        ext = Path(filename).suffix or ".jpg"
        target = OUT_DIR / f"{key}{ext}"
        url = PMC_CDN + cdn_path
        print(f"    + {pmcid}  license '{lic}'  {label or 'Figure 1'}  -> {target.name}")

        found[key] = {"license": lic, "pmcid": pmcid, "file": target.name, "label": label or "Figure 1"}

        if args.download:
            OUT_DIR.mkdir(parents=True, exist_ok=True)
            try:
                target.write_bytes(get(url, timeout=60))
                print(f"      downloaded {target.stat().st_size:,} bytes")
            except Exception as exc:  # noqa: BLE001
                print(f"      ! download failed: {exc}", file=sys.stderr)
                found.pop(key, None)
            time.sleep(0.34)

    print(f"\n{len(found)} of {len(entries)} papers have a reusable lead figure.")

    if args.write_bib and found:
        text = BIB.read_text(encoding="utf-8")
        for key, info in found.items():
            if re.search(rf"@\w+\{{{re.escape(key)},[^@]*?preview\s*=", text, re.S):
                continue  # already has one; never clobber a hand-picked image
            attribution = f"{info['label']} from {info['pmcid']}, {info['license'].upper()}"
            text = re.sub(
                rf"(@\w+\{{{re.escape(key)},\n)",
                rf"\1  preview = {{{info['file']}}},\n  preview_license = {{{attribution}}},\n",
                text,
                count=1,
            )
        BIB.write_text(text, encoding="utf-8")
        print(f"Updated {BIB.relative_to(REPO)}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
