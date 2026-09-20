#!/bin/bash
# Download small preview versions of candidate videos and build a 3-frame strip (10% / 50% / 90%) for each.
#
# Usage: media-preview.sh <outdir> < list
# list lines:  key|source|id
#   source = pexels  -> id is the numeric Pexels video id (uses the site's download endpoint, SD size)
#   source = mixkit  -> id is the numeric Mixkit id (360p variant)
#   source = coverr  -> id is the CDN base name, e.g. coverr-active-morning-jog-on-cobblestone (360p variant)
#   source = url     -> id is a direct file URL
# Output: <outdir>/<key>.mp4 and <outdir>/strips/<key>.jpg

OUT="$1"; mkdir -p "$OUT/strips"
UA='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'

while IFS='|' read -r key src id; do
  [ -z "$key" ] && continue
  case "$key" in \#*) continue;; esac
  f="$OUT/$key.mp4"
  if [ ! -s "$f" ]; then
    case "$src" in
      pexels) curl -sfL --max-time 180 -A "$UA" -e "https://www.pexels.com/" -o "$f" "https://www.pexels.com/download/video/$id/?h=360&w=640"
              # portrait sources have no landscape SD rendition -> ask for the portrait one
              if [ ! -s "$f" ]; then sleep 1; curl -sfL --max-time 180 -A "$UA" -e "https://www.pexels.com/" -o "$f" "https://www.pexels.com/download/video/$id/?h=640&w=360"; fi ;;
      mixkit) curl -sL --max-time 180 -A "$UA" -e "https://mixkit.co/" -o "$f" "https://assets.mixkit.co/videos/$id/$id-360.mp4" ;;
      coverr) curl -sL --max-time 180 -A "$UA" -e "https://coverr.co/" -o "$f" "https://cdn.coverr.co/videos/$id/360p.mp4" ;;
      url)    curl -sL --max-time 300 -A "$UA" -o "$f" "$id" ;;
    esac
    sleep 1
  fi
  # validate
  dur=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$f" 2>/dev/null)
  if [ -z "$dur" ]; then echo "FAIL  $key ($src $id) size=$(stat -f%z "$f" 2>/dev/null)"; rm -f "$f"; continue; fi
  res=$(ffprobe -v error -select_streams v:0 -show_entries stream=width,height,r_frame_rate -of csv=p=0 "$f" 2>/dev/null)
  s="$OUT/strips/$key.jpg"
  if [ ! -s "$s" ]; then
    t1=$(awk -v d="$dur" 'BEGIN{printf "%.3f", d*0.10}'); t2=$(awk -v d="$dur" 'BEGIN{printf "%.3f", d*0.50}'); t3=$(awk -v d="$dur" 'BEGIN{printf "%.3f", d*0.90}')
    ffmpeg -v error -y -ss "$t1" -i "$f" -ss "$t2" -i "$f" -ss "$t3" -i "$f" \
      -filter_complex "[0:v]scale=480:270:force_original_aspect_ratio=decrease,pad=480:270:(ow-iw)/2:(oh-ih)/2:color=0x222222[a];[1:v]scale=480:270:force_original_aspect_ratio=decrease,pad=480:270:(ow-iw)/2:(oh-ih)/2:color=0x222222[b];[2:v]scale=480:270:force_original_aspect_ratio=decrease,pad=480:270:(ow-iw)/2:(oh-ih)/2:color=0x222222[c];[a][b][c]hstack=inputs=3" \
      -frames:v 1 -q:v 4 "$s" 2>/dev/null
  fi
  printf "OK    %-34s %6.1fs  %s\n" "$key" "$dur" "$res"
done
