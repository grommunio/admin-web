#!/usr/bin/env python3
"""Scan source code for i18n keys and sync them into all locale files.

Extracts literal-string arguments from:
  - t("key") / t('key')
  - <Trans>key</Trans>
  - <Trans i18nKey="key">...</Trans>

For each locale file in the i18n directory:
  - Missing keys are added (value = key for en-US, empty string otherwise).
  - Existing translations are preserved.
  - Keys are written sorted, 4-space indented, UTF-8 (no ASCII escaping).

Keys found in locale files but NOT in source are reported as stale but left
in place (they may be referenced dynamically). Remove them manually if sure.
"""
import json
import os
import re
import sys
from pathlib import Path

SRC_EXTS = {".ts", ".tsx", ".js", ".jsx"}

# t("...") or t('...') — captures the first literal string argument.
# Handles escape sequences inside the string.
T_CALL_RE = re.compile(
    r"""\bt\(\s*(?P<q>["'])(?P<s>(?:\\.|(?!(?P=q)).)*)(?P=q)""",
    re.DOTALL,
)

# <Trans i18nKey="..."> — key comes from the attribute.
TRANS_KEY_RE = re.compile(
    r"""<Trans\b[^>]*\bi18nKey\s*=\s*(?P<q>["'])(?P<s>[^"']+)(?P=q)""",
)

# <Trans>plain text</Trans> — only when there are no JSX children or expressions.
TRANS_TEXT_RE = re.compile(
    r"""<Trans\s*>\s*(?P<s>[^<{>][^<{]*?)\s*</Trans>""",
    re.DOTALL,
)


def unescape(s: str) -> str:
    """Convert JS string escapes to the actual runtime string."""
    return (
        s.replace(r"\"", '"')
        .replace(r"\'", "'")
        .replace(r"\\", "\\")
        .replace(r"\n", "\n")
        .replace(r"\t", "\t")
    )


def extract_keys(src_root: Path) -> set[str]:
    keys: set[str] = set()
    for path in src_root.rglob("*"):
        if path.suffix not in SRC_EXTS or not path.is_file():
            continue
        text = path.read_text(encoding="utf-8", errors="replace")
        for m in T_CALL_RE.finditer(text):
            keys.add(unescape(m.group("s")))
        for m in TRANS_KEY_RE.finditer(text):
            keys.add(m.group("s"))
        for m in TRANS_TEXT_RE.finditer(text):
            val = re.sub(r"\s+", " ", m.group("s")).strip()
            if val:
                keys.add(val)
    return keys


def sync_locale(path: Path, keys: set[str], is_source: bool) -> tuple[int, int]:
    with path.open(encoding="utf-8") as f:
        data = json.load(f)
    added = 0
    for k in keys:
        if k not in data:
            data[k] = k if is_source else ""
            added += 1
    stale = sorted(k for k in data if k not in keys)
    with path.open("w", encoding="utf-8") as f:
        json.dump(data, f, indent=4, sort_keys=True, ensure_ascii=False)
        f.write("\n")
    return added, len(stale)


def main() -> int:
    i18n_dir = Path(sys.argv[1] if len(sys.argv) > 1 else "src/i18n/")
    src_root = Path(os.environ.get("I18N_SRC", "src"))
    if not i18n_dir.is_dir():
        print(f"i18n dir not found: {i18n_dir}", file=sys.stderr)
        return 1
    if not src_root.is_dir():
        print(f"src dir not found: {src_root}", file=sys.stderr)
        return 1

    keys = extract_keys(src_root)
    print(f"Extracted {len(keys)} unique i18n keys from {src_root}/")

    for path in sorted(i18n_dir.glob("*.json")):
        is_source = path.name == "en-US.json"
        added, stale = sync_locale(path, keys, is_source)
        print(f"  {path.name}: +{added} added, {stale} unused in source")
    return 0


if __name__ == "__main__":
    sys.exit(main())
