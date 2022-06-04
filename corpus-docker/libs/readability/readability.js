var jsdom = require('jsdom');
var zlib = require('zlib');
var helpers = require('./helpers');
var encodinglib = require("encoding");
var urllib = require('url');

function Readability(window, options) {
  this._window = window;
  this._document = window.document;
  this.iframeLoads = 0;
  // Cache the body HTML in case we need to re-use it later
  this.bodyCache = null;
  this._articleContent = '';
  helpers.setCleanRules(options.cleanRulers || []);

  this.cache = {};

  helpers.prepDocument(this._document);
  this.cache = {
    'body': this._document.body.innerHTML
  };

  this.__defineGetter__('content', function() {
    return this.getContent();
  });
  this.__defineGetter__('title', function() {
    return this.getTitle();
  });
  this.__defineGetter__('textBody', function() {
    return this.getTextBody();
  });
  this.__defineGetter__('html', function() {
    return this.getHTML();
  });
  this.__defineGetter__('document', function() {
    return this.getDocument();
  });
}

Readability.prototype.close = function() {
  if (this._window) {
    this._window.close();
  }
  this._window = null;
  this._document = null;
};

Readability.prototype.getContent = function() {
  if (typeof this.cache['article-content'] !== 'undefined') {
    return this.cache['article-content'];
  }

  var articleContent = helpers.grabArticle(this._document);
  if (helpers.getInnerText(articleContent, false) === '') {
    this._document.body.innerHTML = this.cache.body;
    articleContent = helpers.grabArticle(this._document, true);
    if (helpers.getInnerText(articleContent, false) === '') {
      return this.cache['article-content'] = false;
    }
  }

  return this.cache['article-content'] = articleContent.innerHTML;
};

Readability.prototype.getTitle = function() {
  if (typeof this.cache['article-title'] !== 'undefined') {
    return this.cache['article-title'];
  }

  var title = _findMetaTitle(this._document) || this._document.title;
  var betterTitle;
  var commonSeparatingCharacters = [' | ', ' _ ', ' - ', '«', '»', '—'];

  var self = this;
  commonSeparatingCharacters.forEach(function(char) {
    var tmpArray = title.split(char);
    if (tmpArray.length > 1) {
      if (betterTitle) return self.cache['article-title'] = title;
      betterTitle = tmpArray[0].trim();
    }
  });

  if (betterTitle && betterTitle.length > 10) {
    return this.cache['article-title'] = betterTitle;
  }

  return this.cache['article-title'] = title;
};

Readability.prototype.getTextBody = function() {
  if (typeof this.cache['article-text-body'] !== 'undefined') {
    return this.cache['article-text-body'];
  }

  var articleContent = helpers.grabArticle(this._document);
  var rootElement = articleContent.childNodes[0];
  var textBody = '';
  if (rootElement) {
    var textElements = rootElement.childNodes;
    for (var i = 0; i < textElements.length; i++) {
      var el = textElements[i];
      var text = helpers.getInnerText(el);
      if (!text) continue;
      textBody += text;
      if ((i + 1) < textElements.length) textBody += '\n';
    }
  }

  return this.cache['article-text-body'] = textBody;
}

Readability.prototype.getDocument = function() {
  return this._document;
};

Readability.prototype.getHTML = function() {
  return this._document.getElementsByTagName('html')[0].innerHTML;
};

function _findMetaTitle(document) {
  var metaTags = document.getElementsByTagName('meta');
  var tag;

  for(var i = 0; i < metaTags.length; i++) {
    tag = metaTags[i];

    if(tag.getAttribute('property') === 'og:title' || tag.getAttribute('name') === 'twitter:title'){
      return tag.getAttribute('content');
    }
  }
  return null;
}

