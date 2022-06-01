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
            v = v.replace(/&agrave;/g,'à');
            v = v.replace(/&aacute;/g,'á');
            v = v.replace(/&atilde;/g,'ã');
            v = v.replace(/&acirc;/g,'â');
            v = v.replace(/&egrave;/g,'è');
            v = v.replace(/&eacute;/g,'é');
            v = v.replace(/&ecirc;/g,'ê');
            v = v.replace(/&igrave;/g,'ì');
            v = v.replace(/&iacute;/g,'í');
            v = v.replace(/&ograve;/g,'ò');
            v = v.replace(/&oacute;/g,'ó');
            v = v.replace(/&otilde;/g,'õ');
            v = v.replace(/&ocirc;/g,'ô');
            v = v.replace(/&ugrave;/g,'ù');
            v = v.replace(/&uacute;/g,'ú');
            v = v.replace(/&yacute;/g,'ý');
            v = v.replace(/&Agrave;/g,'À');
            v = v.replace(/&Aacute;/g,'Á');
            v = v.replace(/&Atilde;/g,'Ã');
            v = v.replace(/&Acirc;/g,'Â');
            v = v.replace(/&Egrave;/g,'È');
            v = v.replace(/&Eacute;/g,'É');
            v = v.replace(/&Ecirc;/g,'Ê');
            v = v.replace(/&Igrave;/g,'Ì');
            v = v.replace(/&Iacute;/g,'Í');
            v = v.replace(/&Ograve;/g,'Ò');
            v = v.replace(/&Oacute;/g,'Ó');
            v = v.replace(/&Otilde;/g,'Õ');
            v = v.replace(/&Ocirc;/g,'Ô');
            v = v.replace(/&Ugrave;/g,'Ù');
            v = v.replace(/&Uacute;/g,'Ú');
            v = v.replace(/&Yacute;/g,'Ý');
            v = v.replace(/&ETH;/g,'Đ');
            v = v.replace(/&eth;/g,'đ');
            v = v.replace(/&nbsp;/g,' ');
            v = v.replace(/&#91;/g,'[');
            v = v.replace(/&#93;/g,']');
            v = v.replace(/&#32;/g,' ');
            v = v.replace(/&#8220;/g,'"');
            v = v.replace(/&#8221;/g,'"');
            v = v.replace(/&#224;/g,'à');
            v = v.replace(/&#225;/g,'á');
            v = v.replace(/&#7841;/g,'ạ');
            v = v.replace(/&#7843;/g,'ả');
            v = v.replace(/&#227;/g,'ã');
            v = v.replace(/&#226;/g,'â');
            v = v.replace(/&#7847;/g,'ầ');
            v = v.replace(/&#7845;/g,'ấ');
            v = v.replace(/&#7853;/g,'ậ');
            v = v.replace(/&#7849;/g,'ẩ');
            v = v.replace(/&#7851;/g,'ẫ');
            v = v.replace(/&#259;/g,'ă');
            v = v.replace(/&#7857;/g,'ằ');
            v = v.replace(/&#7855;/g,'ắ');
            v = v.replace(/&#7863;/g,'ặ');
            v = v.replace(/&#7859;/g,'ẳ');
            v = v.replace(/&#7861;/g,'ẵ');
            v = v.replace(/&#232;/g,'è');
            v = v.replace(/&#233;/g,'é');
            v = v.replace(/&#7865;/g,'ẹ');
            v = v.replace(/&#7867;/g,'ẻ');
            v = v.replace(/&#7869;/g,'ẽ');
            v = v.replace(/&#234;/g,'ê');
            v = v.replace(/&#7873;/g,'ề');
            v = v.replace(/&#7871;/g,'ế');
            v = v.replace(/&#7879;/g,'ệ');
            v = v.replace(/&#7875;/g,'ể');
            v = v.replace(/&#7877;/g,'ễ');
            v = v.replace(/&#236;/g,'ì');
            v = v.replace(/&#237;/g,'í');
            v = v.replace(/&#7883;/g,'ị');
            v = v.replace(/&#7881;/g,'ỉ');
            v = v.replace(/&#297;/g,'ĩ');
            v = v.replace(/&#242;/g,'ò');
            v = v.replace(/&#243;/g,'ó');
            v = v.replace(/&#7885;/g,'ọ');
            v = v.replace(/&#7887;/g,'ỏ');
            v = v.replace(/&#245;/g,'õ');
            v = v.replace(/&#244;/g,'ô');
            v = v.replace(/&#7891;/g,'ồ');
            v = v.replace(/&#7889;/g,'ố');
            v = v.replace(/&#7897;/g,'ộ');
            v = v.replace(/&#7893;/g,'ổ');
            v = v.replace(/&#7895;/g,'ỗ');
            v = v.replace(/&#417;/g,'ơ');
            v = v.replace(/&#7901;/g,'ờ');
            v = v.replace(/&#7899;/g,'ớ');
            v = v.replace(/&#7907;/g,'ợ');
            v = v.replace(/&#7903;/g,'ở');
            v = v.replace(/&#7905;/g,'ỡ');
            v = v.replace(/&#249;/g,'ù');
            v = v.replace(/&#250;/g,'ú');
            v = v.replace(/&#7909;/g,'ụ');
            v = v.replace(/&#7911;/g,'ủ');
            v = v.replace(/&#361;/g,'ũ');
            v = v.replace(/&#432;/g,'ư');
            v = v.replace(/&#7915;/g,'ừ');
            v = v.replace(/&#7913;/g,'ứ');
            v = v.replace(/&#7921;/g,'ự');
            v = v.replace(/&#7917;/g,'ử');
            v = v.replace(/&#7919;/g,'ữ');
            v = v.replace(/&#7923;/g,'ỳ');
            v = v.replace(/&#253;/g,'ý');
            v = v.replace(/&#7925;/g,'ỵ');
            v = v.replace(/&#7927;/g,'ỷ');
            v = v.replace(/&#7929;/g,'ỹ');
            v = v.replace(/&#273;/g,'đ');
            v = v.replace(/&#192;/g,'À');
            v = v.replace(/&#193;/g,'Á');
            v = v.replace(/&#7840;/g,'Ạ');
            v = v.replace(/&#7842;/g,'Ả');
            v = v.replace(/&#195;/g,'Ã');
            v = v.replace(/&#194;/g,'Â');
            v = v.replace(/&#7846;/g,'Ầ');
            v = v.replace(/&#7844;/g,'Ấ');
            v = v.replace(/&#7852;/g,'Ậ');
            v = v.replace(/&#7848;/g,'Ẩ');
            v = v.replace(/&#7850;/g,'Ẫ');
            v = v.replace(/&#258;/g,'Ă');
            v = v.replace(/&#7856;/g,'Ằ');
            v = v.replace(/&#7854;/g,'Ắ');
            v = v.replace(/&#7862;/g,'Ặ');
            v = v.replace(/&#7858;/g,'Ẳ');
            v = v.replace(/&#7860;/g,'Ẵ');
            v = v.replace(/&#200;/g,'È');
            v = v.replace(/&#201;/g,'É');
            v = v.replace(/&#7864;/g,'Ẹ');
            v = v.replace(/&#7866;/g,'Ẻ');
            v = v.replace(/&#7868;/g,'Ẽ');
            v = v.replace(/&#202;/g,'Ê');
            v = v.replace(/&#7872;/g,'Ề');
            v = v.replace(/&#7870;/g,'Ế');
            v = v.replace(/&#7878;/g,'Ệ');
            v = v.replace(/&#7874;/g,'Ể');
            v = v.replace(/&#7876;/g,'Ễ');
            v = v.replace(/&#204;/g,'Ì');
            v = v.replace(/&#205;/g,'Í');
            v = v.replace(/&#7882;/g,'Ị');
            v = v.replace(/&#7880;/g,'Ỉ');
            v = v.replace(/&#296;/g,'Ĩ');
            v = v.replace(/&#210;/g,'Ò');
            v = v.replace(/&#211;/g,'Ó');
            v = v.replace(/&#7884;/g,'Ọ');
            v = v.replace(/&#7886;/g,'Ỏ');
            v = v.replace(/&#213;/g,'Õ');
            v = v.replace(/&#212;/g,'Ô');
            v = v.replace(/&#7890;/g,'Ồ');
            v = v.replace(/&#7888;/g,'Ố');
            v = v.replace(/&#7896;/g,'Ộ');
            v = v.replace(/&#7892;/g,'Ổ');
            v = v.replace(/&#7894;/g,'Ỗ');
            v = v.replace(/&#416;/g,'Ơ');
            v = v.replace(/&#7900;/g,'Ờ');
            v = v.replace(/&#7898;/g,'Ớ');
            v = v.replace(/&#7906;/g,'Ợ');
            v = v.replace(/&#7902;/g,'Ở');
            v = v.replace(/&#7904;/g,'Ỡ');
            v = v.replace(/&#217;/g,'Ù');
            v = v.replace(/&#218;/g,'Ú');
            v = v.replace(/&#7908;/g,'Ụ');
            v = v.replace(/&#7910;/g,'Ủ');
            v = v.replace(/&#360;/g,'Ũ');
            v = v.replace(/&#431;/g,'Ư');
            v = v.replace(/&#7914;/g,'Ừ');
            v = v.replace(/&#7912;/g,'Ứ');
            v = v.replace(/&#7920;/g,'Ự');
            v = v.replace(/&#7916;/g,'Ử');
            v = v.replace(/&#7918;/g,'Ữ');
            v = v.replace(/&#7922;/g,'Ỳ');
            v = v.replace(/&#221;/g,'Ý');
            v = v.replace(/&#7924;/g,'Ỵ');
            v = v.replace(/&#7926;/g,'Ỷ');
            v = v.replace(/&#7928;/g,'Ỹ');
            v = v.replace(/&#272;/g,'Đ');
            v = v.replace(/&#xE0;/g,'à');
            v = v.replace(/&#xE1;/g,'á');
            v = v.replace(/&#x1EA1;/g,'ạ');
            v = v.replace(/&#x1EA3;/g,'ả');
            v = v.replace(/&#xE3;/g,'ã');
            v = v.replace(/&#xE2;/g,'â');
            v = v.replace(/&#x1EA7;/g,'ầ');
            v = v.replace(/&#x1EA5;/g,'ấ');
            v = v.replace(/&#x1EAD;/g,'ậ');
            v = v.replace(/&#x1EA9;/g,'ẩ');
            v = v.replace(/&#x1EAB;/g,'ẫ');
            v = v.replace(/&#x103;/g,'ă');
            v = v.replace(/&#x1EB1;/g,'ằ');
            v = v.replace(/&#x1EAF;/g,'ắ');
            v = v.replace(/&#x1EB7;/g,'ặ');
            v = v.replace(/&#x1EB3;/g,'ẳ');
            v = v.replace(/&#x1EB5;/g,'ẵ');
            v = v.replace(/&#xE8;/g,'è');
            v = v.replace(/&#xE9;/g,'é');
            v = v.replace(/&#x1EB9;/g,'ẹ');
            v = v.replace(/&#x1EBB;/g,'ẻ');
            v = v.replace(/&#x1EBD;/g,'ẽ');
            v = v.replace(/&#xEA;/g,'ê');
            v = v.replace(/&#x1EC1;/g,'ề');
            v = v.replace(/&#x1EBF;/g,'ế');
            v = v.replace(/&#x1EC7;/g,'ệ');
            v = v.replace(/&#x1EC3;/g,'ể');
            v = v.replace(/&#x1EC5;/g,'ễ');
            v = v.replace(/&#xEC;/g,'ì');
            v = v.replace(/&#xED;/g,'í');
            v = v.replace(/&#x1ECB;/g,'ị');
            v = v.replace(/&#x1EC9;/g,'ỉ');
            v = v.replace(/&#x129;/g,'ĩ');
            v = v.replace(/&#xF2;/g,'ò');
            v = v.replace(/&#xF3;/g,'ó');
            v = v.replace(/&#x1ECD;/g,'ọ');
            v = v.replace(/&#x1ECF;/g,'ỏ');
            v = v.replace(/&#xF5;/g,'õ');
            v = v.replace(/&#xF4;/g,'ô');
            v = v.replace(/&#x1ED3;/g,'ồ');
            v = v.replace(/&#x1ED1;/g,'ố');
            v = v.replace(/&#x1ED9;/g,'ộ');
            v = v.replace(/&#x1ED5;/g,'ổ');
            v = v.replace(/&#x1ED7;/g,'ỗ');
            v = v.replace(/&#x1A1;/g,'ơ');
            v = v.replace(/&#x1EDD;/g,'ờ');
            v = v.replace(/&#x1EDB;/g,'ớ');
            v = v.replace(/&#x1EE3;/g,'ợ');
            v = v.replace(/&#x1EDF;/g,'ở');
            v = v.replace(/&#x1EE1;/g,'ỡ');
            v = v.replace(/&#xF9;/g,'ù');
            v = v.replace(/&#xFA;/g,'ú');
            v = v.replace(/&#x1EE5;/g,'ụ');
            v = v.replace(/&#x1EE7;/g,'ủ');
            v = v.replace(/&#x169;/g,'ũ');
            v = v.replace(/&#x1B0;/g,'ư');
            v = v.replace(/&#x1EEB;/g,'ừ');
            v = v.replace(/&#x1EE9;/g,'ứ');
            v = v.replace(/&#x1EF1;/g,'ự');
            v = v.replace(/&#x1EED;/g,'ử');
            v = v.replace(/&#x1EEF;/g,'ữ');
            v = v.replace(/&#x1EF3;/g,'ỳ');
            v = v.replace(/&#xFD;/g,'ý');
            v = v.replace(/&#x1EF5;/g,'ỵ');
            v = v.replace(/&#x1EF7;/g,'ỷ');
            v = v.replace(/&#x1EF9;/g,'ỹ');
            v = v.replace(/&#x111;/g,'đ');
            v = v.replace(/&#xC0;/g,'À');
            v = v.replace(/&#xC1;/g,'Á');
            v = v.replace(/&#x1EA0;/g,'Ạ');
            v = v.replace(/&#x1EA2;/g,'Ả');
            v = v.replace(/&#xC3;/g,'Ã');
            v = v.replace(/&#xC2;/g,'Â');
            v = v.replace(/&#x1EA6;/g,'Ầ');
            v = v.replace(/&#x1EA4;/g,'Ấ');
            v = v.replace(/&#x1EAC;/g,'Ậ');
            v = v.replace(/&#x1EA8;/g,'Ẩ');
            v = v.replace(/&#x1EAA;/g,'Ẫ');
            v = v.replace(/&#x102;/g,'Ă');
            v = v.replace(/&#x1EB0;/g,'Ằ');
            v = v.replace(/&#x1EAE;/g,'Ắ');
            v = v.replace(/&#x1EB6;/g,'Ặ');
            v = v.replace(/&#x1EB2;/g,'Ẳ');
            v = v.replace(/&#x1EB4;/g,'Ẵ');
            v = v.replace(/&#xC8;/g,'È');
            v = v.replace(/&#xC9;/g,'É');
            v = v.replace(/&#x1EB8;/g,'Ẹ');
            v = v.replace(/&#x1EBA;/g,'Ẻ');
            v = v.replace(/&#x1EBC;/g,'Ẽ');
            v = v.replace(/&#xCA;/g,'Ê');
            v = v.replace(/&#x1EC0;/g,'Ề');
            v = v.replace(/&#x1EBE;/g,'Ế');
            v = v.replace(/&#x1EC6;/g,'Ệ');
            v = v.replace(/&#x1EC2;/g,'Ể');
            v = v.replace(/&#x1EC4;/g,'Ễ');
            v = v.replace(/&#xCC;/g,'Ì');
            v = v.replace(/&#xCD;/g,'Í');
            v = v.replace(/&#x1ECA;/g,'Ị');
            v = v.replace(/&#x1EC8;/g,'Ỉ');
            v = v.replace(/&#x128;/g,'Ĩ');
            v = v.replace(/&#xD2;/g,'Ò');
            v = v.replace(/&#xD3;/g,'Ó');
            v = v.replace(/&#x1ECC;/g,'Ọ');
            v = v.replace(/&#x1ECE;/g,'Ỏ');
            v = v.replace(/&#xD5;/g,'Õ');
            v = v.replace(/&#xD4;/g,'Ô');
            v = v.replace(/&#x1ED2;/g,'Ồ');
            v = v.replace(/&#x1ED0;/g,'Ố');
            v = v.replace(/&#x1ED8;/g,'Ộ');
            v = v.replace(/&#x1ED4;/g,'Ổ');
            v = v.replace(/&#x1ED6;/g,'Ỗ');
            v = v.replace(/&#x1A0;/g,'Ơ');
            v = v.replace(/&#x1EDC;/g,'Ờ');
            v = v.replace(/&#x1EDA;/g,'Ớ');
            v = v.replace(/&#x1EE2;/g,'Ợ');
            v = v.replace(/&#x1EDE;/g,'Ở');
            v = v.replace(/&#x1EE0;/g,'Ỡ');
            v = v.replace(/&#xD9;/g,'Ù');
            v = v.replace(/&#xDA;/g,'Ú');
            v = v.replace(/&#x1EE4;/g,'Ụ');
            v = v.replace(/&#x1EE6;/g,'Ủ');
            v = v.replace(/&#x168;/g,'Ũ');
            v = v.replace(/&#x1AF;/g,'Ư');
            v = v.replace(/&#x1EEA;/g,'Ừ');
            v = v.replace(/&#x1EE8;/g,'Ứ');
            v = v.replace(/&#x1EF0;/g,'Ự');
            v = v.replace(/&#x1EEC;/g,'Ử');
            v = v.replace(/&#x1EEE;/g,'Ữ');
            v = v.replace(/&#x1EF2;/g,'Ỳ');
            v = v.replace(/&#xDD;/g,'Ý');
            v = v.replace(/&#x1EF4;/g,'Ỵ');
            v = v.replace(/&#x1EF6;/g,'Ỷ');
            v = v.replace(/&#x1EF8;/g,'Ỹ');
            v = v.replace(/&#x110;/g,'Đ');
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