#!/bin/bash
# review3-strips.sh <states-dir> — build one strip per hover target (before / t1 / t2 / t3 / leave) and stack them all
cd "$1" || exit 1
rows=()
for name in hover-hero-pill hover-hero-link hover-nav-ueber hover-header-cta hover-intro-arrowlink hover-tech-outline hover-voucher-pill hover-footer-link hover-footer-pill hover-doi hover-tile-handel; do
  files=( "$name-0-before.png" )
  for t in $(ls $name-t*.png 2>/dev/null | sed -E 's/.*-t([0-9]+)\.png/\1/' | sort -n); do files+=( "$name-t$t.png" ); done
  files+=( "$name-leave-250.png" )
  n=${#files[@]}
  inputs=(); filters=""; labels=""
  i=0
  for f in "${files[@]}"; do
    inputs+=(-i "$f")
    filters+="[$i:v]scale=-1:100:flags=lanczos,pad=iw+12:ih+12:6:6:color=#b0b0b0[s$i];"
    labels+="[s$i]"
    i=$((i+1))
  done
  ffmpeg -loglevel error -y "${inputs[@]}" -filter_complex "${filters}${labels}hstack=inputs=$n" "$name-strip.png" && rows+=( "$name-strip.png" )
done
# stack all strips vertically (pad to common width)
maxw=0
for r in "${rows[@]}"; do w=$(ffprobe -v error -select_streams v:0 -show_entries stream=width -of csv=p=0 "$r"); [ "$w" -gt "$maxw" ] && maxw=$w; done
inputs=(); filters=""; labels=""; i=0
for r in "${rows[@]}"; do inputs+=(-i "$r"); filters+="[$i:v]pad=$maxw:ih:0:0:color=#b0b0b0[p$i];"; labels+="[p$i]"; i=$((i+1)); done
ffmpeg -loglevel error -y "${inputs[@]}" -filter_complex "${filters}${labels}vstack=inputs=$i" hover-all-strips.png && echo "wrote hover-all-strips.png (${#rows[@]} rows)"
