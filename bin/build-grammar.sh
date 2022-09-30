#!/bin/sh

[ $# -lt 1 ] && echo "usage: $0 <grammar-module-1> ..." && exit 1

for MOD in "$@"; do
SRCFILE="./src/grammar/$MOD.pegjs"
DESTFILE="./lib/grammar/$MOD.js"

if [ ! -f "$SRCFILE" ]; then
  echo "error: grammar source '$SRCFILE' does not exist"
  exit 2
fi

echo "«compile» $SRCFILE => $DESTFILE"

PEGGY="./node_modules/peggy/bin/peggy.js"

node $PEGGY -o "$DESTFILE" "$SRCFILE"
done

