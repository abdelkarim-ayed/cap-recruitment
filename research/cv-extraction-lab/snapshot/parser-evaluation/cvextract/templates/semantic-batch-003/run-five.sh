#!/usr/bin/env bash
# USER-RUN ONLY: at most five HTTP attempts, no loops/retries/automatic variants.
set -euo pipefail

REQUESTS="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
cd -- "$REQUESTS/../../../.."
CV=parser-evaluation/outputs/pdf-inspector/corpus-native-001
OUT="$(mktemp -d /tmp/opencode/cvextract-batch003.XXXXXX)"
printf 'Up to FIVE requests; stop on first error. Responses: %s\n' "$OUT"

cvextract() {
  uv run --project parser-evaluation/cvextract cvextract "$@"
}

cvextract --cv "$CV/precv-044-lavandula.md" --request "$REQUESTS/01-lavandula-original.json" --allow-next-send -o "$OUT/01-lavandula-original.json"
cvextract --cv "$REQUESTS/inputs/precv-044-lavandula-flat.md" --request "$REQUESTS/02-lavandula-flat.json" --allow-next-send -o "$OUT/02-lavandula-flat.json"
cvextract --cv "$CV/precv-041-vantage-cv.md" --request "$REQUESTS/03-french-count.json" --allow-next-send -o "$OUT/03-french-count.json"
cvextract --cv "$CV/precv-023-moderner-cv.md" --request "$REQUESTS/04-retail-experience.json" --allow-next-send -o "$OUT/04-retail-experience.json"
cvextract --cv "$CV/precv-003-jsume.md" --request "$REQUESTS/05-jsume-positive-control.json" --allow-next-send -o "$OUT/05-jsume-positive-control.json"

printf 'Finished. Give the assistant this response directory: %s\n' "$OUT"
