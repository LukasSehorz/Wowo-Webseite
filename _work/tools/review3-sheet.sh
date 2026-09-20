#!/bin/bash
# review3-sheet.sh <outfile> <scale-divisor> <img1> <img2> ... — hstack images scaled by 1/divisor with a grey gutter
out="$1"; shift
div="$1"; shift
n=$#
inputs=()
filters=""
labels=""
i=0
for f in "$@"; do
  inputs+=(-i "$f")
  filters+="[$i:v]scale=iw/$div:ih/$div,pad=iw+16:ih:8:0:color=#9a9a9a[s$i];"
  labels+="[s$i]"
  i=$((i+1))
done
ffmpeg -loglevel error -y "${inputs[@]}" -filter_complex "${filters}${labels}hstack=inputs=$n" "$out" && echo "wrote $out"
