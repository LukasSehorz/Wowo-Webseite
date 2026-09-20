#!/bin/bash
# Contact sheet / frame extraction helper for the reference motion videos.
#   ref-frames.sh sheet  <video> <start_s> <dur_s> <fps> <cols> <rows> <tile_width_px> <out.png>
#       frames are laid out in reading order (left->right, top->bottom); frame n is at start + n/fps seconds
#   ref-frames.sh frames <video> <start_s> <dur_s> <fps> <out_prefix>     -> <out_prefix>-001.png ...
set -euo pipefail
mode="$1"; shift
if [ "$mode" = "sheet" ]; then
  video="$1"; start="$2"; dur="$3"; fps="$4"; cols="$5"; rows="$6"; w="$7"; out="$8"
  ffmpeg -v error -y -ss "$start" -t "$dur" -i "$video" \
    -vf "fps=${fps},scale=${w}:-1,tile=${cols}x${rows}:padding=6:margin=6:color=0x222222" \
    -frames:v 1 "$out"
  echo "sheet -> $out"
elif [ "$mode" = "frames" ]; then
  video="$1"; start="$2"; dur="$3"; fps="$4"; prefix="$5"
  ffmpeg -v error -y -ss "$start" -t "$dur" -i "$video" -vf "fps=${fps}" "${prefix}-%03d.png"
  echo "frames -> ${prefix}-NNN.png"
else
  echo "unknown mode $mode"; exit 1
fi
