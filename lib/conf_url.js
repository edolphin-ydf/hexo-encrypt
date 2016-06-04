
function Config(conf, url) {
	this.url = url;
	this.pwdfile = conf.pwdfile;
	this.password = conf.password;
	this.replace_img_url = conf.replace_img_url;
	this.base_url =  conf.base_url;
	this.qiniu_ak = conf.qiniu_ak;
	this.qiniu_sk = conf.qiniu_sk;
	this.img_url_ttl = conf.img_url_ttl;
	this.type = conf.type;
	this.encrypt = conf.encrypt;

	// type
	var qiniuProtocal = "qiniu://";
	var base64Protocal = "base64://";
	if (url.lastIndexOf(qiniuProtocal, 0) == 0) {
		url = url.substr(url.lastIndexOf(qiniuProtocal, 0) + qiniuProtocal.length, url.length);
		this.type = "qiniu";
	} else if (url.lastIndexOf(base64Protocal, 0) == 0) {
		url = url.substr(url.lastIndexOf(base64Protocal, 0) +  base64Protocal.length, url.length);
		this.type = "base64";
	}

	// url
	// the base url is configed and the current url is not a full url and
	// the encode img url type is qiniu,  then contact the both
	this.realUrl = url;	
	if (this.realUrl.lastIndexOf("http://", 0) != 0	
			&& this.type == 'qiniu') {
		this.realUrl = this.base_url + this.realUrl;	
	}

	//console.log("url type:", this.type);
	//console.log(this.url + " real:" + this.realUrl);
}

function createConfig(conf, url) {
	return new Config(conf, url);
}

exports.create = createConfig;
