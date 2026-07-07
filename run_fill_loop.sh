#!/bin/bash
cd "/sessions/exciting-admiring-newton/mnt/Delta Screener"
LOG="/sessions/exciting-admiring-newton/mnt/Delta Screener/fill_loop_progress.log"
echo "=== loop start $(date) ===" > "$LOG"
for i in $(seq 1 50); do
  echo "--- batch $i $(date) ---" >> "$LOG"
  python3 fill_fast.py >> "$LOG" 2>&1
  if grep -q "ALL DONE" "$LOG"; then
    echo "ALL DONE detected, stopping loop" >> "$LOG"
    break
  fi
  # stop if remaining is 0
  if tail -3 "$LOG" | grep -q "| 0 remaining"; then
    echo "0 remaining, stopping loop" >> "$LOG"
    break
  fi
done
echo "=== loop end $(date) ===" >> "$LOG"
