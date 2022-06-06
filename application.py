#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
import json
import regex as re
from xml.dom import minidom
from flask import Flask
from flask import Response
from flask import send_from_directory
from flask import render_template, request, jsonify
from readability import get_content
from vinlp import sent_tokenize
from vinlp import word_tokenize
from vinlp import pos_tag
from vinlp import pos_chunk
from vinlp import pos_ner
from vinlp import pos_sner

app = Flask(__name__)

app.config["JSON_AS_ASCII"] = False
app.config["JSONIFY_PRETTYPRINT_REGULAR"] = False
app.config["DEBUG"] = True

ABSPATH = os.path.dirname(os.path.realpath(__file__))

# functions
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

def repx(m):
    text = m.group(0)
    encode_chars = [',','[',']','{','}',';',':','/','-','.','+','(',')','\'','"']
    for i in range(len(encode_chars)):
        ch = encode_chars[i]
        enc = 'TOKEN_%d' % i
        text = text.replace(ch, enc)
    return text

def decode_special_chars(text):
    encode_chars = [',','[',']','{','}',';',':','/','-','.','+','(',')','\'','"']
    for i in range(len(encode_chars)):
        ch = encode_chars[i]
        enc = 'TOKEN_%d' % i
        text = text.replace(enc, ch)
    return text

def domain_normalize(text):
    text = re.sub(r'((?:(ftp|http)s?:(?:/{1,3}|[a-z0-9%])|[a-z0-9.-]+[.](?:[a-z]{2,13})/)(?:[^s()<>{}[]]+|([^s()]*?([^s()]+)[^s()]*?)|([^s]+?))+(?:([^s()]*?([^s()]+)[^s()]*?)|([^s]+?)|[^s`!()[]{};:\'".,<>?«»“”‘’])|(?:(?<!@)[a-z0-9]+(?:[.-][a-z0-9]+)*[.](?:[a-z]{2,13})\b/?(?!@)))', repx, text)
    return text.strip()

def email_normalize(text):
    text = re.sub(r'([a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+)', repx, text)
    return text.strip()

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

def short_name_normalize(text):
    text = re.sub(r'([A-Z]\s+\.\s+[A-Z][A-Z]\s+\.\s+[A-Z])', repl, text)
    text = re.sub(r'([A-Z]\s+\.\s+[A-Z]\s+\.\s+[A-Z])', repl, text)
    text = re.sub(r'([A-Z]\s+\.\s+[A-Z])', repl, text)
    text = re.sub(r'([A-Z]\s+\.)', repl, text)
    return text.strip()

def tp_shortname(text):
    text = re.sub(r'(tp\s+\.\s+(bmt|hcm))', repl, text, flags=re.I)
    return text.strip()

# end functions

# Routers

@app.route('/')
def corpus_home():
    argv = {
        'title':'Nature Language Processing Toolkit'
    }
    if os.path.isfile(os.path.join(ABSPATH, 'toolkit.json')):
        try:
            with open(os.path.join(ABSPATH, 'toolkit.json'),'r', encoding='utf-8', errors='ignore') as f:
                argv['toolkits'] = json.load(f)
        except:
            pass

    return render_template('index.html', **argv)

@app.route('/upload', methods=['POST'])
def corpus_upload():
    if not ('file' in request.files):
        return jsonify({
            'error':'Tập tin không đúng chuẩn'
        })

    raws = []

    try:
        xml_file = request.files["file"]
        xml_text = (xml_file.read()).decode('utf-8')
        xml_file.close()

        doc = minidom.parseString(xml_text)
        for el in doc.getElementsByTagName('Text'):
            raws.append(el.firstChild.data)
    except Exception as e:
        return jsonify({
            'error':str(e)
        })

    return jsonify(raws)

