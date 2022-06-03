'use strict';

const PUNCTUATION = [',','[',']','{','}',';',':','/','-','.','+','(',')','\'','"'];

exports.tokenize = function(str) {
    let web = new RegExp("(^(http[s]?://)?(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+$)","g");
    str = str.replace(web,function(m) {
        for (var i = 0; i < PUNCTUATION.length; i++) {
            var repl = 'TOKEN_' + i.toString();
            var tok = PUNCTUATION[i];
            var re = null;
            if ([',',';',':','\'','"'].indexOf(tok) == -1) {
                re = new RegExp('\\'+tok,'g');
            } else {
                re = new RegExp(tok,'g');
            }
            m = m.replace(re, repl);
        }
        return m;
    });
    str = str.replace(/([,\[\]\{\};:\/\-\.\+\(\)'"])/g,' $1 ');
    str = str.replace(/\.\.\./g,' ... ');
    str = str.replace(/\s+/, ' ').trim();
    str = str.replace(/ \. \. \. /g,' ... ');
    str = str.replace(/(tp\.\s+hcm)/ig, function(m) {
        return m.replace(/ /g,'');
    });
    str = str.replace(/(gmt\s+[\+\-]\s+[0-9]{1,})/ig, function(m) {
        return m.replace(/ /g,'');
    });
    str = str.replace(/(\d{2,}\s+\-\s+\d{3,}\s+\-\s+\d{3,})/g,function(m) {
        return m.replace(/ /g,'');
    })
    str = str.replace(/((0?[1-9]|1[0-9]|2[0-9]|3[0-1])\s+[\/\-\.]\s+(0?[1-9]|1[0-2])\s+[\/\-\.]\s+([1-9][0-9]{3}))/g, function(m) {
        return m.replace(/ /g,'');
    });
    str = str.replace(/(([1-9][0-9]{3})\s+[\/\-\.]\s+(0?[1-9]|1[0-2])\s+[\/\-\.]\s+(0?[1-9]|1[0-9]|2[0-9]|3[0-1]))/g, function(m) {
        return m.replace(/ /g,'');
    });
    str = str.replace(/((0?[1-9]|1[0-2])\s+[\/\-\.]\s+([1-9][0-9]{3}))/g, function(m) {
        return m.replace(/ /g,'');
    });
    str = str.replace(/(([1-9][0-9]{3})\s+[\/\-\.]\s+(0?[1-9]|1[0-2]))/g, function(m) {
        return m.replace(/ /g,'');
    });
    str = str.replace(/((0?[1-9]|1[0-9]|2[0-9]|3[0-1])\s+[\/\-\.]\s+(0?[1-9]|1[0-2]))/g, function(m) {
        return m.replace(/ /g,'');
    });
    str = str.replace(/((0?[0-9]|1[0-9]|2[0-3])\s+:\s+([0-5]?[0-9])\s+:\s+([0-5]?[0-9]))/g, function(m) {
        return m.replace(/ /g,'');
    });
    str = str.replace(/((0?[0-9]|1[0-9]|2[0-3])\s+:\s+([0-5]?[0-9]))/g, function(m) {
        return m.replace(/ /g,'');
    });
    str = str.replace(/((0?[1-9]|1[0-9]|2[0-9]|3[0-1])\s+[hg]\s+([0-5]?[0-9]))/g, function(m) {
        return m.replace(/ /g,'');
    });
    str = str.replace(/(th\s+\.\s+s)/ig, function(m) {
        return m.replace(/ /g,'');
    });
    str = str.replace(/([A-Za-z]\s+'\s+[A-Za-z])/ig, function(m) {
        return m.replace(/ /g,'');
    });
    str = str.replace(/([A-ZÀÁẢÃẠĂẰẮẲẴẶÂẦẤẨẪẬĐÈÉẺẼẸÊỀẾỂỄỆÌÍỈĨỊÒÓỎÕỌÔỒỐỔỖỘƠỜỚỞỠỢÙÚỦŨỤƯỪỨỬỮỰỲÝỶỸa-zàáảãạăằắẳẵặâầấẩẫậđèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹ]\s+\.\s+[A-ZÀÁẢÃẠĂẰẮẲẴẶÂẦẤẨẪẬĐÈÉẺẼẸÊỀẾỂỄỆÌÍỈĨỊÒÓỎÕỌÔỒỐỔỖỘƠỜỚỞỠỢÙÚỦŨỤƯỪỨỬỮỰỲÝỶỸa-zàáảãạăằắẳẵặâầấẩẫậđèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹ]\s+\.)/g, function(m) {
        return m.replace(/ /g,'');
    });
    str = str.replace(/([A-ZÀÁẢÃẠĂẰẮẲẴẶÂẦẤẨẪẬĐÈÉẺẼẸÊỀẾỂỄỆÌÍỈĨỊÒÓỎÕỌÔỒỐỔỖỘƠỜỚỞỠỢÙÚỦŨỤƯỪỨỬỮỰỲÝỶỸa-zàáảãạăằắẳẵặâầấẩẫậđèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹ]\s+\.)/g, function(m) {
        return m.replace(/ /g,'');
    });
    str = str.replace(/(\s+[0-9]{1,}\s+([hm]|km)\s+)/ig, function(m) {
        return ' ' + m.replace(/ /g,'') + ' ';
    });
    str = str.replace(/([A-Z0-9]+\s+\-\s+[A-Za-z0-9]+)/ig, function(m) {
        return m.replace(/ /g,'');
    });
    str = str.replace(/([0-9]{1,}\s+x\s+[0-9]{1,})/ig, function(m) {
        return m.replace(/ /g,'');
    });
    str = str.replace(/(pgs\s+[\-\.]\s+ts)/ig, function(m) {
        return m.replace(/ /g,'');
    });
    str = str.replace(/\s+((mr|mrs|ms|dr|ths|ts|gs)\s+\.\s+([A-ZÀÁẢÃẠĂẰẮẲẴẶÂẦẤẨẪẬĐÈÉẺẼẸÊỀẾỂỄỆÌÍỈĨỊÒÓỎÕỌÔỒỐỔỖỘƠỜỚỞỠỢÙÚỦŨỤƯỪỨỬỮỰỲÝỶỸa-zàáảãạăằắẳẵặâầấẩẫậđèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹ]+))/ig, function(m) {
        return ' ' + m.replace(/ /g,'');
    });
    for (var i = 0; i < PUNCTUATION.length; i++) {
        var search = 'TOKEN_' + i.toString();
        var tok = PUNCTUATION[i];
        var re = new RegExp(search,'g');
        str = str.replace(re, tok);
    }
    return str.split(/\s+/).map(function(v) {
        return v.trim();
    }).filter(function(v) {
        return v.length > 0;
    });
};