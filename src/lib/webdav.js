// A raw WebDAV interface
// Copyright (c) 2009 Aslak Hellesøy | MIT License
// https://github.com/aslakhellesoy/webdavjs

var WebDAV = {
	GET: function(url, callback) {
		return this.request('GET', url, {}, null, 'text', callback);
	},

	PROPFIND: function(url, callback) {
		return this.request('PROPFIND', url, {Depth: "1"}, null, 'xml', callback);
	},

	MKCOL: function(url, callback) {
		return this.request('MKCOL', url, {}, null, 'text', callback);
	},

	DELETE: function(url, callback) {
		return this.request('DELETE', url, {}, null, 'text', callback);
	},

	PUT: function(url, data, callback) {
		return this.request('PUT', url, {}, data, 'text', callback);
	},

	request: function(verb, url, headers, data, type, callback) {
		var xhr = new XMLHttpRequest();
		var body = function() {
			var b = xhr.responseText;
			if (type == 'xml') {
				var xml = xhr.responseXML;
				if(xml) {
					b = xml.firstChild.nextSibling ? xml.firstChild.nextSibling : xml.firstChild;
				}
			}
			return b;
		};

		if(callback) {
			xhr.onreadystatechange = function() {
				if(xhr.readyState == 4) { // complete.
					if(xhr.status >= 200 && xhr.status <= 299)
						callback(body(), xhr);
					else
						callback(null, xhr);
				}
			};
		}
		xhr.open(verb, url, !!callback);
		xhr.setRequestHeader("Content-Type", "text/xml; charset=UTF-8");
		for (var header in headers) {
			xhr.setRequestHeader(header, headers[header]);
		}
		xhr.send(data);

		if(!callback) {
			return body();
		}
	}
};

// An Object-oriented API around WebDAV.
WebDAV.Fs = function(rootUrl) {
	this.rootUrl = rootUrl;
	var fs = this;

	this.file = function(href) {
		this.type = 'file';

		this.url = fs.urlFor(href);

		this.name = fs.nameFor(this.url);

		this.read = function(callback) {
			return WebDAV.GET(this.url, callback);
		};

		this.write = function(data, callback) {
			return WebDAV.PUT(this.url, data, callback);
		};

		this.rm = function(callback) {
			return WebDAV.DELETE(this.url, callback);
		};

		return this;
	};

	this.dir = function(href) {
		this.type = 'dir';

		this.url = fs.urlFor(href);

		this.name = fs.nameFor(this.url);

		this.children = function(callback) {
			var childrenFunc = function(doc, dropPrefix) {
				if(doc.childNodes == null) {
					throw('No such directory: ' + url);
				}
				var prefix = (dropPrefix ? '' : 'D:');
				var result = [];
				// Start at 1, because the 0th is the same as self.
				for(var i=1; i< doc.childNodes.length; i++) {
					var response     = doc.childNodes[i];
					try {
						var href = response.getElementsByTagName(prefix + 'href')[0].firstChild.nodeValue;
					} catch(ex) {
						if(!dropPrefix)
							return childrenFunc(doc, true);
					}
					href = href.replace(/\/$/, ''); // Strip trailing slash
					var propstat     = response.getElementsByTagName(prefix + 'propstat')[0];
					var prop         = propstat.getElementsByTagName(prefix + 'prop')[0];
					var resourcetype = prop.getElementsByTagName(prefix + 'resourcetype')[0];
					var collection   = resourcetype.getElementsByTagName(prefix + 'collection')[0];

					if(collection) {
						result[i-1] = new fs.dir(href);
					} else {
						result[i-1] = new fs.file(href);
					}
				}
				return result;
			};

			if(callback) {
				WebDAV.PROPFIND(this.url, function(doc) {
					callback(childrenFunc(doc));
				});
			} else {
				return childrenFunc(WebDAV.PROPFIND(this.url));
			}
		};

		this.rm = function(callback) {
			return WebDAV.DELETE(this.url, callback);
		};

		this.mkdir = function(callback) {
			return WebDAV.MKCOL(this.url, callback);
		};

		return this;
	};

	this.urlFor = function(href) {
		return (/^http/.test(href) ? href : this.rootUrl + href);
	};

	this.nameFor = function(url) {
		return url.replace(/.*\/(.*)/, '$1');
	};

	return this;
};

export default WebDAV;