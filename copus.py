#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
import sys
import regex as re
import hashlib
from xml.dom import minidom
from vinlp import pos_sner
from vinlp import sent_tokenize

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
        ["&agrave;", "à"],
        ["&aacute;", "á"],
        ["&atilde;", "ã"],
        ["&acirc;", "â"],
        ["&egrave;", "è"],
        ["&eacute;", "é"],
        ["&ecirc;", "ê"],
        ["&igrave;", "ì"],
        ["&iacute;", "í"],
        ["&ograve;", "ò"],
        ["&oacute;", "ó"],
        ["&otilde;", "õ"],
        ["&ocirc;", "ô"],
        ["&ugrave;", "ù"],
        ["&uacute;", "ú"],
        ["&yacute;", "ý"],
        ["&Agrave;", "À"],
        ["&Aacute;", "Á"],
        ["&Atilde;", "Ã"],
        ["&Acirc;", "Â"],
        ["&Egrave;", "È"],
        ["&Eacute;", "É"],
        ["&Ecirc;", "Ê"],
        ["&Igrave;", "Ì"],
        ["&Iacute;", "Í"],
        ["&Ograve;", "Ò"],
        ["&Oacute;", "Ó"],
        ["&Otilde;", "Õ"],
        ["&Ocirc;", "Ô"],
        ["&Ugrave;", "Ù"],
        ["&Uacute;", "Ú"],
        ["&Yacute;", "Ý"],
        ["&ETH;", "Đ"],
        ["&eth;", "đ"],
        ["&nbsp;", " "],
        ["&#91;", "["],
        ["&#93;", "]"],
        ["&#32;", " "],
        ["&#8220;", "\""],
        ["&#8221;", "\""],
        ["&#224;","à"],
        ["&#225;","á"],
        ["&#7841;","ạ"],
        ["&#7843;","ả"],
        ["&#227;","ã"],
        ["&#226;","â"],
        ["&#7847;","ầ"],
        ["&#7845;","ấ"],
        ["&#7853;","ậ"],
        ["&#7849;","ẩ"],
        ["&#7851;","ẫ"],
        ["&#259;","ă"],
        ["&#7857;","ằ"],
        ["&#7855;","ắ"],
        ["&#7863;","ặ"],
        ["&#7859;","ẳ"],
        ["&#7861;","ẵ"],
        ["&#232;","è"],
        ["&#233;","é"],
        ["&#7865;","ẹ"],
        ["&#7867;","ẻ"],
        ["&#7869;","ẽ"],
        ["&#234;","ê"],
        ["&#7873;","ề"],
        ["&#7871;","ế"],
        ["&#7879;","ệ"],
        ["&#7875;","ể"],
        ["&#7877;","ễ"],
        ["&#236;","ì"],
        ["&#237;","í"],
        ["&#7883;","ị"],
        ["&#7881;","ỉ"],
        ["&#297;","ĩ"],
        ["&#242;","ò"],
        ["&#243;","ó"],
        ["&#7885;","ọ"],
        ["&#7887;","ỏ"],
        ["&#245;","õ"],
        ["&#244;","ô"],
        ["&#7891;","ồ"],
        ["&#7889;","ố"],
        ["&#7897;","ộ"],
        ["&#7893;","ổ"],
        ["&#7895;","ỗ"],
        ["&#417;","ơ"],
        ["&#7901;","ờ"],
        ["&#7899;","ớ"],
        ["&#7907;","ợ"],
        ["&#7903;","ở"],
        ["&#7905;","ỡ"],
        ["&#249;","ù"],
        ["&#250;","ú"],
        ["&#7909;","ụ"],
        ["&#7911;","ủ"],
        ["&#361;","ũ"],
        ["&#432;","ư"],
        ["&#7915;","ừ"],
        ["&#7913;","ứ"],
        ["&#7921;","ự"],
        ["&#7917;","ử"],
        ["&#7919;","ữ"],
        ["&#7923;","ỳ"],
        ["&#253;","ý"],
        ["&#7925;","ỵ"],
        ["&#7927;","ỷ"],
        ["&#7929;","ỹ"],
        ["&#273;","đ"],
        ["&#192;","À"],
        ["&#193;","Á"],
        ["&#7840;","Ạ"],
        ["&#7842;","Ả"],
        ["&#195;","Ã"],
        ["&#194;","Â"],
        ["&#7846;","Ầ"],
        ["&#7844;","Ấ"],
        ["&#7852;","Ậ"],
        ["&#7848;","Ẩ"],
        ["&#7850;","Ẫ"],
        ["&#258;","Ă"],
        ["&#7856;","Ằ"],
        ["&#7854;","Ắ"],
        ["&#7862;","Ặ"],
        ["&#7858;","Ẳ"],
        ["&#7860;","Ẵ"],
        ["&#200;","È"],
        ["&#201;","É"],
        ["&#7864;","Ẹ"],
        ["&#7866;","Ẻ"],
        ["&#7868;","Ẽ"],
        ["&#202;","Ê"],
        ["&#7872;","Ề"],
        ["&#7870;","Ế"],
        ["&#7878;","Ệ"],
        ["&#7874;","Ể"],
        ["&#7876;","Ễ"],
        ["&#204;","Ì"],
        ["&#205;","Í"],
        ["&#7882;","Ị"],
        ["&#7880;","Ỉ"],
        ["&#296;","Ĩ"],
        ["&#210;","Ò"],
        ["&#211;","Ó"],
        ["&#7884;","Ọ"],
        ["&#7886;","Ỏ"],
        ["&#213;","Õ"],
        ["&#212;","Ô"],
        ["&#7890;","Ồ"],
        ["&#7888;","Ố"],
        ["&#7896;","Ộ"],
        ["&#7892;","Ổ"],
        ["&#7894;","Ỗ"],
        ["&#416;","Ơ"],
        ["&#7900;","Ờ"],
        ["&#7898;","Ớ"],
        ["&#7906;","Ợ"],
        ["&#7902;","Ở"],
        ["&#7904;","Ỡ"],
        ["&#217;","Ù"],
        ["&#218;","Ú"],
        ["&#7908;","Ụ"],
        ["&#7910;","Ủ"],
        ["&#360;","Ũ"],
        ["&#431;","Ư"],
        ["&#7914;","Ừ"],
        ["&#7912;","Ứ"],
        ["&#7920;","Ự"],
        ["&#7916;","Ử"],
        ["&#7918;","Ữ"],
        ["&#7922;","Ỳ"],
        ["&#221;","Ý"],
        ["&#7924;","Ỵ"],
        ["&#7926;","Ỷ"],
        ["&#7928;","Ỹ"],
        ["&#272;","Đ"],

        ["&#xE0;","à"],
        ["&#xE1;","á"],
        ["&#x1EA1;","ạ"],
        ["&#x1EA3;","ả"],
        ["&#xE3;","ã"],
        ["&#xE2;","â"],
        ["&#x1EA7;","ầ"],
        ["&#x1EA5;","ấ"],
        ["&#x1EAD;","ậ"],
        ["&#x1EA9;","ẩ"],
        ["&#x1EAB;","ẫ"],
        ["&#x103;","ă"],
        ["&#x1EB1;","ằ"],
        ["&#x1EAF;","ắ"],
        ["&#x1EB7;","ặ"],
        ["&#x1EB3;","ẳ"],
        ["&#x1EB5;","ẵ"],
        ["&#xE8;","è"],
        ["&#xE9;","é"],
        ["&#x1EB9;","ẹ"],
        ["&#x1EBB;","ẻ"],
        ["&#x1EBD;","ẽ"],
        ["&#xEA;","ê"],
        ["&#x1EC1;","ề"],
        ["&#x1EBF;","ế"],
        ["&#x1EC7;","ệ"],
        ["&#x1EC3;","ể"],
        ["&#x1EC5;","ễ"],
        ["&#xEC;","ì"],
        ["&#xED;","í"],
        ["&#x1ECB;","ị"],
        ["&#x1EC9;","ỉ"],
        ["&#x129;","ĩ"],
        ["&#xF2;","ò"],
        ["&#xF3;","ó"],
        ["&#x1ECD;","ọ"],
        ["&#x1ECF;","ỏ"],
        ["&#xF5;","õ"],
        ["&#xF4;","ô"],
        ["&#x1ED3;","ồ"],
        ["&#x1ED1;","ố"],
        ["&#x1ED9;","ộ"],
        ["&#x1ED5;","ổ"],
        ["&#x1ED7;","ỗ"],
        ["&#x1A1;","ơ"],
        ["&#x1EDD;","ờ"],
        ["&#x1EDB;","ớ"],
        ["&#x1EE3;","ợ"],
        ["&#x1EDF;","ở"],
        ["&#x1EE1;","ỡ"],
        ["&#xF9;","ù"],
        ["&#xFA;","ú"],
        ["&#x1EE5;","ụ"],
        ["&#x1EE7;","ủ"],
        ["&#x169;","ũ"],
        ["&#x1B0;","ư"],
        ["&#x1EEB;","ừ"],
        ["&#x1EE9;","ứ"],
        ["&#x1EF1;","ự"],
        ["&#x1EED;","ử"],
        ["&#x1EEF;","ữ"],
        ["&#x1EF3;","ỳ"],
        ["&#xFD;","ý"],
        ["&#x1EF5;","ỵ"],
        ["&#x1EF7;","ỷ"],
        ["&#x1EF9;","ỹ"],
        ["&#x111;","đ"],
        ["&#xC0;","À"],
        ["&#xC1;","Á"],
        ["&#x1EA0;","Ạ"],
        ["&#x1EA2;","Ả"],
        ["&#xC3;","Ã"],
        ["&#xC2;","Â"],
        ["&#x1EA6;","Ầ"],
        ["&#x1EA4;","Ấ"],
        ["&#x1EAC;","Ậ"],
        ["&#x1EA8;","Ẩ"],
        ["&#x1EAA;","Ẫ"],
        ["&#x102;","Ă"],
        ["&#x1EB0;","Ằ"],
        ["&#x1EAE;","Ắ"],
        ["&#x1EB6;","Ặ"],
        ["&#x1EB2;","Ẳ"],
        ["&#x1EB4;","Ẵ"],
        ["&#xC8;","È"],
        ["&#xC9;","É"],
        ["&#x1EB8;","Ẹ"],
        ["&#x1EBA;","Ẻ"],
        ["&#x1EBC;","Ẽ"],
        ["&#xCA;","Ê"],
        ["&#x1EC0;","Ề"],
        ["&#x1EBE;","Ế"],
        ["&#x1EC6;","Ệ"],
        ["&#x1EC2;","Ể"],
        ["&#x1EC4;","Ễ"],
        ["&#xCC;","Ì"],
        ["&#xCD;","Í"],
        ["&#x1ECA;","Ị"],
        ["&#x1EC8;","Ỉ"],
        ["&#x128;","Ĩ"],
        ["&#xD2;","Ò"],
        ["&#xD3;","Ó"],
        ["&#x1ECC;","Ọ"],
        ["&#x1ECE;","Ỏ"],
        ["&#xD5;","Õ"],
        ["&#xD4;","Ô"],
        ["&#x1ED2;","Ồ"],
        ["&#x1ED0;","Ố"],
        ["&#x1ED8;","Ộ"],
        ["&#x1ED4;","Ổ"],
        ["&#x1ED6;","Ỗ"],
        ["&#x1A0;","Ơ"],
        ["&#x1EDC;","Ờ"],
        ["&#x1EDA;","Ớ"],
        ["&#x1EE2;","Ợ"],
        ["&#x1EDE;","Ở"],
        ["&#x1EE0;","Ỡ"],
        ["&#xD9;","Ù"],
        ["&#xDA;","Ú"],
        ["&#x1EE4;","Ụ"],
        ["&#x1EE6;","Ủ"],
        ["&#x168;","Ũ"],
        ["&#x1AF;","Ư"],
        ["&#x1EEA;","Ừ"],
        ["&#x1EE8;","Ứ"],
        ["&#x1EF0;","Ự"],
        ["&#x1EEC;","Ử"],
        ["&#x1EEE;","Ữ"],
        ["&#x1EF2;","Ỳ"],
        ["&#xDD;","Ý"],
        ["&#x1EF4;","Ỵ"],
        ["&#x1EF6;","Ỷ"],
        ["&#x1EF8;","Ỹ"],
        ["&#x110;","Đ"]
    ]
    for _, c in enumerate(uni):
        text = text.replace(c[0],c[1])
    text = text.replace(',',' , ')
    text = text.replace('[',' [ ')
    text = text.replace(']',' ] ')
    text = text.replace('{',' { ')
    text = text.replace('}',' } ')
    text = text.replace(';',' ; ')
    text = text.replace('...',' ... ')
    return text

