'use strict';
const fs = require('fs');
const path = require('path');
const express = require('express');
const bodyParser = require("body-parser");
const readability = require('./libs/readability/readability');
const trie = require('./libs/trie')
const re = require('./libs/regex_tokenize')
const consts = require('./libs/constants')
const utils = require('./libs/utils');
const xml2js = require('xml2js');
const parser = new xml2js.Parser({ attrkey: "ATTR" });

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

const vtrie = trie.load(path.join(__dirname, "vocab.txt"));

const errorResponder = function(error, request, response, next) {
    response.header("Content-Type", 'application/json');
    const status = error.status || 400;
    response.status(status).send(JSON.stringify({
        error: error.message
    }));
};

const invalidPathHandler = function(request, response, next) {
    response.header("Content-Type", 'application/json');
    response.status(404);
    response.send(JSON.stringify({
        error: 'Not found'
    }));
};

app.get('/', function (req, res) {
    res.render("index", {
        title:'VN Corpus',
        toolkits : consts.TOOLKITS
    });
});

app.post('/upload', async function(req, res) {
    var temp = 'temp' + Math.floor(Math.random() * 10);
    var writeStream = fs.createWriteStream(temp);
    req.pipe(writeStream);
    writeStream.on('finish', () => {
        let reader = fs.readFileSync(temp);
        let hash = reader.slice(0,reader.indexOf('\r\n'));
        let content = reader.slice(reader.indexOf('\r\n\r\n') + '\r\n\r\n'.length, reader.lastIndexOf(Buffer.from('\r\n') + hash));
        // After real file is created, delete temporary file
        fs.unlinkSync(temp);
        try {
            parser.parseString(content.toString(), (error, result) => {
                if(error === null) {
                    if (result.Document === undefined) {
                        return res.json({
                            error:'Tập tin không đúng chuẩn 0'
                        });
                    }
                    let doc = result.Document;
                    if (doc.Entry === undefined || doc.Entry.length == 0) {
                        return res.json({
                            error:'Tập tin không đúng chuẩn 1'
                        });
                    }
                    if (doc.Entry[0].Text === undefined) {
                        return res.json({
                            error:'Tập tin không đúng chuẩn 2'
                        });
                    }
                    return res.json(doc.Entry[0].Text);
                } else {
                    return res.json({
                        error:error.message
                    });
                }
            });
        } catch (e) {
            res.json({
                error: e.message
            })
        }
    });
});
app.post('/api/tokenize', function(req, res) {
    let text = req.body.text || null;
    if (!text || text.length == 0) {
        return res.json({
            error:'Không có dữ liệu xử lý'
        });
    }
    text = utils.vn_words(text);
    let tokens = re.tokenize(text.trim());
    return res.json(tokens);
});
app.post('/api/fetch', function(req, res) {
    let url = req.body.url || null;
    let format = (req.body.format || '').toLowerCase();
    if ( ! url || url.length == 0 ) {
        if (format == 'xml') {
            res.header("Content-Type", "application/xml");
            let data = `<?xml version="1.0" encoding="UTF-8"?>`;
            data += `<Response><Error><![CDATA[Vui lòng nhập vào địa chỉ lấy nội dung]]></Error></Response>`;
            return res.status(400).send(data);
        }
        return res.json({
            error:'Vui lòng nhập vào địa chỉ lấy nội dung'
        });
    }
    readability(url, function(err, article, meta) {
        if (err) {
            if (format == 'xml') {
                res.header("Content-Type", "application/xml");
                let data = `<?xml version="1.0" encoding="UTF-8"?>`;
                data += `<Response><Error><![CDATA[${err.message}]]></Error></Response>`;
                return res.status(400).send(data);
            }
            return res.json({
                error: err.message
            });
        }
        let pattern = new RegExp('<br/?>[ \r\n\s]*<br/?>', 'g');
        let html = article.html.replace(pattern, '</p><p>').replace(/<\/?font[^>]*>/g, '');
        let lines = [];
        lines.push(article.title);
        let doc = article.document.cloneNode(true);
        doc.innerHTML = html;
        let allParagraphs = doc.getElementsByTagName('p');
        
        for (var j = 0; j < allParagraphs.length; j++) {
            let parentNode = allParagraphs[j].parentNode;
            if (typeof parentNode.readability == 'undefined') {
                parentNode.readability = { contentScore: 0 };
                if (parentNode.className.match(/(comment|meta|footer|footnote)/)) {
                    parentNode.readability.contentScore -= 50;
                } else if (
                    parentNode.className.match(
                      /((^|\\s)(post|hentry|entry[-]?(content|text|body)?|article[-]?(content|text|body)?)(\\s|$))/
                    )
                ) {
                    parentNode.readability.contentScore += 25;
                }
                if (parentNode.id.match(/(comment|meta|footer|footnote)/)) {
                    parentNode.readability.contentScore -= 50;
                } else if (
                    parentNode.id.match(
                      /^(post|hentry|entry[-]?(content|text|body)?|article[-]?(content|text|body)?)$/
                    )
                ) {
                    parentNode.readability.contentScore += 25;
                }
            }
            if (utils.getInnerText(allParagraphs[j]).length > 10) {
                parentNode.readability.contentScore++;
            }
            parentNode.readability.contentScore += utils.getCharCount(allParagraphs[j]);
        }
        let nodeIndex = 0;
        let node = null;
        let topDiv = null;
        for (nodeIndex = 0; (node = doc.getElementsByTagName('*')[nodeIndex]); nodeIndex++) {
            if (
                typeof node.readability != 'undefined' &&
                (topDiv == null || node.readability.contentScore > topDiv.readability.contentScore)
            ) {
                topDiv = node;
            }
        }
        if (topDiv == null) {
            if (format == 'xml') {
                res.header("Content-Type", "application/xml");
                let data = `<?xml version="1.0" encoding="UTF-8"?>`;
                data += `<Response><Error><![CDATA[Không có nội dung]]></Error></Response>`;
                return res.status(400).send(data);
            }
            return res.json({
                error:'Không có nội dung'
            });
        }
        topDiv = utils.killCodeSpans(topDiv);
        topDiv = utils.killDivs(topDiv);
        topDiv = utils.killBreaks(topDiv);
        topDiv = utils.clean(topDiv, 'form');
        topDiv = utils.clean(topDiv, 'table', 8);
        topDiv = utils.clean(topDiv, 'h1');
        topDiv = utils.clean(topDiv, "object");
        topDiv = utils.clean(topDiv, 'h2');
        topDiv = utils.clean(topDiv, 'iframe');
        topDiv.querySelectorAll('p,figcaption').forEach(function(el) {
            lines.push(el.textContent.trim());
        });
        article.close();
        let unique = [];
        for (var i in lines) {
            let line = lines[i].replace(/[\r\n\t]+/g,' ').replace(/ {2,}/g,' ').trim();
            if (unique.includes(line) == false) {
                unique.push(line);
            }
        }
        unique = unique.map(function(v) {
            v = utils.vn_words(v);
            return v.trim();
        }).filter(function(v) {
            return v.length > 0;
        });
        if (format == 'xml') {
            res.header("Content-Type", "application/xml");
            let data = `<?xml version="1.0" encoding="UTF-8"?>`;
            data += `<Document><Link><![CDATA[${url}]]></Link><Entry>`;
            for (var i in unique) {
                data += `<Text><![CDATA[${unique[i]}]]></Text>`;
            }
            data += `</Entry></Document>`;
            return res.status(200).send(data);
        }
        return res.json(unique);
    });
});
app.use(errorResponder);
app.use(invalidPathHandler);
app.listen(8081, function () {
    console.log('app listening on port 8081!');
});
