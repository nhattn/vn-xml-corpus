javascript: (function() {
    var node = document.body.cloneNode(true);
    var lines = [];
    var sremove = [
        '.box-tinlienquanv2',
        '.location-stamp',
        '#innerarticle'
    ];
    for (var i in sremove) {
        node.querySelectorAll(sremove[i]).forEach(function(el) {
            el.remove();
        });
    }
    var stitle = [
        'h1.title-detail',
        'h1.title-post',
        'h1.cms-title',
        'h1.the-article-title',
        'h1.article-title'
    ];
    for(var i in stitle) {
        var title = node.querySelector(stitle[i]);
        if (title && title.textContent.trim().length > 0) {
            lines.push(title.textContent.trim());
            break;
        }
    }
    var ssapo = [
        'p.description',
        'div.cms-desc',
        'h2.sapo',
        'p.the-article-summary'
    ];
    for(var i in ssapo) {
        var sapo = node.querySelector(ssapo[i]);
        if (sapo && sapo.textContent.trim().length > 0) {
            lines.push(sapo.textContent.trim());
            break;
        }
    }
    var sbody = [
        '.fck_detail p,.fck_detail figcaption',
        '.cms-body p,.cms-body figcaption',
        '.the-article-body p,.the-article-body figcaption',
        '.source-wrapper',
        '.main-content-body p,.main-content-body figcaption'
    ];
    for(var i in sbody) {
        node.querySelectorAll(sbody[i]).forEach(function(el) {
            lines.push(el.textContent.trim());
        });
    }
    var unique = [];
    for (var i in lines) {
        line = lines[i].replace(/[\r\n\t]+/g, ' ').replace(/ {2,}/g, ' ').trim();
        if (unique.includes(line) == false) {
            unique.push(line);
        }
    }
    unique = unique.map(function(v) {
        if (['This is a modal window.', 'Beginning of dialog window. Escape will cancel and close the window.', 'End of dialog window.'].indexOf(v) != -1) {
            return '';
        }
        v = v.replace(/…/g, '...');
        v = v.replace(/[“”]/g, '"');
        v = v.replace(/[‘’]/g, "'");
        v = v.replace(/×/g, "x");
        v = v.replace(/÷/g, "/");
        v = v.replace(/–/g, "-"), v = v.replace(/%08/g, " ");
        v = v.replace(/ð/g, "đ");
        v = v.replace(/ {2,}/g, ' ');
        return '<SimpleText><![CDATA['+v+']]></SimpleText>'.trim();
    }).filter(function(v) {
        return v.length > 0;
    });
    var xml = '<?xml version="1.0" encoding="UTF-8"?>';
    xml += '<corpus xmlns="http://semweb.unister.de/xml-corpus-schema-2013"><Document>';
    xml += '<Link>' + document.location.href + '</Link>';
    var scat = [
        '.breadcrumb a:nth-child(1)',
        '.breadcrumb a:nth-child(1)',
        '.the-article-category a:nth-child(1)',
        '.bread-crumbs a:nth-child(1)'
    ];
    for(var i in scat) {
        var cnode = document.querySelector(scat[i]);
        if (cnode) {
            xml += '<Category>' + cnode.textContent.trim() + '</Category>';
            break;
        }
    }
    var stime = [
        '.header-content span.date',
        '.article__meta time',
        'li.the-article-publish',
        '.content-detail div.date-time'
    ];
    for (i in stime) {
        var cnode = document.querySelector(stime[i]);
        if (cnode) {
            xml += '<Publish>' + cnode.textContent.trim().replace(' | ',' ') + '</Publish>';
            break;
        }
    }
    xml += unique.join('');
    xml += '</Document></corpus>';
    var a = document.createElement('a');
    a.href = 'data:application/xml;charset=utf-8,' + encodeURIComponent(xml);
    a.target = '_blank';
    var file = document.location.href.split('/').pop();
    file = file.split('.').shift();
    a.download = file + '.xml';
    a.click();
})();
