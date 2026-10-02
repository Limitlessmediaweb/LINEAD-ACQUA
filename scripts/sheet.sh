#!/usr/bin/env bash
# Foglio di provini: bash scripts/sheet.sh out.png larghezza file1 file2 ... (2 colonne)
out=$1; w=$2; shift 2
n=$#; inputs=(); filt=""; i=0
for f in "$@"; do inputs+=(-i "$f"); filt+="[$i]scale=$w:-2[s$i];"; i=$((i+1)); done
if [ $((n % 2)) -eq 1 ]; then inputs+=(-i "$1"); filt+="[$i]scale=$w:-2,drawbox=c=black:t=fill[s$i];"; n=$((n+1)); fi
rows=""; r=0
for ((k=0; k<n; k+=2)); do filt+="[s$k][s$((k+1))]hstack[r$r];"; rows+="[r$r]"; r=$((r+1)); done
if [ $r -gt 1 ]; then filt+="${rows}vstack=$r"; else filt="${filt%;}"; filt="${filt/\[r0\];/}"; fi
ffmpeg -loglevel error -y "${inputs[@]}" -filter_complex "$filt" "$out"
