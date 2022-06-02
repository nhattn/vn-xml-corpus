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
function Trie() {
    this.next = {};
    this.is_word = false;
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
Trie.prototype.add = function(word) {
    var tokens = word.split(/\s+/).map(function(v) {
        return v.trim();
    }).filter(function(v) {
        return v.length > 0;
    });
    var tmp = this;
    for (let i in tokens) {
        let token = tokens[i];
        if (PUNCTUATION.indexOf(token) != -1) {
            tmp.is_word = true;
            continue;
        }
        let hash = token.hashCode().toString();
        if(tmp.next[hash] === undefined) {
            tmp.next[hash] = new Trie();
        }
        tmp = tmp.next[hash];
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
            let depth = Math.max(1, this.trail(tokens.slice(j));
            words.push(tokens.slice(j, j + depth).join(" "));
            j += depth;
        }
    }
    return words;
};
