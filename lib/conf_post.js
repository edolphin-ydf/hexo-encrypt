
function Config(conf, data) {
	this.pwdfile = conf.pwdfile;
	this.password = conf.password;
	this.replace_img_url = conf.replace_img_url;
	this.base_url =  conf.base_url;
	this.qiniu_ak = conf.qiniu_ak;
	this.qiniu_sk = conf.qiniu_sk;
	this.img_url_ttl = conf.img_url_ttl;
	this.type = conf.type;
	this.template = conf.template;
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

	if (data.enc_template != undefined) {
		this.template = data.enc_template.toString();
	}

	if (this.template == undefined || this.template == '') {
		this.template = ' <input type="text" style="' +
                  'border-radius: 5px;' + 
                  'border-style: groove;' + 
                  'height: 30px;' + 
                  'width: 50%;' + 
                  'cursor: auto;' + 
                  'font-size: 102%;' + 
                  'color: currentColor;' + 
                  'outline: none;' + 
                  'text-overflow: initial;' + 
                  'padding-left: 5px;" onkeydown="if (event.keyCode == 13) { decrypt(); return false;}"> ' + 
              '<input type="submit" value="解&nbsp;密" onclick="decrypt()" style="' + 
                  'width: 58px;' + 
                  'height: 34px;' + 
                  'border-radius: 5px;' + 
                  'background-color: white;' + 
                  'border-style: solid;' + 
                  'color: currentColor;' + 
                  '">' + 
				  '<div id="enc_error" style="' + 
				  'display: inline-block;' +
				  'color: #d84527;' + 
				  'margin-left: 10px' +
				  '"></div>' +
              '<script>' + 
				'var onError = function(error) {' +
				'	$("#enc_error")[0].innerHTML = "password error!"' +
				'};' +
                'function decrypt() {' + 
                    'var passwd = $("#enc_passwd input")[0].value;' + 
                    'console.log(passwd);' + 
                    'doDecrypt(passwd, onError);' + 
                '}' + 
              '</script>';
	}
	
}

function createConfig(conf, data) {
	return new Config(conf, data);
}

exports.create = createConfig;

