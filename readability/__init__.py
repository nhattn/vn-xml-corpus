__version__ = "0.8.2"

import re
import requests
import lxml.html
from .readability import Document as _Document

def get_content(url, agent=None):
    headers = {"User-Agent": "Mozilla/5.0"}
    if agent:
        headers['User-Agent'] = agent
    response = requests.get(url, headers=headers, allow_redirects=True)
    doc = _Document(response.content.decode("utf-8"))

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

    return uniqued
