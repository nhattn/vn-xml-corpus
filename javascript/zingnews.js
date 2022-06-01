javascript: (function() {
    var node = document.body.cloneNode(true);
    node.querySelectorAll('#innerarticle').forEach(function(el) {
        el.remove();
    });
    var lines = [];
    lines.push(node.querySelector('h1.the-article-title').textContent.trim());
    lines.push(node.querySelector('li.the-article-publish').textContent.trim());
    lines.push(node.querySelector('p.the-article-summary').textContent.trim());
    node.querySelectorAll('.the-article-body p,.the-article-body figcaption').forEach(function(el) {
        lines.push(el.textContent.trim());
    });
    if (node.querySelector('.source-wrapper')) {
        lines.push(node.querySelector('.source-wrapper').textContent.trim());
    }
    var unique = [];
    for (var i in lines) {
        line = lines[i].replace(/[\r\n\t]+/g,' ').replace(/ {2,}/g,' ').trim();
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
        return v.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;').trim();
    }).filter(function(v) {
        return v.length > 0;
    });
    var xml = '<?xml version="1.0" encoding="UTF-8"?>';
    xml += '<Document>';
    xml += '<Link>'+document.location.href+'</Link>';
    xml += '<Entry><Text>';
    xml += unique.join('</Text>\n<Text>');
    xml += '</Text></Entry>';
    xml += '</Document>';
    var a = document.createElement('a');
    a.href = 'data:application/xml;charset=utf-8,' + encodeURIComponent(xml);
    a.target = '_blank';
    var file = document.location.href.split('/').pop();
    a.download = file.replace('.html','.xml');
    a.click();
})();