@app.route('/api/fetch', methods=['POST'])
def corpus_fetch():
    if request.content_type and "application/json" in request.content_type:
        data = request.get_json()
    else:
        data = request.form

    url = data.get('url', '').strip()
    fmt = data.get('format', '').strip().lower()
    if '://' not in url:
        if fmt == "xml":
            xml = '<?xml version="1.0" encoding="UTF-8"?><Response><Error><![CDATA[Vui lòng nhập vào địa chỉ lấy nội dung]]></Error></Response>'
            return Response(xml, mimetype='text/xml')

        return jsonify({
            'error':'Vui lòng nhập vào địa chỉ lấy nội dung'
        })

    uniqued = get_content(url)

    if len(uniqued) == 0:
        if fmt == "xml":
            xml = '<?xml version="1.0" encoding="UTF-8"?><Response><Error><![CDATA[Không có nội dung]]></Error></Response>'
            return Response(xml, mimetype='text/xml')

        return jsonify({
            'error':'Không có nội dung'
        })

    if fmt == "xml":
        xml = '<?xml version="1.0" encoding="UTF-8"?>'
        xml += '<Document><Link><![CDATA[%s]]></Link><Entry>' % url
        for text in unique:
            xml += '<Text><![CDATA[%s]]></Text>' % text
        xml += '</Entry></Document>'
        return Response(xml, mimetype='text/xml')

    return jsonify(uniqued)

@app.route('/api/predict', methods=['POST'])
def corpus_predict():
    if request.content_type and "application/json" in request.content_type:
        data = request.get_json()
    else:
        data = request.form

    action = data.get('action', '').strip()
    text = data.get('text', '').strip()
    if not action or not text:
        return jsonify({
            'error':'Không có dữ liệu xử lý'
        })

    text = unicode_replace(text)
    text = email_normalize(text)
    text = domain_normalize(text)
    text = tp_shortname(text)
    text = datetime_normalize(text)
    text = short_name_normalize(text)
    text = decode_special_chars(text)

    if action == "sent":
        tokens = sent_tokenize(text)
    elif action == "word":
        tokens = word_tokenize(text)
    elif action == "pos":
        tokens = pos_tag(text)
    elif action == "chunk":
        tokens = pos_chunk(text)
    elif action == "ner":
        tokens = pos_ner(text)
    elif action == "sner":
        tokens = pos_sner(text)
    else:
        return jsonify({
            'error':'Hệ thống không tìm thấy chức năng này'
        })

    return jsonify(tokens)

@app.route('/favicon.png')
def corpus_favicon():
    return send_from_directory(ABSPATH, filename='favicon.png', mimetype='image/png')

# End routes

# Jinja template
@app.context_processor
def inject_now():
    from datetime import datetime
    return {
        'now': datetime.now()
    }
# End Jinja

@app.errorhandler(404)
def javis_not_found(err):
    if request.path.startswith('/api'):
        return jsonify({
            'error':'Not Found'
        })
    return render_template('error.html'), 404

@app.errorhandler(400)
def javis_bad_request(err):
    if request.path.startswith('/api'):
        return jsonify({
            'error':'Bad Request'
        })
    return render_template('error.html'), 400

@app.errorhandler(500)
def javis_server_error(err):
    if request.path.startswith('/api'):
        return jsonify({
            'error':'Internal Server Error'
        })
    return render_template('error.html'), 500

@app.errorhandler(405)
def javis_not_allowed(err):
    if request.path.startswith('/api'):
        return jsonify({
            'error':'Method Not Allowed'
        })
    return render_template('error.html'), 405

@app.errorhandler(403)
def javis_forbidden(err):
    if request.path.startswith('/api'):
        return jsonify({
            'error':'Forbidden'
        })
    return render_template('error.html'), 403

if __name__ == "__main__":
    if app.config["DEBUG"] == False:
        import logging
        log = logging.getLogger('werkzeug')
        log.disabled = True
        app.logger.disabled = True
    app.run('0.0.0.0', port=8081)
