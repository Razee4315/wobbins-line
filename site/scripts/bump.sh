#!/bin/sh
# bump the cache-busting version used by index.html and js/main.js
cd "$(dirname "$0")/.." || exit 1
n=$(grep -o "VERSION = [0-9]*" js/main.js | grep -o "[0-9]*"); m=$((n + 1))
sed -i "s/VERSION = $n;/VERSION = $m;/" js/main.js
sed -i "s/?v=$n\"/?v=$m\"/g" index.html
echo "v$m"
