#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import re
import sys
import requests
from readability import get_content
import lxml.html

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print('Usage: %s <url>' % sys.argv[0])
        sys.exit(0)

    link = sys.argv[1].strip()
    if '://' not in link:
        print('Link is not valid')
        sys.exit(0)

    uniqued = get_content(link)

    print(uniqued)

    sys.exit(0)