function _findHTMLCharset(htmlbuffer) {

  var body = htmlbuffer.toString("ascii"),
    input, meta, charset;

  if (meta = body.match(/<meta\s+http-equiv=["']content-type["'][^>]*?>/i)) {
    input = meta[0];
  }

  if (input) {
    charset = input.match(/charset\s?=\s?([a-zA-Z\-0-9]*);?/);
    if (charset) {
      charset = (charset[1] || "").trim().toLowerCase();
    }
  }

  if (!charset && (meta = body.match(/<meta\s+charset=["'](.*?)["']/i))) {
    charset = (meta[1] || "").trim().toLowerCase();
  }

  return charset;
}

function _parseContentType(str) {
  if (!str) {
    return {};
  }
  var parts = str.split(";"),
    mimeType = parts.shift(),
    charset, chparts;

  for (var i = 0, len = parts.length; i < len; i++) {
    chparts = parts[i].split("=");
    if (chparts.length > 1) {
      if (chparts[0].trim().toLowerCase() == "charset") {
        charset = chparts[1];
      }
    }
  }

  return {
    mimeType: (mimeType || "").trim().toLowerCase(),
    charset: (charset || "UTF-8").trim().toLowerCase() // defaults to UTF-8
  };
}

function read(html, options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }

  var overrideEncoding = options.encoding,
      preprocess = options.preprocess;

  options.encoding = null;
  delete options.preprocess;

  var parsedURL = urllib.parse(html);
  if (['http:', 'https:', 'unix:', 'ftp:', 'sftp:'].indexOf(parsedURL.protocol) === -1) {
    jsdomParse(null, null, html);
  } else {
    var engine = require("http");
    if (/^https:\/\//i.test(html) == true) {
      engine = require("https");
    }
    var keepAliveMsecs = 1500;
    options.agent = new engine.Agent({
      keepAlive: true,
      keepAliveMsecs: keepAliveMsecs
    });
    options.method = 'GET';
    if (options.headers === undefined) {
      options.headers = {
        "accept-charset" : "ISO-8859-1,utf-8;q=0.7,*;q=0.3",
        "accept-language" : "en-US,en;q=0.8",
        "accept" : "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "user-agent" : "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_6_8) AppleWebKit/537.13+ (KHTML, like Gecko) Version/5.1.7 Safari/534.57.2",
        "accept-encoding" : "gzip,deflate"
      };
    }
    engine.request(html, options, function(res) {
      var chunks = [];
      res.on("data", function(chunk) {
        chunks.push(chunk);
      });
      res.on("end", function() {
        var buff = Buffer.concat(chunks);
        var encoding = res.headers['content-encoding'];
        var decodeF = function(err, buffer) {
          if (err) {
            return callback(err);
          }
          var content_type = _parseContentType(res.headers['content-type']);
          if (content_type.mimeType == "text/html") {
            content_type.charset = _findHTMLCharset(buffer) || content_type.charset;
          }
          content_type.charset = (overrideEncoding || content_type.charset || "utf-8").trim().toLowerCase();
          if (!content_type.charset.match(/^utf-?8$/i)) {
            buffer = encodinglib.convert(buffer, "UTF-8", content_type.charset);
          }
          buffer = buffer.toString();
          /* hoi ngo ngan xiu ma duoc viec */
          res.request = {
            uri: {
              href:html
            }
          };
          if (preprocess) {
            preprocess(buffer, res, content_type, function(err, buffer) {
              if (err) return callback(err);
              jsdomParse(null, res, buffer);
            });
          } else {
            jsdomParse(null, res, buffer);
          }
        };
        if (encoding == 'gzip') {
          zlib.gunzip(buff, decodeF);
        } else if (encoding == 'deflate') {
          zlib.inflate(buff, decodeF);
        } else {
          decodeF(null, buff);
        }
      });
    }).on("error", function(error) {
      return callback(error);
    }).end();
  }

  function jsdomParse(error, meta, body) {
    if (error) {
      return callback(error);
    }

    if (typeof body !== 'string') body = body.toString();
    if (!body) return callback(new Error('Empty story body returned from URL'));
    jsdom.env({
      html: body,
      done: function(errors, window) {
        if (meta) {
          window.document.originalURL = meta.request.uri.href;
        } else {
          window.document.originalURL = null;
        }

        if (errors) {
          window.close();
          return callback(errors);
        }
        if (!window.document.body) {
          window.close();
          return callback(new Error('No body tag was found.'));
        }

        try {
          var readability = new Readability(window, options);

          // add meta information to callback
          callback(null, readability, meta);
        } catch (ex) {
          window.close();
          return callback(ex);

        }
      }
    });
  }
}
module.exports = read;
module.exports.read = function() {
  return read.apply(this, arguments);
};
