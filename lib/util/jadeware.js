var compile = require("compile-middleware"),
	jade = require("jade"),
	path = require("path"),
	fs = require("fs");

function jadeware(opts) {
	var base_dir = opts.base_dir,
		vars = opts.vars || {};

	return compile({
		filename: function(req) {
			// console.info("Request ",req.url,req.method);

			var name = req.url;
			if (/\/$/.test(name)) {
				return name + "index";
			} else if (/\.html/.test(name)) {
				return name.replace(".html","");
			}
		},
		src_ext: ".jade",
		src: opts.src,
		render: function(source_path, cb, depend) {
			// console.info("Source loading", base_dir, source_path);

			var debug = opts.debug || false,
				namespace = opts.namespace || 'jade';

            fs.readFile(path.join(base_dir, source_path), 'utf8', function (err, str) {
                if(err) return cb(err);

                // FIXME hook fs.readFileSync to get dependency. Is it okay?
                var fs = require('fs');
                var _readFileSync = fs.readFileSync;
                fs.readFileSync = function (path) {
                    // Assume all file read during compilation is dependency
                    depend(path);
                    return _readFileSync.apply(this, arguments);
                };
                try {
                    var tmpl = jade.compile(str, {
                        filename: source_path,
                        compileDebug: debug,
                        client: true
                    });
                    if (typeof tmpl == 'function') {
                    	var txt = tmpl(vars);
                        return cb(null, txt);
                    } else {
                        throw new Error('Failed to compile');
                    }
                } catch (parseError) {
                    console.error('Parse error of',source_path,parseError.message,parseError.line,parseError.col);
                    return cb(parseError);
                } finally {
                    fs.readFileSync = _readFileSync;
                }
            });
		},
		headers: {
			// "Cache-Control"
			// "Content-Type"
		}
	});
}

module.exports = jadeware;