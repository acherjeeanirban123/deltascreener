#!/bin/bash
#
# DeltaScreener — PostgreSQL backup with rotation.
#
# Runs daily via ds-backup.timer. Keeps 7 daily + 4 weekly compressed dumps
# on local disk (the box has 34 GB free and the database is ~115 MB, so a
# couple of months of history costs almost nothing).
#
# LIMITATION — read this before relying on it:
# These backups live on the SAME disk as the database. They protect against
# "someone dropped a table" and bad migrations. They do NOT protect against
# losing the instance. For that, either enable Lightsail automatic snapshots
# (~$0.05/GB/mo) or push these dumps off-box. Until then, Cloudflare D1 is
# still the disaster-recovery copy of record.
#
set -euo pipefail

BACKUP_DIR=/var/backups/deltascreener
DB_NAME=deltascreener_db
KEEP_DAILY=7
KEEP_WEEKLY=4
STAMP=$(date -u +%Y%m%d-%H%M%S)
DOW=$(date -u +%u)          # 1..7, 7 = Sunday

mkdir -p "$BACKUP_DIR/daily" "$BACKUP_DIR/weekly"

OUT="$BACKUP_DIR/daily/${DB_NAME}-${STAMP}.sql.gz"

echo "[backup] dumping $DB_NAME -> $OUT"
# --clean --if-exists makes the dump directly restorable over an existing DB.
sudo -u postgres pg_dump --clean --if-exists --no-owner "$DB_NAME" | gzip -6 > "$OUT.tmp"
mv "$OUT.tmp" "$OUT"

SIZE=$(du -h "$OUT" | cut -f1)
echo "[backup] wrote $SIZE"

# A dump that cannot be read back is not a backup — verify before rotating.
if ! gzip -t "$OUT"; then
  echo "[backup] ERROR: archive failed integrity check, keeping old backups" >&2
  rm -f "$OUT"
  exit 1
fi

# Header check. `set -o pipefail` is disabled around this deliberately: `head`
# closes the pipe early, which SIGPIPEs zcat and would otherwise fail a
# perfectly good backup (this bit us on the first run).
set +o pipefail
HEADER_HITS=$(zcat "$OUT" 2>/dev/null | head -100 | grep -c "PostgreSQL database dump" || true)
ROW_CHECK=$(zcat "$OUT" 2>/dev/null | grep -c "COPY public.stock_data" || true)
set -o pipefail

if [ "$HEADER_HITS" -lt 1 ]; then
  echo "[backup] ERROR: dump header missing, keeping old backups" >&2
  rm -f "$OUT"; exit 1
fi
# Guard against a dump that succeeds but contains no screener data.
if [ "$ROW_CHECK" -lt 1 ]; then
  echo "[backup] ERROR: dump contains no stock_data, keeping old backups" >&2
  rm -f "$OUT"; exit 1
fi
echo "[backup] verified (header + stock_data present)"

# Sunday copy is promoted to the weekly set.
if [ "$DOW" = "7" ]; then
  cp "$OUT" "$BACKUP_DIR/weekly/${DB_NAME}-${STAMP}.sql.gz"
  echo "[backup] promoted to weekly"
fi

# Rotation: keep the N newest in each set.
# `|| true` matters: on the first run the weekly glob matches nothing, ls exits
# non-zero, and pipefail+set -e would abort *after* a good backup was written.
prune() {
  local dir=$1 keep=$2
  set +o pipefail
  ls -1t "$dir"/*.sql.gz 2>/dev/null | tail -n +$((keep + 1)) | xargs -r rm -f || true
  set -o pipefail
}
prune "$BACKUP_DIR/daily"  "$KEEP_DAILY"
prune "$BACKUP_DIR/weekly" "$KEEP_WEEKLY"

echo "[backup] daily=$(ls -1 "$BACKUP_DIR/daily" | wc -l) weekly=$(ls -1 "$BACKUP_DIR/weekly" | wc -l)"
echo "[backup] disk: $(df -h "$BACKUP_DIR" | tail -1 | awk '{print $4" free"}')"
echo "[backup] done"
