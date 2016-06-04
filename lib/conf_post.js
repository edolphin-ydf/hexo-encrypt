
function Config(conf, data) {
	this.pwdfile = conf.pwdfile;
	this.password = conf.password;
	this.replace_img_url = conf.replace_img_url;
	this.base_url =  conf.base_url;
	this.qiniu_ak = conf.qiniu_ak;
	this.qiniu_sk = conf.qiniu_sk;
	this.img_url_ttl = conf.img_url_ttl;
	this.type = conf.type;
	this.encrypt = data.encrypt;

	if (data.enc_pwd != undefined) {
		this.password = data.enc_pwd.toString();	
	}

	if (data.enc_replace_url != undefined) {
		this.replace_img_url = data.enc_replace_url == true? true : false;	
	}

	if (data.enc_img_type != undefined) {
		this.type = data.enc_img_type.toString();
	}
	
}

function createConfig(conf, data) {
	return new Config(conf, data);
}

exports.create = createConfig;

