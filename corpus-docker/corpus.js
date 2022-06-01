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
        let lines = [];
        lines.push(article.title);
        let node = article.document;
        node.querySelectorAll('p,figcaption').forEach(function(el) {
            lines.push(el.textContent.trim());
        });
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