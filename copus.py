#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
import sys
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
            sentences = sent_tokenize(el.firstChild.data)
            if len(sentences) > 1:
                # Save to train sentence segment
                print('        <SimpleTextPart><![CDATA[%s]]></SimpleTextPart>' % el.firstChild.data)
            for sent in sentences:
                print('        <Sentence>')
                result = pos_ner(sent)
                # Auto 92% -> 1% fixed
                for it in result:
                    print('            <Token tag="%s" chunking="%s" ner="%s"><![CDATA[%s]]></Token>' % (it[1], it[2], it[3], it[0]))
                print('        </Sentence>')
        print('    </Document>')
        print('</corpus>')
    except Exception as e:
        print(e)

    sys.exit(0)
