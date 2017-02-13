
var fs = require('fs');

function initPassword(conf, basedir) {
	if (conf.password != undefined && conf.password != "") {
		return;
	}

	var password = 'default_password';
	if (conf.pwdfile != undefined) {
		var pwdfilePath = basedir + conf.pwdfile;
		if (fs.existsSync(pwdfilePath)) {
			password = fs.readFileSync(pwdfilePath).toString();
			password = password.replace(/\n/g, '');
		}
	}

	conf.password = password;
}

function toString(o) {
	return o == undefined? "" : o.toString();
}

function Config(conf, basedir) {
	if (conf == undefined) {
		return;
	}
	this.pwdfile = toString(conf.pwdfile);
	this.password = toString(conf.password);
	this.replace_img_url = conf.replace_all_url;
	this.base_url =  toString(conf.base_url);
	this.qiniu_ak = toString(conf.qiniu_ak);
	this.qiniu_sk = toString(conf.qiniu_sk);
	this.img_url_ttl = conf.img_url_ttl;
	this.type = toString(conf.type);
	this.template = toString(conf.template);

	initPassword(this, basedir);
}

function createConfig(conf, basedir) {
	return new Config(conf, basedir);
}

module.exports = createConfig;


