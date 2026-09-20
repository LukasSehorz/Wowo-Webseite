#!/bin/bash
# Trim + loop-blend + encode one clip to web formats.
#
# Usage: media-encode.sh <name> <rawkey> <start> <dur> [maxMB=3.5] [crop]
#   name    output base name in public/media/videos (e.g. hero-run-cobblestone)
#   rawkey  file name (without .mp4) in _work/media/raw/videos
#   start   trim start in seconds;  dur = length of the final clip in seconds
#   maxMB   size target for the MP4; CRF is raised (26 -> 28 -> 30), then width reduced (1600, 1280) until it fits
#   crop    optional ffmpeg crop expression applied before scaling, e.g. "iw:iw*9/16" for portrait sources
#
# Loop: the clip's last 0.6 s is cross-faded into the 0.6 s that precede the clip start,
# so the video loops without a visible jump (needs start >= 0 and start+dur+0.6 <= source length).
# Output: <name>.mp4 (H.264, yuv420p, faststart, no audio), <name>.webm (VP9), <name>.jpg (poster = first frame)

ROOT="/Users/lukas.sehorz/Library/CloudStorage/OneDrive-Persönlich/Desktop/Webseiten/Sale/Wowo-Webseit"
RAW="$ROOT/_work/media/raw/videos"; OUT="$ROOT/public/media/videos"
TMP="$ROOT/_work/media/raw/tmp"; mkdir -p "$OUT" "$TMP"
name="$1"; key="$2"; S="$3"; D="$4"; MAXMB="${5:-3.5}"; CROP="$6"
X=0.6
src="$RAW/$key.mp4"
[ -s "$src" ] || { echo "missing $src"; exit 1; }

# frame rate: keep source rate up to 30 fps, halve 50/60 fps sources
rate=$(ffprobe -v error -select_streams v:0 -show_entries stream=r_frame_rate -of csv=p=0 "$src")
fps=$(awk -v r="$rate" 'BEGIN{split(r,a,"/"); f=a[1]/(a[2]?a[2]:1); if (f>31) f=f/2; printf "%.3f", f}')
TOT=$(awk -v d="$D" -v x="$X" 'BEGIN{printf "%.3f", d+x}')
OFF=$(awk -v d="$D" -v x="$X" 'BEGIN{printf "%.3f", d-x}')

# 1) trim to a short lossless-ish intermediate first (fast), so the real encodes only touch a few seconds
mid="$TMP/$name-mid.mp4"
ffmpeg -v error -y -ss "$S" -t "$TOT" -i "$src" -an -c:v libx264 -preset ultrafast -crf 12 -pix_fmt yuv420p "$mid" || exit 1

pre=""; [ -n "$CROP" ] && pre="crop=$CROP,"
graph() { # $1 = target width
  echo "[0:v]${pre}scale='min($1,iw)':-2:flags=lanczos,fps=$fps,format=yuv420p,split[a][b];[a]trim=start=$X:end=$TOT,setpts=PTS-STARTPTS[m];[b]trim=start=0:end=$X,setpts=PTS-STARTPTS[h];[m][h]xfade=transition=fade:duration=$X:offset=$OFF[v]"
}

fit=0
# optional env CRF0: a better first rung for clips with a bigger size budget (e.g. CRF0=24 for the hero)
LADDER=("1920 26" "1920 28" "1920 30" "1600 30" "1280 30")
[ -n "$CRF0" ] && LADDER=("1920 $CRF0" "${LADDER[@]}")
for try in "${LADDER[@]}"; do
  set -- $try; W=$1; CRF=$2
  ffmpeg -v error -y -i "$mid" -filter_complex "$(graph $W)" -map "[v]" -an \
    -c:v libx264 -preset fast -crf $CRF -profile:v high -pix_fmt yuv420p -movflags +faststart "$OUT/$name.mp4" || exit 1
  bytes=$(stat -f%z "$OUT/$name.mp4")
  ok=$(awk -v b="$bytes" -v m="$MAXMB" 'BEGIN{print (b <= m*1048576) ? 1 : 0}')
  if [ "$ok" = "1" ]; then fit=1; break; fi
done
VCRF=${WEBM_CRF:-$(( CRF + 8 ))}   # VP9 CRF roughly tracks x264 CRF + 8  (26 -> 34); env WEBM_CRF overrides (noisy clips)
ffmpeg -v error -y -i "$mid" -filter_complex "$(graph $W)" -map "[v]" -an \
  -c:v libvpx-vp9 -crf $VCRF -b:v 0 -deadline good -cpu-used 4 -row-mt 1 -pix_fmt yuv420p "$OUT/$name.webm" || exit 1
ffmpeg -v error -y -i "$OUT/$name.mp4" -frames:v 1 -q:v 3 "$OUT/$name.jpg" || exit 1
rm -f "$mid"

res=$(ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=p=0:s=x "$OUT/$name.mp4")
printf "%-26s %sx  %4.1fs @%sfps  crf %s/%s  mp4 %s  webm %s  jpg %s %s\n" "$name" "$res" "$D" "$fps" "$CRF" "$VCRF" \
  "$(du -h "$OUT/$name.mp4" | cut -f1)" "$(du -h "$OUT/$name.webm" | cut -f1)" "$(du -h "$OUT/$name.jpg" | cut -f1)" \
  "$([ $fit = 1 ] || echo '(over size target)')"
