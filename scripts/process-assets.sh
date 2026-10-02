#!/usr/bin/env bash
# Pipeline asset: raw/ (PNG/MP4 di Higgsfield) -> public/media/ (WebP, MP4 H.264, WebM, frame per lo scroll).
# Uso: bash scripts/process-assets.sh [images|videos|frames|all]
set -euo pipefail
cd "$(dirname "$0")/.."
RAW=raw
OUT=public/media
mkdir -p "$OUT" "$OUT/tour" "$OUT/video"
FF="ffmpeg -loglevel error -y"

images() {
  # Immagini a tutto schermo: 2400px, WebP q78 (next/image genera poi le varianti responsive).
  for f in bay-dawn bay-noon bay-sunset bay-blue bay-night macro-teak macro-pelle macro-ottone macro-vetro \
           underwater int-salone int-cabina int-poppa hero-169 cantiere-capannone cantiere-mani; do
    [ -f "$RAW/$f.png" ] && $FF -i "$RAW/$f.png" -vf "scale=2400:-2:flags=lanczos" -c:v libwebp -quality 78 "$OUT/$f.webp"
  done
  [ -f "$RAW/hero-916.png" ] && $FF -i "$RAW/hero-916.png" -vf "scale=1200:-2:flags=lanczos" -c:v libwebp -quality 78 "$OUT/hero-916.webp"
  # Flotta e configuratore (21:9): 2400px.
  for f in fleet-aurora fleet-libeccio fleet-notturno hull-perla hull-grafite hull-verde ref-yacht; do
    [ -f "$RAW/$f.png" ] && $FF -i "$RAW/$f.png" -vf "scale=2400:-2:flags=lanczos" -c:v libwebp -quality 80 "$OUT/$f.webp"
  done
  # Campioni legno: piccoli.
  for f in wood-teak wood-rovere wood-noce; do
    [ -f "$RAW/$f.png" ] && $FF -i "$RAW/$f.png" -vf "scale=640:-2:flags=lanczos" -c:v libwebp -quality 78 "$OUT/$f.webp"
  done
  echo "images ok"
}

videos() {
  # Video: MP4 H.264 (yuv420p, faststart) + WebM VP9, senza audio, poster = primo frame.
  for v in hero-169 hero-916 int-salone int-cabina int-poppa; do
    src="$RAW/v-$v.mp4"; [ -f "$src" ] || continue
    w=1920; [ "$v" = hero-916 ] && w=720
    $FF -i "$src" -an -vf "scale=$w:-2:flags=lanczos" -c:v libx264 -preset slow -crf 24 -pix_fmt yuv420p -movflags +faststart "$OUT/video/$v.mp4"
    $FF -i "$src" -an -vf "scale=$w:-2:flags=lanczos" -c:v libvpx-vp9 -b:v 0 -crf 38 -row-mt 1 "$OUT/video/$v.webm"
    $FF -i "$src" -frames:v 1 -vf "scale=$w:-2" -c:v libwebp -quality 72 "$OUT/video/$v-poster.webp"
  done
  echo "videos ok"
}

frames() {
  # Walk tour: 90 frame desktop (1600px) e 45 frame mobile (900px) per stanza, WebP.
  for room in salone cabina poppa; do
    src="$RAW/v-int-$room.mp4"; [ -f "$src" ] || continue
    rm -rf "$OUT/tour/$room"; mkdir -p "$OUT/tour/$room/d" "$OUT/tour/$room/m"
    dur=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$src")
    fd=$(awk "BEGIN{printf \"%.4f\", 90/$dur}")
    fm=$(awk "BEGIN{printf \"%.4f\", 45/$dur}")
    $FF -i "$src" -vf "fps=$fd,scale=1600:-2:flags=lanczos" -frames:v 90 -c:v libwebp -quality 62 "$OUT/tour/$room/d/%03d.webp"
    $FF -i "$src" -vf "fps=$fm,scale=900:-2:flags=lanczos" -frames:v 45 -c:v libwebp -quality 60 "$OUT/tour/$room/m/%03d.webp"
    echo "$room: $(ls "$OUT/tour/$room/d" | wc -l) desktop, $(ls "$OUT/tour/$room/m" | wc -l) mobile"
  done
}

case "${1:-all}" in
  images) images ;;
  videos) videos ;;
  frames) frames ;;
  all) images; videos; frames ;;
esac
