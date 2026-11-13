#!/usr/bin/env bash
# USER-RUN ONLY. Up to eight uncached Jev requests; no loops or retries.
set -euo pipefail

REQUESTS="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
cd -- "$REQUESTS/../../../.."
CV=parser-evaluation/outputs/pdf-inspector/corpus-native-001
OUT="$(mktemp -d /tmp/opencode/cvextract-batch002.XXXXXX)"
printf 'Up to 8 requests; stop on first error. Responses: %s\n' "$OUT"

cvextract() {
  uv run --project parser-evaluation/cvextract cvextract "$@"
}

cvextract --cv "$CV/precv-005-calligraphics.md" --request "$REQUESTS/01-accounting.json" --allow-next-send -o "$OUT/01-accounting.json"
cvextract --cv "$CV/precv-051-calligraphics.md" --request "$REQUESTS/02-property-support.json" --allow-next-send -o "$OUT/02-property-support.json"
cvextract --cv "$CV/precv-001-cobalt-cv.md" --request "$REQUESTS/03-backend.json" --allow-next-send -o "$OUT/03-backend.json"
cvextract --cv "$CV/precv-035-cobalt-cv.md" --request "$REQUESTS/04-laboratory-fr.json" --allow-next-send -o "$OUT/04-laboratory-fr.json"
cvextract --cv "$CV/precv-011-metronic.md" --request "$REQUESTS/05-assembly.json" --allow-next-send -o "$OUT/05-assembly.json"
cvextract --cv "$CV/precv-003-jsume.md" --request "$REQUESTS/06-administration-es.json" --allow-next-send -o "$OUT/06-administration-es.json"
cvextract --cv "$CV/precv-054-jsume.md" --request "$REQUESTS/07-building-services.json" --allow-next-send -o "$OUT/07-building-services.json"
cvextract --cv "$CV/precv-050-vercanard.md" --request "$REQUESTS/08-electrical-es.json" --allow-next-send -o "$OUT/08-electrical-es.json"

printf 'Finished. Give the assistant this response directory: %s\n' "$OUT"
