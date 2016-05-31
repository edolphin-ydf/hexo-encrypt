/* global hexo */
'use strict';

var CryptoJS = require("crypto-js");
var fs = require('hexo-fs');
var log = require('hexo-log')({
  debug: false,
  silent: false
});

function getPassword() {
	var pwdfilePath = hexo.base_dir + hexo.config.encrypt.pwdfile;
	var password = 'default_password';
	if (fs.existsSync(pwdfilePath)) {
		password = fs.readFileSync(pwdfilePath);
		password = password.replace(/\n/g, '');
	}
	if (password == 'default_password')
		password = hexo.config.encrypt.password.toString();
	return password;
}

hexo.extend.filter.register('after_post_render', function(data){
	if (data.encrypt == true) {
		var password = getPassword();
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
