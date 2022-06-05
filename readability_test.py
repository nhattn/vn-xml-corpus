#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import regex as re
import sys
import requests
from readability import get_content
import lxml.html

def unicode_replace(text):
    uni = [
        ["…","..."],
        ["“","\""],
        ["”","\""],
        ["‘","'"],
        ["’","'"],
        ["''","\""],
        ["–","-"],
        [""," "],
        ["ð","đ"],
        ["&nbsp;", " "],
    ]
    for _, c in enumerate(uni):
        text = text.replace(c[0],c[1])
    return text.strip()

def repl(m):
    return m.group(0).replace(' ','')

def datetime_normalize(text):
    for ch in [',','[',']','{','}',';',':','/','-','.','+','(',')','\'','"']:
        text = text.replace(ch, " %s " % ch)
    text = re.sub(r' {2,}',' ', text)
    text = re.sub(r'\d\s+[\.,]\s+\d',repl, text)
    text = re.sub(r'([A-Za-z]\s+\'\s+[A-Za-z])',repl, text)
    text = text.replace(' . . . ', ' ... ')
    text = re.sub(r'(gmt\s+[\+\-]\s+[0-9]{1,})',repl, text, flags=re.I)
    text = re.sub(r'((0?[1-9]|1[0-9]|2[0-9]|3[0-1])\s+[\/\-\.]\s+(0?[1-9]|1[0-2])\s+[\/\-\.]\s+([1-9][0-9]{3}))',repl, text)
    text = re.sub(r'(([1-9][0-9]{3})\s+[\/\-\.]\s+(0?[1-9]|1[0-2])\s+[\/\-\.]\s+(0?[1-9]|1[0-9]|2[0-9]|3[0-1]))',repl, text)
    text = re.sub(r'((0?[1-9]|1[0-2])\s+[\/\-\.]\s+([1-9][0-9]{3}))',repl, text)
    text = re.sub(r'(([1-9][0-9]{3})\s+[\/\-\.]\s+(0?[1-9]|1[0-2]))',repl, text)
    text = re.sub(r'((0?[1-9]|1[0-9]|2[0-9]|3[0-1])\s+[\/\-\.]\s+(0?[1-9]|1[0-2]))',repl, text)
    text = re.sub(r'((0?[0-9]|1[0-9]|2[0-3])\s+:\s+([0-5]?[0-9])\s+:\s+([0-5]?[0-9]))',repl, text)
    text = re.sub(r'((0?[0-9]|1[0-9]|2[0-3])\s+:\s+([0-5]?[0-9]))',repl, text)
    text = re.sub(r'(([0-5]?[0-9])\s+:\s+([0-5]?[0-9]))',repl, text)
    text = re.sub(r'((0?[1-9]|1[0-9]|2[0-9]|3[0-1])\s+[hg]\s+([0-5]?[0-9]))',repl, text)
    return text.strip()

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print('Usage: %s <url>' % sys.argv[0])
        sys.exit(0)

    link = sys.argv[1].strip()
    if '://' not in link:
        print('Link is not valid')
        sys.exit(0)

    uniqued = get_content(link)

    for i in range(len(uniqued)):
        uniqued[i] = unicode_replace(uniqued[i])
        uniqued[i] = datetime_normalize(uniqued[i])

    print(uniqued)

    s = 'Tại hiện trường, lực lượng chức năng phát hiện 1 thi thể nữ. Quá trình điều tra xác định nạn nhân là chị Nguyễn Thị Mai A. (SN 1997; ở xã Tản Lĩnh, huyện Ba Vì, Hà Nội). Trước khi xảy ra vụ việc thương tâm, chị A. làm tại Công ty Cổ phần Công nghệ Sotatek. Qua khám nghiệm hiện trường và pháp y tử thi xác định, nạn nhân đang mang thai tháng thứ 2 và đang chuẩn bị tổ chức đám cưới. N.T.M.A.'
    v = unicode_replace(s)
    v = datetime_normalize(v)
    v = re.sub(r'([A-Z]\s+\.\s+[A-Z][A-Z]\s+\.\s+[A-Z])', repl, v)
    v = re.sub(r'([A-Z]\s+\.\s+[A-Z]\s+\.\s+[A-Z])', repl, v)
    v = re.sub(r'([A-Z]\s+\.\s+[A-Z])', repl, v)
    v = re.sub(r'([A-Z]\s+\.)', repl, v)
    print(v)
    sys.exit(0)
