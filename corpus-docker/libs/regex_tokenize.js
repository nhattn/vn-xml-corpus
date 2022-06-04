'use strict';

const PUNCTUATION = [',','[',']','{','}',';',':','/','-','.','+','(',')','\'','"'];

exports.tokenize = function(str) {
    str = (' ' + str + ' ').replace(/\s+/, ' ');
    str = str.replace(/(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig, function(m) {
        return 'DOMAIN'
    });
    console.log(str)
    str = str.replace(/(\b[a-zA-Z0-9.]+\.[a-zA-Z]{2,4}$)/ig, function(m) {
        return 'DOMAIN1'
    });
    str = str.replace(/([a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+)/ig, function(m) {
        return 'EMAIL'
    });
    // tach ky tu dac biet ra
    str = str.replace(/([,\[\]\{\};:\/\-\.\+\(\)'"])/g,' $1 ');
    str = str.replace(/\.\.\./g,' ... ');
    str = str.replace(/\s+/, ' ').trim();
    str = str.replace(/ \. \. \. /g,' ... ');
    // tp . hcm -> tp.hcm
    str = str.replace(/(tp\s+\.\s+(bmt|hcm))/ig, function(m) {
        return m.replace(/ /g,'');
    });
    // gmt + 7/gmt + 007 -> gtm+7/gmt+007
    str = str.replace(/(gmt\s+[\+\-]\s+[0-9]{1,})/ig, function(m) {
        return m.replace(/ /g,'');
    });
    // so dien thoai
    str = str.replace(/(\d{2,}\s+\-\s+\d{3,}\s+\-\s+\d{3,})/g,function(m) {
        return m.replace(/ /g,'');
    });
    // ngay thang nam
    str = str.replace(/((0?[1-9]|1[0-9]|2[0-9]|3[0-1])\s+[\/\-\.]\s+(0?[1-9]|1[0-2])\s+[\/\-\.]\s+([1-9][0-9]{3}))/g, function(m) {
        return m.replace(/ /g,'');
    });
    // nam thang ngay
    str = str.replace(/(([1-9][0-9]{3})\s+[\/\-\.]\s+(0?[1-9]|1[0-2])\s+[\/\-\.]\s+(0?[1-9]|1[0-9]|2[0-9]|3[0-1]))/g, function(m) {
        return m.replace(/ /g,'');
    });
    // thang nam
    str = str.replace(/((0?[1-9]|1[0-2])\s+[\/\-\.]\s+([1-9][0-9]{3}))/g, function(m) {
        return m.replace(/ /g,'');
    });
    // nam thang
    str = str.replace(/(([1-9][0-9]{3})\s+[\/\-\.]\s+(0?[1-9]|1[0-2]))/g, function(m) {
        return m.replace(/ /g,'');
    });
    // ngay thang
    str = str.replace(/((0?[1-9]|1[0-9]|2[0-9]|3[0-1])\s+[\/\-\.]\s+(0?[1-9]|1[0-2]))/g, function(m) {
        return m.replace(/ /g,'');
    });
    // gio phut giay
    str = str.replace(/((0?[0-9]|1[0-9]|2[0-3])\s+:\s+([0-5]?[0-9])\s+:\s+([0-5]?[0-9]))/g, function(m) {
        return m.replace(/ /g,'');
    });
    // gio phut
    str = str.replace(/((0?[0-9]|1[0-9]|2[0-3])\s+:\s+([0-5]?[0-9]))/g, function(m) {
        return m.replace(/ /g,'');
    });
    // phut giay
    str = str.replace(/(([0-5]?[0-9])\s+:\s+([0-5]?[0-9]))/g, function(m) {
        return m.replace(/ /g,'');
    });
    // 10 h 30, 10 g 30
    str = str.replace(/((0?[1-9]|1[0-9]|2[0-9]|3[0-1])\s+[hg]\s+([0-5]?[0-9]))/g, function(m) {
        return m.replace(/ /g,'');
    });
    // th . s thac sy
    str = str.replace(/(th\s+\.\s+s)/ig, function(m) {
        return m.replace(/ /g,'');
    });
    // ten dia phuong dan toc hoac ten nguoi dan toc
    str = str.replace(/([A-Za-z]\s+'\s+[A-Za-z])/ig, function(m) {
        return m.replace(/ /g,'');
    });
    // ten viet tat P.
    str = str.replace(/([A-ZÀÁẢÃẠĂẰẮẲẴẶÂẦẤẨẪẬĐÈÉẺẼẸÊỀẾỂỄỆÌÍỈĨỊÒÓỎÕỌÔỒỐỔỖỘƠỜỚỞỠỢÙÚỦŨỤƯỪỨỬỮỰỲÝỶỸa-zàáảãạăằắẳẵặâầấẩẫậđèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹ]\s+\.\s+[A-ZÀÁẢÃẠĂẰẮẲẴẶÂẦẤẨẪẬĐÈÉẺẼẸÊỀẾỂỄỆÌÍỈĨỊÒÓỎÕỌÔỒỐỔỖỘƠỜỚỞỠỢÙÚỦŨỤƯỪỨỬỮỰỲÝỶỸa-zàáảãạăằắẳẵặâầấẩẫậđèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹ]\s+\.)/g, function(m) {
        return m.replace(/ /g,'');
    });
    // ten viet tat p./P.
    str = str.replace(/([A-ZÀÁẢÃẠĂẰẮẲẴẶÂẦẤẨẪẬĐÈÉẺẼẸÊỀẾỂỄỆÌÍỈĨỊÒÓỎÕỌÔỒỐỔỖỘƠỜỚỞỠỢÙÚỦŨỤƯỪỨỬỮỰỲÝỶỸa-zàáảãạăằắẳẵặâầấẩẫậđèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹ]\s+\.)/g, function(m) {
        return m.replace(/ /g,'');
    });
    // 1 h, 1 m, 1 km
    str = str.replace(/(\s+[0-9]{1,}\s+([hm]|km)\s+)/ig, function(m) {
        return ' ' + m.replace(/ /g,'') + ' ';
    });
    // covid-19
    str = str.replace(/([A-Z0-9]+\s+\-\s+[A-Za-z0-9]+)/ig, function(m) {
        return m.replace(/ /g,'');
    });
    // 3x4, 4x6
    str = str.replace(/([0-9]{1,}\s+x\s+[0-9]{1,})/ig, function(m) {
        return m.replace(/ /g,'');
    });
    // pgs . ts
    str = str.replace(/(pgs\s+[\-\.]\s+ts)/ig, function(m) {
        return m.replace(/ /g,'');
    });
    // mr ., mrs ., ths .
    str = str.replace(/\s+((mr|mrs|ms|dr|ths|ts|gs)\s+\.\s+([A-ZÀÁẢÃẠĂẰẮẲẴẶÂẦẤẨẪẬĐÈÉẺẼẸÊỀẾỂỄỆÌÍỈĨỊÒÓỎÕỌÔỒỐỔỖỘƠỜỚỞỠỢÙÚỦŨỤƯỪỨỬỮỰỲÝỶỸa-zàáảãạăằắẳẵặâầấẩẫậđèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹ]+))/ig, function(m) {
        return ' ' + m.replace(/ /g,'');
    });
    str = str.replace(/\d+[A-Z]+\d*-\d+/g, function(m) {
        return ' ' + m.replace(/ /g,'');
    });
    return str.split(/\s+/).map(function(v) {
        return v.trim();
    }).filter(function(v) {
        return v.length > 0;
    });
};