def abs_tags(words):
    tokens = []
    found = False
    for it in words:
        if it[0].lower() in ['ngày', 'tháng']:
            found = True
            tokens.append(it)
            tokens.append(['','M', 'B-NP','B-MISC','B-DATE'])
            continue
        if found:
            if it[0].isdigit() or it[0] in ['-','/']:
                tokens[-1][0] = tokens[-1][0] + it[0]
                tokens[-1][1] = 'M'
                tokens[-1][2] = 'B-NP'
                tokens[-1][3] = 'B-MISC'
                tokens[-1][4] = 'B-DATE'
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

def remove_emojis(data):
    emoj = re.compile("["
        u"\U0001F600-\U0001F64F"  # emoticons
        u"\U0001F300-\U0001F5FF"  # symbols & pictographs
        u"\U0001F680-\U0001F6FF"  # transport & map symbols
        u"\U0001F1E0-\U0001F1FF"  # flags (iOS)
        u"\U00002500-\U00002BEF"  # chinese char
        u"\U00002702-\U000027B0"
        u"\U00002702-\U000027B0"
        u"\U000024C2-\U0001F251"
        u"\U0001f926-\U0001f937"
        u"\U00010000-\U0010ffff"
        u"\u2640-\u2642" 
        u"\u2600-\u2B55"
        u"\u200d"
        u"\u23cf"
        u"\u23e9"
        u"\u231a"
        u"\ufe0f"  # dingbats
        u"\u3030"
        "]+", re.UNICODE)
    return re.sub(emoj, '', data)

