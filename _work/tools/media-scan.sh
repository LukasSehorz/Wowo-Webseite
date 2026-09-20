#!/bin/bash
# 3x2 grid of frames at six timestamps, to choose a clean segment. Usage: media-scan.sh <rawkey> t1 t2 t3 t4 t5 t6
ROOT="/Users/lukas.sehorz/Library/CloudStorage/OneDrive-Persönlich/Desktop/Webseiten/Sale/Wowo-Webseit"
R="$ROOT/_work/media/raw/videos"; FR="$ROOT/_work/media/frames"
key="$1"; shift
args=(); fc=""; n=0
for t in "$@"; do
  args+=(-ss "$t" -i "$R/$key.mp4")
  fc="${fc}[${n}:v]scale=640:360:force_original_aspect_ratio=increase,crop=640:360[v${n}];"
  n=$((n+1))
done
fc="${fc}[v0][v1][v2]hstack=inputs=3[r1];[v3][v4][v5]hstack=inputs=3[r2];[r1][r2]vstack=inputs=2"
ffmpeg -v error -y "${args[@]}" -filter_complex "$fc" -frames:v 1 -q:v 4 "$FR/$key-scan.jpg" && echo "$key scan at: $*"
