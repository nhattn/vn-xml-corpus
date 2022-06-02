var fs = require('fs');

String.prototype.hashCode = function(){
    var hash = 0;
    for (var i = 0; i < this.length; i++) {
        var code = this.charCodeAt(i);
        hash = ((hash << 5) - hash) + code | 0;
        hash = hash & hash;
    }
    return hash >>> 0;
};
String.prototype.isupper = function() {
    if (this.length == 0) return false;
    if (this.toUpperCase() == this) {
        return true;
    }
    return false;
};
const PUNCTUATION = "!\"#$%&'()*+,-./:;<=>?@[\]^_`{|}~";
// trường học -> trường/N học/V trường_học/N
//
// Mỗi từ đơn đều có tính chất của nó và tính chất này đa trị 'đậu' (động từ)
// 'đậu' (danh từ) chúng ta lưu mảng và khi lấy phải dùng luật.
function Trie() {
    this.next = {};
    this.is_word = false;
    this.tag = [];
    this.value = '';
}
Trie.prototype.getTag = function() {
    return this.tag;
}
Trie.prototype.find = function(word) {
    var tokens = word.split(/\s+/).map(function(v) {
        return v.trim();
    }).filter(function(v) {
        return v.length > 0;
    });
    var tmp = this;
    for (let i in tokens) {
        let token = tokens[i];
        let hash = token.hashCode().toString();
        if(tmp.next[hash] === undefined) {
            return false;
        }
        tmp = tmp.next[hash];
    }
    return tmp.is_word;
};
Trie.prototype.get = function(word) {
    var tokens = word.split(/\s+/).map(function(v) {
        return v.trim();
    }).filter(function(v) {
        return v.length > 0;
    });
    var tmp = this;
    for (let i in tokens) {
        let token = tokens[i];
        let hash = token.hashCode().toString();
        if(tmp.next[hash] === undefined) {
            return null;
        }
        tmp = tmp.next[hash];
    }
    return tmp;
};
Trie.prototype.add = function(word) {
    var tokens = word.split(/\s+/).map(function(v) {
        return v.trim();
    }).filter(function(v) {
        return v.length > 0;
    });
    var tmp = this;
    for (let i in tokens) {
        let token = tokens[i];
        // nhà em nuôi chó bẹc-giê sao anh dám tới -> bẹc-giê (hai từ không liên quan)
        // quay vô-lăng hết cỡ trả lại đúng một vòng thì sẽ trả bánh về đúng chỗ -> ??
        if (PUNCTUATION.indexOf(token) != -1) {
            if (token != '-') {
                tmp.is_word = true;
                continue;
            }
        }
        let hash = token.hashCode().toString();
        if(tmp.next[hash] === undefined) {
            tmp.next[hash] = new Trie();
        }
        tmp = tmp.next[hash];
        if (token.indexOf('/') != -1) {
            // đi/V, học/V, về/P
            var tmp = token.split('/');
            var tag = tmp.pop();
            var word = tmp.join('/');
            tmp.value = word;
            tmp.tag.push(tag);
        } else {
            tmp.value = token;
            tmp.tag.push('X');
        }
    }
    tmp.is_word = true;
};
Trie.prototype.trail = function() {
    let depth = 0;
    let max_depth = depth;
    let tmp = this;
    for (let i in tokens) {
        let token = tokens[i];
        let hash = token.hashCode().toString();
        if(tmp.next[hash] === undefined) {
            return max_depth;
        }
        tmp = tmp.next[hash];
        depth++;
        max_depth = tmp.is_word ? depth : max_depth;
    }
    return max_depth;
};
Trie.prototype.extract = function(str) {
    let sentences = str.split(/[\!\.\?,]+/).map(function(v) {
        return v.trim();
    }).filter(function(v) {
        return v.length > 0;
    });
    let words = [];
    for (let i in sentences) {
        let tokens = sentences[i].split(/\s+/).map(function(v) {
            return v.trim();
        }).filter(function(v) {
            return v.length > 0;
        });
        if (tokens.length == 0) {
            continue;
        }
        let j = 0;
        while (j < tokens.length) {
            let tmp = j;
            while (tmp < tokens.length && tokens[tmp].chatAt(0).isupper()) {
                tmp++;
            }
            if (tmp != j) {
                words.push(tokens.slice(j, tmp).join(" "));
            }
            j = tmp;
            if (j == tokens.length) {
                break;
            }
            let depth = Math.max(1, this.trail(tokens.slice(j)));
            words.push(tokens.slice(j, j + depth).join(" "));
            j += depth;
        }
    }
    return words;
};
exports.load = function(filepath) {
    var kernel = new Trie();
    try {
        var data = fs.readFileSync(filepath, 'utf8');
        var lines = data.toString().split(/[\r\n]/).map(function(v) {
            return v.replace(/ {2,}/g,' ').trim();
        }).filter(function(v) {
            return v.length > 0;
        });
        for (var i in lines) {
            kernel.add(lines[i]);
        }
    } catch(e) {}
    return kernel;
};
