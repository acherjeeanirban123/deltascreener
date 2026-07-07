#!/bin/bash
# Run fill batches back-to-back until ~40s wall elapsed
cd "/sessions/exciting-admiring-newton/mnt/Delta Screener"
START=$(date +%s)
LAST=""
while true; do
  OUT=$(FILL_LIMIT=22 python3 fill_param.py 2>&1)
  LAST=$(echo "$OUT" | grep "DONE:\|ALL DONE")
  echo "$LAST"
  if echo "$LAST" | grep -q "ALL DONE\|| 0 remaining"; then break; fi
  NOW=$(date +%s)
  if [ $((NOW - START)) -ge 22 ]; then break; fi
done
