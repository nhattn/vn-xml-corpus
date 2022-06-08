#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import sys
import csv

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print('Usage %s <csv_file>' % sys.argv[0])
        sys.exit(0)

    try:
        fin = open(sys.argv[1],'r', encoding='utf-8', errors='ignore')
    except Exception as e:
        print('Error', e)
        sys.exit(0)

    try:
        reader = csv.reader(fin)
    except Exception as e:
        print('Error', e)

    for row in reader:
        if len(row) < 3:
            continue
        if '://' not in row[1]:
            continue
        print("%s,%s" % (row[1], row[2]))

    fin.close()
    sys.exit(0)
