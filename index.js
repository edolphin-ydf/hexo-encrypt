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

const CryptoJS = require('crypto-js');
const fs = require('hexo-fs');
const path = require('path');
const log = require('hexo-log')({
	'debug': false,
	'silent': false,
});

const RootUrl = hexo.config.root;
const ConfGlobal = require('./lib/conf_global')(hexo.config.encrypt, hexo.base_dir);
const ConfPost = require('./lib/conf_post');
const ConfUrl = require('./lib/conf_url');
const imgUrlGenerator = require('./lib/url_gen');


function replaceImgUrl (conf, data) {

	// const baseUrl = conf.base_url;

	data.content = data.content.replace(/<img [^>]*src=['"]([^'"]+)[^>]*>/gi,
		function (match, url) {

			// const tmpurl = url;

			const urlConf = ConfUrl.create(conf, url);

			return match.replace(url, imgUrlGenerator.genUrl(data, urlConf));

		});
	log.debug('post pic url replaced');

}

function encrypt (conf, data) {

	const password = conf.password;
	const ciphertext = CryptoJS.AES.encrypt(data.content, password);
	const txt = ciphertext.toString();
	const CryptoJSurl = `${ RootUrl }js/crypto-js.js`;
	data.content = `<script src=${ CryptoJSurl }></script>
<script>
function doDecrypt (pwd, onError) {
	console.log('in doDecrypt');
	const txt = document.getElementById('enc_content').innerHTML;
	let plantext;
	try {
		const bytes = CryptoJS.AES.decrypt(txt, pwd);
		var plaintext = bytes.toString(CryptoJS.enc.Utf8);
	} catch(err) {
		if(onError) {
			onError(err);
		}
		return;
	}
	document.getElementById('enc_content').innerHTML = plaintext;
	document.getElementById('enc_content').style.display = 'block';
	document.getElementById('enc_passwd').style.display = 'none';
	if(typeof MathJax !== 'undefined') {
		MathJax.Hub.Queue(
			['resetEquationNumbers', MathJax.InputJax.TeX],
			['PreProcess', MathJax.Hub],
			['Reprocess', MathJax.Hub]
		);
	}
}
</script>
<div id="enc_content" style="display:none">${ txt }</div>
<div id="enc_passwd">${ conf.template }</div>`;
	log.info(`${ data.title } encryped`);

}

hexo.extend.filter.register('after_post_render', function (data) {

	const confPost = ConfPost.create(ConfGlobal, data);
	log.debug(`replace:${ confPost.replace_img_url}`);
	if (confPost.replace_img_url) {

		replaceImgUrl(confPost, data);

	}

	// Encrypt the content
	if (confPost.encrypt) {

		encrypt(confPost, data);

	}
	return data;

});

// Copy the encrypt js file
hexo.extend.generator.register('encrypt', () => ({
	'data': () => fs.createReadStream(path.resolve(path.dirname(require.resolve('crypto-js')), 'crypto-js.js')),
	'path': 'js/crypto-js.js',
}));
