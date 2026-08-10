#!/bin/bash
#
# DeltaScreener API watchdog.
#
# systemd's Restart=always only catches a process that EXITS. It cannot catch a
# process that is alive but wedged (event-loop block, exhausted pg pool, stuck
# upstream fetch). This probes the real HTTP endpoint and restarts on failure.
#
set -uo pipefail

URL=http://127.0.0.1:8787/health
TIMEOUT=10
RETRIES=3
LOG=/var/log/ds-healthcheck.log

log() { echo "$(date -u +%Y-%m-%dT%H:%M:%SZ) $*" >> "$LOG"; }

for i in $(seq 1 $RETRIES); do
  BODY=$(curl -fsS --max-time $TIMEOUT "$URL" 2>/dev/null || true)
  if [[ "$BODY" == *'"status":"ok"'* ]]; then
    exit 0                      # healthy — stay quiet
  fi
  [ "$i" -lt "$RETRIES" ] && sleep 5
done

log "UNHEALTHY after $RETRIES attempts (last body: ${BODY:-<empty>}) — restarting API"
log "  mem: $(free -m | awk '/^Mem:/{print $3"/"$2"MB used"}')  swap: $(free -m | awk '/^Swap:/{print $3"MB"}')"
log "  api rss: $(systemctl show deltascreener-api -p MemoryCurrent --value | awk '{printf "%.0fMB", $1/1048576}')"

systemctl restart deltascreener-api
sleep 8

if curl -fsS --max-time $TIMEOUT "$URL" 2>/dev/null | grep -q '"status":"ok"'; then
  log "recovered after restart"
else
  log "STILL UNHEALTHY after restart — needs manual attention"
fi
