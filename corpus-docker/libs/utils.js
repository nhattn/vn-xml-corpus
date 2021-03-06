'use strict';

const getInnerText = function(e) {
    return e.textContent.replace(/ {2,}/g,' ').trim();
};
exports.getInnerText = getInnerText;
const getCharCount = function(e, s) {
    s = s || ',';
    return getInnerText(e).split(s).length;
};
exports.getCharCount = getCharCount;
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
exports.killDivs = killDivs;
const killBreaks = function(e) {
    e.innerHTML = e.innerHTML.replace(/(<br\s*\/?>(\s|&nbsp;?)*){1,}/g, '<br />');
    return e;
};
exports.killBreaks = killBreaks;
const killCodeSpans = function(e) {
    e.innerHTML = e.innerHTML.replace(/<\/?\s?span(?:[^>]+)?>/g, '');
    return e;
};
exports.killCodeSpans = killCodeSpans;
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
exports.clean = clean;
const vn_words = function(v) {
    v = v.replace(/???/g,'...');
    v = v.replace(/[??????]/g,'"');
    v = v.replace(/[??????]/g,"'");
    v = v.replace(/???/g,"-"),
    v = v.replace(//g," ");
    v = v.replace(/??/g,"??");
    v = v.replace(/ {2,}/g,' ');
    v = v.replace(/&agrave;/g,'??');
    v = v.replace(/&aacute;/g,'??');
    v = v.replace(/&atilde;/g,'??');
    v = v.replace(/&acirc;/g,'??');
    v = v.replace(/&egrave;/g,'??');
    v = v.replace(/&eacute;/g,'??');
    v = v.replace(/&ecirc;/g,'??');
    v = v.replace(/&igrave;/g,'??');
    v = v.replace(/&iacute;/g,'??');
    v = v.replace(/&ograve;/g,'??');
    v = v.replace(/&oacute;/g,'??');
    v = v.replace(/&otilde;/g,'??');
    v = v.replace(/&ocirc;/g,'??');
    v = v.replace(/&ugrave;/g,'??');
    v = v.replace(/&uacute;/g,'??');
    v = v.replace(/&yacute;/g,'??');
    v = v.replace(/&Agrave;/g,'??');
    v = v.replace(/&Aacute;/g,'??');
    v = v.replace(/&Atilde;/g,'??');
    v = v.replace(/&Acirc;/g,'??');
    v = v.replace(/&Egrave;/g,'??');
    v = v.replace(/&Eacute;/g,'??');
    v = v.replace(/&Ecirc;/g,'??');
    v = v.replace(/&Igrave;/g,'??');
    v = v.replace(/&Iacute;/g,'??');
    v = v.replace(/&Ograve;/g,'??');
    v = v.replace(/&Oacute;/g,'??');
    v = v.replace(/&Otilde;/g,'??');
    v = v.replace(/&Ocirc;/g,'??');
    v = v.replace(/&Ugrave;/g,'??');
    v = v.replace(/&Uacute;/g,'??');
    v = v.replace(/&Yacute;/g,'??');
    v = v.replace(/&ETH;/g,'??');
    v = v.replace(/&eth;/g,'??');
    v = v.replace(/&nbsp;/g,' ');
    v = v.replace(/&#91;/g,'[');
    v = v.replace(/&#93;/g,']');
    v = v.replace(/&#32;/g,' ');
    v = v.replace(/&#8220;/g,'"');
    v = v.replace(/&#8221;/g,'"');
    v = v.replace(/&#224;/g,'??');
    v = v.replace(/&#225;/g,'??');
    v = v.replace(/&#7841;/g,'???');
    v = v.replace(/&#7843;/g,'???');
    v = v.replace(/&#227;/g,'??');
    v = v.replace(/&#226;/g,'??');
    v = v.replace(/&#7847;/g,'???');
    v = v.replace(/&#7845;/g,'???');
    v = v.replace(/&#7853;/g,'???');
    v = v.replace(/&#7849;/g,'???');
    v = v.replace(/&#7851;/g,'???');
    v = v.replace(/&#259;/g,'??');
    v = v.replace(/&#7857;/g,'???');
    v = v.replace(/&#7855;/g,'???');
    v = v.replace(/&#7863;/g,'???');
    v = v.replace(/&#7859;/g,'???');
    v = v.replace(/&#7861;/g,'???');
    v = v.replace(/&#232;/g,'??');
    v = v.replace(/&#233;/g,'??');
    v = v.replace(/&#7865;/g,'???');
    v = v.replace(/&#7867;/g,'???');
    v = v.replace(/&#7869;/g,'???');
    v = v.replace(/&#234;/g,'??');
    v = v.replace(/&#7873;/g,'???');
    v = v.replace(/&#7871;/g,'???');
    v = v.replace(/&#7879;/g,'???');
    v = v.replace(/&#7875;/g,'???');
    v = v.replace(/&#7877;/g,'???');
    v = v.replace(/&#236;/g,'??');
    v = v.replace(/&#237;/g,'??');
    v = v.replace(/&#7883;/g,'???');
    v = v.replace(/&#7881;/g,'???');
    v = v.replace(/&#297;/g,'??');
    v = v.replace(/&#242;/g,'??');
    v = v.replace(/&#243;/g,'??');
    v = v.replace(/&#7885;/g,'???');
    v = v.replace(/&#7887;/g,'???');
    v = v.replace(/&#245;/g,'??');
    v = v.replace(/&#244;/g,'??');
    v = v.replace(/&#7891;/g,'???');
    v = v.replace(/&#7889;/g,'???');
    v = v.replace(/&#7897;/g,'???');
    v = v.replace(/&#7893;/g,'???');
    v = v.replace(/&#7895;/g,'???');
    v = v.replace(/&#417;/g,'??');
    v = v.replace(/&#7901;/g,'???');
    v = v.replace(/&#7899;/g,'???');
    v = v.replace(/&#7907;/g,'???');
    v = v.replace(/&#7903;/g,'???');
    v = v.replace(/&#7905;/g,'???');
    v = v.replace(/&#249;/g,'??');
    v = v.replace(/&#250;/g,'??');
    v = v.replace(/&#7909;/g,'???');
    v = v.replace(/&#7911;/g,'???');
    v = v.replace(/&#361;/g,'??');
    v = v.replace(/&#432;/g,'??');
    v = v.replace(/&#7915;/g,'???');
    v = v.replace(/&#7913;/g,'???');
    v = v.replace(/&#7921;/g,'???');
    v = v.replace(/&#7917;/g,'???');
    v = v.replace(/&#7919;/g,'???');
    v = v.replace(/&#7923;/g,'???');
    v = v.replace(/&#253;/g,'??');
    v = v.replace(/&#7925;/g,'???');
    v = v.replace(/&#7927;/g,'???');
    v = v.replace(/&#7929;/g,'???');
    v = v.replace(/&#273;/g,'??');
    v = v.replace(/&#192;/g,'??');
    v = v.replace(/&#193;/g,'??');
    v = v.replace(/&#7840;/g,'???');
    v = v.replace(/&#7842;/g,'???');
    v = v.replace(/&#195;/g,'??');
    v = v.replace(/&#194;/g,'??');
    v = v.replace(/&#7846;/g,'???');
    v = v.replace(/&#7844;/g,'???');
    v = v.replace(/&#7852;/g,'???');
    v = v.replace(/&#7848;/g,'???');
    v = v.replace(/&#7850;/g,'???');
    v = v.replace(/&#258;/g,'??');
    v = v.replace(/&#7856;/g,'???');
    v = v.replace(/&#7854;/g,'???');
    v = v.replace(/&#7862;/g,'???');
    v = v.replace(/&#7858;/g,'???');
    v = v.replace(/&#7860;/g,'???');
    v = v.replace(/&#200;/g,'??');
    v = v.replace(/&#201;/g,'??');
    v = v.replace(/&#7864;/g,'???');
    v = v.replace(/&#7866;/g,'???');
    v = v.replace(/&#7868;/g,'???');
    v = v.replace(/&#202;/g,'??');
    v = v.replace(/&#7872;/g,'???');
    v = v.replace(/&#7870;/g,'???');
    v = v.replace(/&#7878;/g,'???');
    v = v.replace(/&#7874;/g,'???');
    v = v.replace(/&#7876;/g,'???');
    v = v.replace(/&#204;/g,'??');
    v = v.replace(/&#205;/g,'??');
    v = v.replace(/&#7882;/g,'???');
    v = v.replace(/&#7880;/g,'???');
    v = v.replace(/&#296;/g,'??');
    v = v.replace(/&#210;/g,'??');
    v = v.replace(/&#211;/g,'??');
    v = v.replace(/&#7884;/g,'???');
    v = v.replace(/&#7886;/g,'???');
    v = v.replace(/&#213;/g,'??');
    v = v.replace(/&#212;/g,'??');
    v = v.replace(/&#7890;/g,'???');
    v = v.replace(/&#7888;/g,'???');
    v = v.replace(/&#7896;/g,'???');
    v = v.replace(/&#7892;/g,'???');
    v = v.replace(/&#7894;/g,'???');
    v = v.replace(/&#416;/g,'??');
    v = v.replace(/&#7900;/g,'???');
    v = v.replace(/&#7898;/g,'???');
    v = v.replace(/&#7906;/g,'???');
    v = v.replace(/&#7902;/g,'???');
    v = v.replace(/&#7904;/g,'???');
    v = v.replace(/&#217;/g,'??');
    v = v.replace(/&#218;/g,'??');
    v = v.replace(/&#7908;/g,'???');
    v = v.replace(/&#7910;/g,'???');
    v = v.replace(/&#360;/g,'??');
    v = v.replace(/&#431;/g,'??');
    v = v.replace(/&#7914;/g,'???');
    v = v.replace(/&#7912;/g,'???');
    v = v.replace(/&#7920;/g,'???');
    v = v.replace(/&#7916;/g,'???');
    v = v.replace(/&#7918;/g,'???');
    v = v.replace(/&#7922;/g,'???');
    v = v.replace(/&#221;/g,'??');
    v = v.replace(/&#7924;/g,'???');
    v = v.replace(/&#7926;/g,'???');
    v = v.replace(/&#7928;/g,'???');
    v = v.replace(/&#272;/g,'??');
    v = v.replace(/&#xE0;/g,'??');
    v = v.replace(/&#xE1;/g,'??');
    v = v.replace(/&#x1EA1;/g,'???');
    v = v.replace(/&#x1EA3;/g,'???');
    v = v.replace(/&#xE3;/g,'??');
    v = v.replace(/&#xE2;/g,'??');
    v = v.replace(/&#x1EA7;/g,'???');
    v = v.replace(/&#x1EA5;/g,'???');
    v = v.replace(/&#x1EAD;/g,'???');
    v = v.replace(/&#x1EA9;/g,'???');
    v = v.replace(/&#x1EAB;/g,'???');
    v = v.replace(/&#x103;/g,'??');
    v = v.replace(/&#x1EB1;/g,'???');
    v = v.replace(/&#x1EAF;/g,'???');
    v = v.replace(/&#x1EB7;/g,'???');
    v = v.replace(/&#x1EB3;/g,'???');
    v = v.replace(/&#x1EB5;/g,'???');
    v = v.replace(/&#xE8;/g,'??');
    v = v.replace(/&#xE9;/g,'??');
    v = v.replace(/&#x1EB9;/g,'???');
    v = v.replace(/&#x1EBB;/g,'???');
    v = v.replace(/&#x1EBD;/g,'???');
    v = v.replace(/&#xEA;/g,'??');
    v = v.replace(/&#x1EC1;/g,'???');
    v = v.replace(/&#x1EBF;/g,'???');
    v = v.replace(/&#x1EC7;/g,'???');
    v = v.replace(/&#x1EC3;/g,'???');
    v = v.replace(/&#x1EC5;/g,'???');
    v = v.replace(/&#xEC;/g,'??');
    v = v.replace(/&#xED;/g,'??');
    v = v.replace(/&#x1ECB;/g,'???');
    v = v.replace(/&#x1EC9;/g,'???');
    v = v.replace(/&#x129;/g,'??');
    v = v.replace(/&#xF2;/g,'??');
    v = v.replace(/&#xF3;/g,'??');
    v = v.replace(/&#x1ECD;/g,'???');
    v = v.replace(/&#x1ECF;/g,'???');
    v = v.replace(/&#xF5;/g,'??');
    v = v.replace(/&#xF4;/g,'??');
    v = v.replace(/&#x1ED3;/g,'???');
    v = v.replace(/&#x1ED1;/g,'???');
    v = v.replace(/&#x1ED9;/g,'???');
    v = v.replace(/&#x1ED5;/g,'???');
    v = v.replace(/&#x1ED7;/g,'???');
    v = v.replace(/&#x1A1;/g,'??');
    v = v.replace(/&#x1EDD;/g,'???');
    v = v.replace(/&#x1EDB;/g,'???');
    v = v.replace(/&#x1EE3;/g,'???');
    v = v.replace(/&#x1EDF;/g,'???');
    v = v.replace(/&#x1EE1;/g,'???');
    v = v.replace(/&#xF9;/g,'??');
    v = v.replace(/&#xFA;/g,'??');
    v = v.replace(/&#x1EE5;/g,'???');
    v = v.replace(/&#x1EE7;/g,'???');
    v = v.replace(/&#x169;/g,'??');
    v = v.replace(/&#x1B0;/g,'??');
    v = v.replace(/&#x1EEB;/g,'???');
    v = v.replace(/&#x1EE9;/g,'???');
    v = v.replace(/&#x1EF1;/g,'???');
    v = v.replace(/&#x1EED;/g,'???');
    v = v.replace(/&#x1EEF;/g,'???');
    v = v.replace(/&#x1EF3;/g,'???');
    v = v.replace(/&#xFD;/g,'??');
    v = v.replace(/&#x1EF5;/g,'???');
    v = v.replace(/&#x1EF7;/g,'???');
    v = v.replace(/&#x1EF9;/g,'???');
    v = v.replace(/&#x111;/g,'??');
    v = v.replace(/&#xC0;/g,'??');
    v = v.replace(/&#xC1;/g,'??');
    v = v.replace(/&#x1EA0;/g,'???');
    v = v.replace(/&#x1EA2;/g,'???');
    v = v.replace(/&#xC3;/g,'??');
    v = v.replace(/&#xC2;/g,'??');
    v = v.replace(/&#x1EA6;/g,'???');
    v = v.replace(/&#x1EA4;/g,'???');
    v = v.replace(/&#x1EAC;/g,'???');
    v = v.replace(/&#x1EA8;/g,'???');
    v = v.replace(/&#x1EAA;/g,'???');
    v = v.replace(/&#x102;/g,'??');
    v = v.replace(/&#x1EB0;/g,'???');
    v = v.replace(/&#x1EAE;/g,'???');
    v = v.replace(/&#x1EB6;/g,'???');
    v = v.replace(/&#x1EB2;/g,'???');
    v = v.replace(/&#x1EB4;/g,'???');
    v = v.replace(/&#xC8;/g,'??');
    v = v.replace(/&#xC9;/g,'??');
    v = v.replace(/&#x1EB8;/g,'???');
    v = v.replace(/&#x1EBA;/g,'???');
    v = v.replace(/&#x1EBC;/g,'???');
    v = v.replace(/&#xCA;/g,'??');
    v = v.replace(/&#x1EC0;/g,'???');
    v = v.replace(/&#x1EBE;/g,'???');
    v = v.replace(/&#x1EC6;/g,'???');
    v = v.replace(/&#x1EC2;/g,'???');
    v = v.replace(/&#x1EC4;/g,'???');
    v = v.replace(/&#xCC;/g,'??');
    v = v.replace(/&#xCD;/g,'??');
    v = v.replace(/&#x1ECA;/g,'???');
    v = v.replace(/&#x1EC8;/g,'???');
    v = v.replace(/&#x128;/g,'??');
    v = v.replace(/&#xD2;/g,'??');
    v = v.replace(/&#xD3;/g,'??');
    v = v.replace(/&#x1ECC;/g,'???');
    v = v.replace(/&#x1ECE;/g,'???');
    v = v.replace(/&#xD5;/g,'??');
    v = v.replace(/&#xD4;/g,'??');
    v = v.replace(/&#x1ED2;/g,'???');
    v = v.replace(/&#x1ED0;/g,'???');
    v = v.replace(/&#x1ED8;/g,'???');
    v = v.replace(/&#x1ED4;/g,'???');
    v = v.replace(/&#x1ED6;/g,'???');
    v = v.replace(/&#x1A0;/g,'??');
    v = v.replace(/&#x1EDC;/g,'???');
    v = v.replace(/&#x1EDA;/g,'???');
    v = v.replace(/&#x1EE2;/g,'???');
    v = v.replace(/&#x1EDE;/g,'???');
    v = v.replace(/&#x1EE0;/g,'???');
    v = v.replace(/&#xD9;/g,'??');
    v = v.replace(/&#xDA;/g,'??');
    v = v.replace(/&#x1EE4;/g,'???');
    v = v.replace(/&#x1EE6;/g,'???');
    v = v.replace(/&#x168;/g,'??');
    v = v.replace(/&#x1AF;/g,'??');
    v = v.replace(/&#x1EEA;/g,'???');
    v = v.replace(/&#x1EE8;/g,'???');
    v = v.replace(/&#x1EF0;/g,'???');
    v = v.replace(/&#x1EEC;/g,'???');
    v = v.replace(/&#x1EEE;/g,'???');
    v = v.replace(/&#x1EF2;/g,'???');
    v = v.replace(/&#xDD;/g,'??');
    v = v.replace(/&#x1EF4;/g,'???');
    v = v.replace(/&#x1EF6;/g,'???');
    v = v.replace(/&#x1EF8;/g,'???');
    v = v.replace(/&#x110;/g,'??');
    return v;
}
exports.vn_words = vn_words;
