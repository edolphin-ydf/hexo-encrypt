
var qiniu = require("qiniu");
var log = require('hexo-log')({
  debug: false,
  silent: false
});

function genUrl(data, conf) {
	if (conf.qiniu_ak == undefined || conf.qiniu_ak == undefined) {
		log.warn("the qiniu ak or sk is incorrect, please check you _config.yml.\n" +
				"maybe you want this:\n" +
"encrypt:\n" +
  "\tqiniu_ak: your access key of qiniu\n" +
  "\tqiniu_sk: your secret key of qiniu\n");
		return conf.realUrl;
	}

	qiniu.conf.ACCESS_KEY = conf.qiniu_ak;
	qiniu.conf.SECRET_KEY = conf.qiniu_sk;

	//构建私有空间的链接
	var policy = new qiniu.rs.GetPolicy(conf.img_url_ttl);

	log.debug(conf.realUrl);
	//生成下载链接url
	var downloadUrl = policy.makeRequest(conf.realUrl);

	//打印下载的url
	log.debug('downloadUrl:' + downloadUrl);

	return downloadUrl;
}

exports.genUrl = genUrl;

