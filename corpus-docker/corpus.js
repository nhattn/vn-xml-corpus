'use strict';
const path = require('path');
const express = require('express');
const bodyParser = require("body-parser");
const readability = require('node-readability');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const errorResponder = function(error, request, response, next) {
    response.header("Content-Type", 'application/json');
    const status = error.status || 400;
    response.status(status).send(JSON.stringify({
        error: error.message
    }));
};

const getInnerText = function(e) {
    return e.textContent.replace(/ {2,}/g,' ').trim();
};

const getCharCount = function(e, s) {
    s = s || ',';
    return getInnerText(e).split(s).length;
};

const killDivs = function(e) {
    var divsList = e.getElementsByTagName('div');
    var curDivLength = divsList.length;
    for (var i = curDivLength - 1; i >= 0; i--) {
        var p = divsList[i].getElementsByTagName('p').length;
        var img = divsList[i].getElementsByTagName('img').length;
        var li = divsList[i].getElementsByTagName('li').length;
        var a = divsList[i].getElementsByTagName('a').length;
        var embed = divsList[i].getElementsByTagName('embed').length;
        var object = divsList[i].getElementsByTagName('object').length;
        var pre = divsList[i].getElementsByTagName('pre').length;
        var code = divsList[i].getElementsByTagName('code').length;
        var divId = divsList[i].id;
        var divClass = divsList[i].className;
        var sphereit = divsList[i].innerHTML.match('<!-- sphereit') == null ? 0 : 1;
        if (getCharCount(divsList[i]) < 10) {
            if (
                ( img > p || li > p || a > p || p == 0 ||
                divId.match('comment') != null ||
                divClass.match('comment') != null ||
                divId.match('share') != null ||
                divClass.match('share') != null) &&
                (pre == 0 && code == 0 && embed == 0 && object == 0 && sphereit == 0)
            ) {
                if (!p == 0 && img == 1) {
                    divsList[i].parentNode.removeChild(divsList[i]);
                }
            }
        }
        var stopwords = ['comment', 'share', 'footer', '^ad'];
        for (var sw = 0; sw < stopwords.length; sw++) {
            var regex = new RegExp(stopwords[sw]);
            if (divId.match(regex) != null || divClass.match(regex) != null) {
                console.log('matched ' + stopwords[sw]);
                divsList[i].parentNode.removeChild(divsList[i]);
            }
        }
    }
    return e;
};

const killBreaks = function(e) {
    e.innerHTML = e.innerHTML.replace(/(<br\s*\/?>(\s|&nbsp;?)*){1,}/g, '<br />');
    return e;
};

const killCodeSpans = function(e) {
    e.innerHTML = e.innerHTML.replace(/<\/?\s?span(?:[^>]+)?>/g, '');
    return e;
};

const clean = function(e, tags, minWords) {
    var targetList;
    var y;
    if (tags == 'table') {
        targetList = e.getElementsByTagName(tags);
        var minWords = minWords || 1000000;
        for (y = 0; y < targetList.length; y++) {
            var cells = targetList[y].getElementsByTagName('td').length;
            if (cells < minWords) {
                targetList[y].parentNode.removeChild(targetList[y]);
            }
        }
    } else {
        targetList = e.getElementsByTagName(tags);
        var minWords = minWords || 1000000;
        for (y = 0; y < targetList.length; y++) {
            if (getCharCount(targetList[y], ' ') < minWords && targetList[y].tagName != 'pre') {
                targetList[y].parentNode.removeChild(targetList[y]);
            }
        }
    }
    return e;
};

const invalidPathHandler = function(request, response, next) {
    response.header("Content-Type", 'application/json');
    response.status(404);
    response.send(JSON.stringify({
        error: 'Not found'
    }));
};

app.get('/', function (req, res) {
    res.json(["VN Corpus"]);
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
            if (getInnerText(allParagraphs[j]).length > 10) {
                parentNode.readability.contentScore++;
            }
            parentNode.readability.contentScore += getCharCount(allParagraphs[j]);
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
        topDiv = killCodeSpans(topDiv);
        topDiv = killDivs(topDiv);
        topDiv = killBreaks(topDiv);
        topDiv = clean(topDiv, 'form');
        topDiv = clean(topDiv, 'table', 8);
        topDiv = clean(topDiv, 'h1');
        topDiv = clean(topDiv, "object");
        topDiv = clean(topDiv, 'h2');
        topDiv = clean(topDiv, 'iframe');
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
            v = v.replace(/…/g,'...');
            v = v.replace(/[“”]/g,'"');
            v = v.replace(/[‘’]/g,"'");
            v = v.replace(/–/g,"-"),
            v = v.replace(//g," ");
            v = v.replace(/ð/g,"đ");
            v = v.replace(/ {2,}/g,' ');
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