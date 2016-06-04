
var qiniu = require('./url_gen_qiniu');
var base64 = require('./url_gen_base64');
var log = require('hexo-log')({
  debug: false,
  silent: false
});

var map = {
	"qiniu": qiniu,
	"base64": base64
};

function genUrl(data, conf) {
	if (map[conf.type] == undefined) {
		log.warn("unsupported type " + conf.type);
		return conf.realUrl;
	}
	log.debug("type:" + conf.type + " url:" + conf.realUrl);
	return map[conf.type].genUrl(data, conf);
}

exports.genUrl = genUrl;

