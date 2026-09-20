#!/bin/bash
# Download selected photos (high-quality intermediate, never upscaled) and write web versions (max 2400 px long side).
#
# Usage: media-photo.sh < list        list lines: name|source|id
#   source = unsplash (id = CDN name "photo-...")  |  pexels (numeric photo id)  |  url (direct URL)
# Output: _work/media/raw/photos/<name>.jpg   (as delivered by the CDN, up to 3200 px, q92)
#         public/media/images/<name>.jpg      (max 2400 px long side, JPEG q82)
# A photo whose original long side is < 2400 px is reported as SMALL (spec asks for >= 2400 px).

ROOT="/Users/lukas.sehorz/Library/CloudStorage/OneDrive-Persönlich/Desktop/Webseiten/Sale/Wowo-Webseit"
RAW="$ROOT/_work/media/raw/photos"; OUT="$ROOT/public/media/images"
mkdir -p "$RAW" "$OUT"
UA='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'

KEEP="$ROOT/_work/media/raw/preexisting-images.txt"   # files placed in public/media/images by others: never overwrite

while IFS='|' read -r name src id max; do
  [ -z "$name" ] && continue
  case "$name" in \#*) continue;; esac
  max="${max:-2400}"                                   # optional 4th field: max long side (tiles use 3000)
  if [ -f "$KEEP" ] && grep -qx "$name.jpg" "$KEEP"; then echo "SKIP  $name.jpg is a pre-existing file - not touching it"; continue; fi
  raw="$RAW/$name.jpg"
  if [ ! -s "$raw" ]; then
    case "$src" in
      unsplash) curl -sfL --max-time 120 -A "$UA" -o "$raw" "https://images.unsplash.com/$id?fm=jpg&q=92&w=3200&h=3200&fit=max" ;;
      pexels)   curl -sfL --max-time 120 -A "$UA" -e "https://www.pexels.com/" -o "$raw" "https://images.pexels.com/photos/$id/pexels-photo-$id.jpeg?cs=srgb&fm=jpg&q=92&w=3200&h=3200&fit=max" ;;
      url)      curl -sfL --max-time 120 -A "$UA" -o "$raw" "$id" ;;
    esac
    sleep 0.5
  fi
  w=$(sips -g pixelWidth "$raw" 2>/dev/null | awk '/pixelWidth/{print $2}'); h=$(sips -g pixelHeight "$raw" 2>/dev/null | awk '/pixelHeight/{print $2}')
  if [ -z "$w" ]; then echo "FAIL  $name ($src $id)"; rm -f "$raw"; continue; fi
  long=$(( w > h ? w : h ))
  if [ "$long" -gt "$max" ]; then
    sips -s format jpeg -s formatOptions 82 -Z "$max" "$raw" --out "$OUT/$name.jpg" >/dev/null 2>&1
  else
    sips -s format jpeg -s formatOptions 82 "$raw" --out "$OUT/$name.jpg" >/dev/null 2>&1
  fi
  fw=$(sips -g pixelWidth "$OUT/$name.jpg" | awk '/pixelWidth/{print $2}'); fh=$(sips -g pixelHeight "$OUT/$name.jpg" | awk '/pixelHeight/{print $2}')
  short=$(( fw < fh ? fw : fh ))
  printf "%-5s %-30s source %sx%s -> %sx%s (short side %s)  %4d KB\n" "$([ "$long" -ge 2400 ] && echo OK || echo SMALL)" "$name" "$w" "$h" "$fw" "$fh" "$short" "$(( $(stat -f%z "$OUT/$name.jpg") / 1024 ))"
done
