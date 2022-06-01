#!/bin/bash

for u in `cat urls.txt`
do
    fn=$(basename $u)
    fn="${fn/\.[A-Za-z0-9]*/}.xml"
    echo "Download '$fn' ..."
    curl -s -X POST -d "url=$u" http://127.0.0.1/api/fetch -o "xmls/$fn"
done
