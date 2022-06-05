#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import re
import sys
import requests
from readability import Document
import lxml.html

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print('Usage: %s <url>' % sys.argv[0])
        sys.exit(0)

    link = sys.argv[1].strip()
    if '://' not in link:
        print('Link is not valid')
        sys.exit(0)

    response = requests.get(link)
    doc = Document(response.text)

    title = doc.title().strip()
    commonSeparatingCharacters = [' | ', ' _ ', ' - ', '«', '»', '—']

    betterTitle = ''
    for ch in commonSeparatingCharacters:
        tmpArray = title.split(ch)
        if len(tmpArray) > 1:
            betterTitle = tmpArray[0].strip()
    if betterTitle and len(betterTitle) > 10:
        title = betterTitle

    html = re.sub(r'<(a|img|video|source|audio|figure|div|span|strong|em)[^>]*>',' ',doc.summary(True))
    html = re.sub(r'</(a|img|video|source|audio|figure|div|span|strong|em)[^>]*>',' ',html)
    html = re.sub(r'<p[^>]*>','<p>',html)
    html = re.sub(r'<figcaption[^>]*>','<p>',html)
    html = re.sub(r'</figcaption[^>]*>','</p>',html)
    html = re.sub(r' {2,}',' ',html)
    html = html.strip()
    lines = [ title ]
    
    doc = lxml.html.fromstring('<div>%s</div>' % html)
    for el in doc.xpath('//p'):
        text = el.text_content().strip()
        if text:
            lines.append(text)

    uniqued = []
    for line in lines:
        if line not in uniqued:
            uniqued.append(line)

    print(uniqued)

    sys.exit(0)
