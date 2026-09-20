#!/bin/bash
# Download the 1080p source of selected videos and extract 3 verification frames (start / middle / end).
#
# Usage: media-fetch.sh < list        list lines: key|source|id
#   source = pexels (numeric id, site download endpoint, 1920x1080 rendition)
#            mixkit (numeric id, -1080 variant) | coverr (CDN base name, 1080p) | url (direct URL)
# Output: _work/media/raw/videos/<key>.mp4
#         _work/media/frames/<key>-1.jpg -2.jpg -3.jpg  (full frames, 1280 wide)
#         _work/media/frames/<key>-stack.jpg            (the three frames stacked, for a quick look)

ROOT="/Users/lukas.sehorz/Library/CloudStorage/OneDrive-Persönlich/Desktop/Webseiten/Sale/Wowo-Webseit"
RAW="$ROOT/_work/media/raw/videos"; FR="$ROOT/_work/media/frames"
mkdir -p "$RAW" "$FR"
UA='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'

while IFS='|' read -r key src id; do
  [ -z "$key" ] && continue
  case "$key" in \#*) continue;; esac
  f="$RAW/$key.mp4"
  if [ ! -s "$f" ]; then
    case "$src" in
      pexels) curl -sfL --max-time 240 -A "$UA" -e "https://www.pexels.com/" -o "$f" "https://www.pexels.com/download/video/$id/?h=1080&w=1920"
              # some clips have no 1920x1080 rendition and fall back to 720p -> ask for 2560x1440, then the original
              hh=$(ffprobe -v error -select_streams v:0 -show_entries stream=height -of csv=p=0 "$f" 2>/dev/null); hh=${hh:-0}
              if [ "$hh" -lt 1080 ]; then sleep 1; curl -sfL --max-time 300 -A "$UA" -e "https://www.pexels.com/" -o "$f" "https://www.pexels.com/download/video/$id/?h=1440&w=2560"; fi
              hh=$(ffprobe -v error -select_streams v:0 -show_entries stream=height -of csv=p=0 "$f" 2>/dev/null); hh=${hh:-0}
              if [ "$hh" -lt 1080 ]; then sleep 1; curl -sfL --max-time 420 -A "$UA" -e "https://www.pexels.com/" -o "$f" "https://www.pexels.com/download/video/$id/"; fi ;;
      mixkit) curl -sfL --max-time 240 -A "$UA" -e "https://mixkit.co/" -o "$f" "https://assets.mixkit.co/videos/$id/$id-1080.mp4" ;;
      coverr) curl -sfL --max-time 240 -A "$UA" -e "https://coverr.co/" -o "$f" "https://cdn.coverr.co/videos/$id/1080p.mp4" ;;
      url)    curl -sfL --max-time 240 -A "$UA" -o "$f" "$id" ;;
    esac
  fi
  dur=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$f" 2>/dev/null)
  if [ -z "$dur" ]; then echo "FAIL  $key ($src $id)"; rm -f "$f"; continue; fi
  info=$(ffprobe -v error -select_streams v:0 -show_entries stream=width,height,r_frame_rate,codec_name -of csv=p=0 "$f")
  size=$(du -h "$f" | cut -f1)
  i=1
  for p in 0.04 0.50 0.94; do
    t=$(awk -v d="$dur" -v p="$p" 'BEGIN{printf "%.3f", d*p}')
    ffmpeg -v error -y -ss "$t" -i "$f" -frames:v 1 -vf "scale=1280:-2" -q:v 3 "$FR/$key-$i.jpg"
    i=$((i+1))
  done
  ffmpeg -v error -y -i "$FR/$key-1.jpg" -i "$FR/$key-2.jpg" -i "$FR/$key-3.jpg" -filter_complex "vstack=inputs=3" -q:v 4 "$FR/$key-stack.jpg"
  printf "OK    %-28s %6.1fs  %-28s %s\n" "$key" "$dur" "$info" "$size"
done
