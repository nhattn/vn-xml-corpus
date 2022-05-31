#!/bin/bash

for f in `ls xmls/`
do
    fn="${f/\.xml/\.corpus}"
    echo "Handle '$f'"
    python3 copus.py "xmls/$f" > "corpus/$fn"
done
