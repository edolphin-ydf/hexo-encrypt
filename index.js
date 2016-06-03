/* global hexo */
'use strict';

/*
 * # the base rule
 * configs for this plugin in _config.yml are all in encrypt: scope
 * eg: 
 * encrypt:
 * 		pwdfile: xxx
 * 		type: xxx
 *
 * # rule for encrypt content
 * ## config whether encrypt a content
 * in post header
 * 	encrypt: true
 *
 * ## config the password
 * - store the password in a file, config as pwdfile: finename
 * - config the password in _config.yml directly, password: passwd
 * - config the password for one post,  enc_pwd: 123456
 *
 * # rule for generate img url
 *
 * ## first and foremost you should open the switch
 * 		you could config replace_all_url: true in _config.yml
 * 		or config enc_replace_url: true in post which need encode(replace) the url
 *
 * ## for now, the generator support qiniu which the img stored in qiniu cloud and base64 which
 * encode the img to base64 and make it inline in html
 *
 * - in _config.yml, config type
 * - or in post header, config enc_img_type
 * - or in ![](type://), make the url start with type://
 *
 * the value of type could be `qiniu` or `base64` only
 * 
 * ## the priority is:
 * ![](type://) > post header > _config.yml
 *
 *
 * if you never config the type in anywhere, then qiniu is default
 *
 * ## base64:
 * the url rule:(or you can call it path)
 * the path support three types:
 * ~/, / and ./
 * the ~/ will be replaced to / type
 * the ./ will be replaced to / type with base_dir which is the post asset path(data.asset_dir)
 *
 * ## qiniu:
 *
 * ### key
 * the qiniu need access key and secrect key first.
 * then config it as qiniu_ak: qiniu_sk: in _config.yml
 * - you can also config a ttl in seconds for the generated img url, which default value is 1 hour
 *  	this means if you don't config it, the img which stored in qiuniu  will not be available after
 *  	one hour later.
 *
 * ### base_url rule:
 * the base_url is only support for qiniu
 * so, if the url encode type is qiniu and url is not a full path
 * then connect the base_url and the url
 * otherwise ignore the base_url
 *
 */

var CryptoJS = require("crypto-js");
var hexofs = require('hexo-fs');
var fs = require('fs');
var qiniu = require("qiniu");
var log = require('hexo-log')({
  debug: false,
  silent: false
});

function getPassword(data) {
	var pwdfilePath = hexo.base_dir + hexo.config.encrypt.pwdfile;
	var password = 'default_password';
	if (fs.existsSync(pwdfilePath)) {
		password = fs.readFileSync(pwdfilePath).toString();
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

function genQiniuUrl(data, url) {
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

function determineFullFilePath(basedir, path) {
	// if the path is full path, return it
	if (path.lastIndexOf("/", 0) == 0) {
		return path;	
	}

	// replace ~/ to /
	if (path.lastIndexOf("~/", 0) == 0) {
		return process.env.HOME + path.substr(1, path.length);
	}

	// replace ./ to /
	var res = path;
	if (path.lastIndexOf("./", 0) == 0) {
		res = basedir + path.substring(2, path.length);
	} else {
		res = basedir + path;	
	}
	return res;
}

function getFileExt(path) {
	var dotPos = path.lastIndexOf(".");
	return path.substr(dotPos+1, path.length);
}

function genBase64ImgUrl(data, path) {
	var basedir = data.asset_dir;
	var fullpath = determineFullFilePath(basedir, path);
	var ext = getFileExt(fullpath);
	if (fs.existsSync(fullpath)) {
		var base64Img = fs.readFileSync(fullpath, "base64");
		return "data:image/"+ ext + ";base64," + base64Img;
	} else {
		log.warn("file " + fullpath + " not found");
	}
	return path;
}

function genUrl(data, url, type) {
	if (type == 'base64') {
		return genBase64ImgUrl(data, url);
	} else if (type == 'qiniu') {
		return genQiniuUrl(data, url);
	} else {
		return url;
	}
}

function replaceImgUrl(data) {
	var baseUrl = undefined;
	if (hexo.config.encrypt.base_url != undefined) {
		baseUrl = hexo.config.encrypt.base_url.toString();
	}

	// type for encode url
	var globalType = 'qiniu';	// default is qiniu
	if (hexo.config.encrypt.type != undefined) {
		globalType = hexo.config.encrypt.type.toString();	
	}

	if (data.enc_img_type != undefined) {
		globalType = data.enc_img_type.toString();
	}
	log.debug("globalType:" + globalType);

	data.content = data.content.replace(/<img [^>]*src=['"]([^'"]+)[^>]*>/gi,
      function (match, url) {
		  var tmpurl = url;

		  var type = globalType;
		  var qiniuProtocal = "qiniu://";
		  var base64Protocal = "base64://";
		  if (url.lastIndexOf(qiniuProtocal, 0) == 0) {
		  	  tmpurl = tmpurl.substr(url.lastIndexOf(qiniuProtocal, 0) + qiniuProtocal.length, tmpurl.length);
			  type = "qiniu";
		  } else if (url.lastIndexOf(base64Protocal, 0) == 0) {
		 	  tmpurl = tmpurl.substr(url.lastIndexOf(base64Protocal, 0) +  base64Protocal.length, tmpurl.length);
			  type = "base64";
		  }

		  // the base url is configed and the current url is not a full url and
		  // the encode img url type is qiniu,  then contact the both
		  if (baseUrl != undefined
				  && tmpurl.lastIndexOf("http://", 0) != 0	
				  && type == 'qiniu') {
			  tmpurl = baseUrl + tmpurl;	
		  }
		  log.debug("\n\turl:" + url + "\n\ttmpurl:" + tmpurl + "\n\ttype:" + type);
		  return match.replace(url, genUrl(data, tmpurl, type));
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
	hexofs.copyFile(hexo.base_dir + 'node_modules/hexo-encrypt/crypto-js.js', 
			hexo.base_dir + 'public/js/crypto-js.js');
});



