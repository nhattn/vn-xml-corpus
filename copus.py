#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
import sys
import regex as re
import hashlib
from xml.dom import minidom
from vinlp import pos_ner
from vinlp import sent_tokenize

def unicode_replace(text):
    uni = [
        ["…","..."],
        ["“","\""],
        ["”","\""],
        ["‘","'"],
        ["’","'"],
        ["–","-"],
        [""," "],
        ["ð","đ"]
    ]
    for _, c in enumerate(uni):
        text = text.replace(c[0],c[1])
    return text

def abs_tags(words):
    tokens = []
    found = False
    for it in words:
        if it[0].lower() in ['ngày', 'tháng']:
            found = True
            tokens.append(it)
            tokens.append(['','M', 'B-NP','B-MISC'])
            continue
        if found:
            if it[0].isdigit() or it[0] in ['-','/']:
                tokens[-1][0] = tokens[-1][0] + it[0]
                tokens[-1][1] = 'M'
                tokens[-1][2] = 'B-NP'
                tokens[-1][2] = 'B-MISC'
            else:
                found = False
                tokens.append(it)
        else:
            tokens.append(it)

    tokens = [ token for token in tokens if token[0].strip() ]

    return tokens

def has_domain(s):
    if '://' in s:
        return True
    if '.com' in s or '.net' in s or '.org' in s or '.io' in s or '.gov' in s \
     or '.vn' in s or '.tk' in s:
        return True
    return False

def repl(m):
    return m.group(0).replace(' ','')

def qtp_alias(text):
    text = re.sub(r'tp\.\s+hcm',repl, text, flags=re.I) # tp. hcm
    text = re.sub(r'tp\s+\.\s+hcm',repl, text, flags=re.I) # tp . hcm
    text = re.sub(r'q\.\s+\d+',repl, text, flags=re.I) # q. 1
    text = re.sub(r'q\s+\.\s+\d+',repl, text, flags=re.I) # q . 1
    text = text.replace('%',' % ')
    text = " ".join([ w.strip() for w in text.split(' ') if w.strip() ])
    return text.strip()

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print('Usage: %s <xml_file>' % sys.argv[0])
        sys.exit(0)

    xml_file = sys.argv[1].strip()
    if not os.path.isfile(xml_file):
        print('File not found')
        sys.exit(0)

    try:
        fin = open(xml_file, 'r', encoding='utf-8', errors='ignore')
        xml_text = fin.read()
        fin.close()
        xml_text = unicode_replace(xml_text)
        mydoc = minidom.parseString(xml_text)
        uri = mydoc.getElementsByTagName('Link')[0]
        texts = mydoc.getElementsByTagName('Text')
        h = hashlib.new('sha256')
        h.update(xml_text.encode('utf-8'))
        print('<?xml version="1.0" encoding="UTF-8"?>')
        print('<corpus>')
        print('    <Document id="%s">' % h.hexdigest())
        print('        <Title><![CDATA[%s]]></Title>' % texts[0].firstChild.data)
        print('        <DocumentURI><![CDATA[%s]]></DocumentURI>' % uri.firstChild.data)
        for el in texts:
            text = qtp_alias(el.firstChild.data)
            sentences = sent_tokenize(text)
            if len(sentences) > 1:
                # Save to train sentence segment
                print('        <SimpleTextPart><![CDATA[%s]]></SimpleTextPart>' % text)
            for sent in sentences:
                # ignore if one word or has domain in sentence
                if ' ' not in sent or has_domain(sent.lower()):
                    continue
                print('        <Sentence>')
                result = pos_ner(sent)
                # All token is part of date/datetime set to one part
                result = abs_tags(result)
                # Auto 92% -> 1% fixed
                for it in result:
                    print('            <Token tag="%s" chunking="%s" ner="%s"><![CDATA[%s]]></Token>' % (it[1], it[2], it[3], it[0]))
                print('        </Sentence>')
        print('    </Document>')
        print('</corpus>')
    except Exception as e:
        print(e)

    sys.exit(0)
