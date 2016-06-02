/* global hexo */
'use strict';

var CryptoJS = require("crypto-js");
var fs = require('hexo-fs');
var qiniu = require("qiniu");
var log = require('hexo-log')({
  debug: false,
  silent: false
});

function getPassword(data) {
	var pwdfilePath = hexo.base_dir + hexo.config.encrypt.pwdfile;
	var password = 'default_password';
	if (fs.existsSync(pwdfilePath)) {
		password = fs.readFileSync(pwdfilePath);
		password = password.replace(/\n/g, '');
	}
	if (password == 'default_password')
		password = hexo.config.encrypt.password.toString();

	// if the pwd is setted in post header, then use it
	if (data.enc_pwd != undefined) {
		password = data.enc_pwd.toString();
	}
	log.debug("password:" + password);
	return password;
}

function genUrl(url) {
	if (hexo.config.encrypt.qiniu_ak == undefined || hexo.config.encrypt.qiniu_ak == undefined) {
		log.warn("the qiniu ak or sk is incorrect, please check you _config.yml.\n" +
				"maybe you want this:\n" +
"encrypt:\n" +
  "\tqiniu_ak: your access key of qiniu\n" +
  "\tqiniu_sk: your secret key of qiniu\n");
		return url;
	}

	qiniu.conf.ACCESS_KEY = hexo.config.encrypt.qiniu_ak.toString();
	qiniu.conf.SECRET_KEY = hexo.config.encrypt.qiniu_sk.toString();
	var ttl = 3600;
	if (hexo.config.encrypt.img_url_ttl != undefined) {
		ttl = hexo.config.encrypt.img_url_ttl;
	}


	//构建私有空间的链接
	var policy = new qiniu.rs.GetPolicy(ttl);

	//生成下载链接url
	var downloadUrl = policy.makeRequest(url);

	//打印下载的url
	log.debug('downloadUrl:' + downloadUrl);

	return downloadUrl;
}

function replaceImgUrl(data) {
	var baseUrl = undefined;
	if (hexo.config.encrypt.base_url != undefined) {
		baseUrl = hexo.config.encrypt.base_url.toString();
	}
	data.content = data.content.replace(/<img [^>]*src=['"]([^'"]+)[^>]*>/gi,
      function (match, url) {
		var tmpurl = url;
		// the base url is configed and the current url is not a full url, then contact the both
		if (baseUrl != undefined && url.lastIndexOf("http://", 0) != 0) {
			tmpurl = baseUrl + tmpurl;	
		}
        return match.replace(url, genUrl(tmpurl));
      });
}

hexo.extend.filter.register('after_post_render', function(data){

	var replace = false;
	if (hexo.config.encrypt.replace_all_url == true) {
		replace = true;	
		log.debug("global replace, true");
	}

	// if the replace rule was set in the post, then use it
	if (data.enc_replace_url != undefined) {
		replace = data.enc_replace_url == true? true: false;
		log.debug("post replace, " + replace);
	}
	if (replace) {
		replaceImgUrl(data);
		log.debug("post pic url replaced");
	}

	// encrypt the content
	if (data.encrypt == true) {
		var password = getPassword(data);
		var ciphertext = CryptoJS.AES.encrypt(data.content, password);
		var txt = ciphertext.toString();
		data.content = '<div id="enc_content">' + txt + '</div>';
		data.content = data.content + '<script src="/js/crypto-js.js"></script>';
		data.content = data.content + '<script>'+
			'var pwd = window.prompt("please input password","");' + 
			'var txt = document.getElementById("enc_content").innerHTML;' +
			'var bytes  = CryptoJS.AES.decrypt(txt, pwd);' +
			'var plaintext = bytes.toString(CryptoJS.enc.Utf8);' +
			'document.getElementById("enc_content").innerHTML = plaintext' +
			'</script>';
		log.info(data.title + " encryped");
	} 
	return data;
});


// copy the encrypt js file
hexo.extend.filter.register('after_generate', function(){
	log.info("copy crypto-js.js to public/js/");
	fs.copyFile(hexo.base_dir + 'node_modules/hexo-encrypt/crypto-js.js', 
			hexo.base_dir + 'public/js/crypto-js.js');
});
