#!/usr/bin/env sh
# Scan images Docker (Trivy) — DevSecOps local / CI
set -eu

ROOT="$(CDPATH= cd -- "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if ! command -v trivy >/dev/null 2>&1; then
  echo "Trivy manquant. Install: https://aquasecurity.github.io/trivy/"
  echo "Ou: docker run --rm aquasec/trivy:latest --help"
  exit 1
fi

trivy fs --severity --scanners vuln,secret,misconfig \
  --severity-exit-code 1 \
  --ignore-unfixed \
  "$ROOT/api" "$ROOT/web"

if docker image inspect kadoudhal-api:local >/dev/null 2>&1; then
  trivy image --severity --severity-exit-code 1 kadoudhal-api:local
fi

if docker image inspect kadoudhal-web:local >/dev/null 2>&1; then
  trivy image --severity --severity-exit-code 1 kadoudhal-web:local
fi

echo "OK — pas de fail CRITICAL/HIGH non corrigé."