def repl(m):
    return m.group(0).replace(' ','')

def qtp_alias(text):
    text = remove_emojis(text)
    text = re.sub(r'tp\.\s+hcm',repl, text, flags=re.I) # tp. hcm
    text = re.sub(r'tp\s+\.\s+hcm',repl, text, flags=re.I) # tp . hcm
    text = re.sub(r'q\.\s+\d+',repl, text, flags=re.I) # q. 1
    text = re.sub(r'q\s+\.\s+\d+',repl, text, flags=re.I) # q . 1
    text = re.sub(r'p\.\s+\d+',repl, text, flags=re.I) # p. 10
    text = re.sub(r'p\s+\.\s+\d+',repl, text, flags=re.I) # p . 10
    text = text.replace('%',' % ')
    text = re.sub(r'\?{2,}',' ? ', text)
    text = re.sub(r'\!{2,}',' ! ', text)
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
                result = pos_sner(sent)
                # All token is part of date/datetime set to one part
                result = abs_tags(result)
                # Auto 92% -> 1% fixed
                for it in result:
                    print('            <Token tag="%s" chunking="%s" ner="%s" sner="%s"><![CDATA[%s]]></Token>' % (it[1], it[2], it[3], it[4], it[0]))
                print('        </Sentence>')
        print('    </Document>')
        print('</corpus>')
    except Exception as e:
        print(e)

    sys.exit(0)
