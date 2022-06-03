'use strict';
const fs = require('fs');
const path = require('path');
const express = require('express');
const bodyParser = require("body-parser");
const readability = require('node-readability');
const trie = require('./libs/trie')
const re = require('./libs/regex_tokenize')
const consts = require('./libs/constants')
const utils = require('./libs/utils')

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
        let filename = reader.slice(reader.indexOf("filename=\"") + "filename=\"".length, reader.indexOf('"\r\nContent-Type'));
        let hash = reader.slice(0,reader.indexOf('\r\n'));
        let content = reader.slice(reader.indexOf('\r\n\r\n') + '\r\n\r\n'.length, reader.lastIndexOf(Buffer.from('\r\n') + hash));
        // After real file is created, delete temporary file
        fs.writeFileSync(filename.toString(), content);
        fs.unlinkSync(temp);
        res.json({
            filename: filename.toString()
        })
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
    res.header("Content-Type", "application/xml");
    if ( ! url || url.length == 0 ) {
        let data = `<?xml version="1.0" encoding="UTF-8"?>`;
        data += `<Response><Error><![CDATA[URL is required]]></Error></Response>`;
        return res.status(400).send(data);
    }
    readability(url, function(err, article, meta) {
        if (err) {
            let data = `<?xml version="1.0" encoding="UTF-8"?>`;
            data += `<Response><Error><![CDATA[${err.message}]]></Error></Response>`;
            return res.status(400).send(data);
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
            let data = `<?xml version="1.0" encoding="UTF-8"?>`;
            data += `<Response><Error><![CDATA[No content]]></Error></Response>`;
            return res.status(400).send(data);
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
        let data = `<?xml version="1.0" encoding="UTF-8"?>`;
        data += `<Document><Link><![CDATA[${url}]]></Link><Entry>`;
        for (var i in unique) {
            data += `<Text><![CDATA[${unique[i]}]]></Text>`;
        }
        data += `</Entry></Document>`;
        return res.status(200).send(data);
    });
});
app.use(errorResponder);
app.use(invalidPathHandler);
app.listen(8081, function () {
    console.log('app listening on port 8081!');
});
