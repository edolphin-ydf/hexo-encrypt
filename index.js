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
var log = require('hexo-log')({
  debug: false,
  silent: false
});

var RootUrl = hexo.config.root;
var ConfGlobal = require('./lib/conf_global')(hexo.config.encrypt, hexo.base_dir);
var ConfPost = require('./lib/conf_post');
var ConfUrl = require('./lib/conf_url');
var imgUrlGenerator = require('./lib/url_gen');


function replaceImgUrl(conf, data) {
	var baseUrl = conf.base_url;

	data.content = data.content.replace(/<img [^>]*src=['"]([^'"]+)[^>]*>/gi,
	function (match, url) {
		var tmpurl = url;

		var urlConf = ConfUrl.create(conf, url);

		return match.replace(url, imgUrlGenerator.genUrl(data, urlConf));
	});
	log.debug("post pic url replaced");
}

function encrypt(conf, data) {
	var password = conf.password;
	var ciphertext = CryptoJS.AES.encrypt(data.content, password);
	var txt = ciphertext.toString();
	var CryptoJSurl = RootUrl+'js/crypto-js.js';
	data.content = '<script src=' + CryptoJSurl + '></script>';
	data.content = data.content + '<script>\n'+
		'function doDecrypt(pwd, onError) {\n' +
		'	console.log("in doDecrypt");\n' +
		'	var txt = document.getElementById("enc_content").innerHTML;\n' +
		'	var plantext;\n'	+ 
		'	try {\n' +
		'	  	var bytes = CryptoJS.AES.decrypt(txt, pwd);\n' +
		'		plaintext = bytes.toString(CryptoJS.enc.Utf8);\n' +
		'	} catch(err) {\n'	+
		'		if(onError) {onError(err);}\n'	+
		'		return;\n'	+
		'	}\n'	+
		'	document.getElementById("enc_content").innerHTML = plaintext;\n' +
		'	document.getElementById("enc_content").style.display = "block";\n' +
		'   document.getElementById("enc_passwd").style.display = "none";\n' +
		'}\n' +
		'</script>\n';
	data.content = data.content + '<div id="enc_content" style="display:none">' + txt + '</div>';
	data.content = data.content + '<div id="enc_passwd">' + conf.template + '</div>';
	log.info(data.title + " encryped");
}

hexo.extend.filter.register('after_post_render', function(data){
	var confPost = ConfPost.create(ConfGlobal, data);
	log.debug("replace:" + confPost.replace_img_url);
	if (confPost.replace_img_url == true) {
		replaceImgUrl(confPost, data);
	}

	// encrypt the content
	if (confPost.encrypt == true) {
		encrypt(confPost, data);
	} 
	return data;
});


// copy the encrypt js file
hexo.extend.filter.register('after_generate', function(){
	log.info("copy crypto-js.js to public/js/");
	hexofs.copyFile(hexo.base_dir + 'node_modules/hexo-encrypt/crypto-js.js', 
			hexo.base_dir + 'public/js/crypto-js.js');
});


