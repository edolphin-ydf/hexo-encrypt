## description
	If you want to make a permission for one post, (eg:enter an password to view the content)
then this hexo plugin is for you.

## test page
	http://edolphin.site/2016/05/31/encrypt-test/
	password is 123456

## install
```
npm install hexo-encrypt
```
in hexo root dir, edit the package.json, add the follow code in dependencies scope
```
"hexo-encrypt": "^0.2.0",
```

## features
- encrypt one post content with AES
- use qiniu *private* space as you img repository(if you want use this feature, you should get an qiniu account first, search google for help)
- encode a local img into base64 type, then inline it in html

## usage
### config encrypt password
in _config.yml add the follow code, NOTE, all option is optional, this means you can discard all the options if you don't want use this features
```
# encrypt
encrypt:
  pwdfile: encrypt_password		# this store the password in a file, the whole content of this file will be regarded as the password
    #password: 123456 # this set password here
  replace_all_url: true # this will replace img url in all posts
  base_url: http://you img base url/	# this will connect with you img url in you post, except full url(start with http://)
  qiniu_ak: your qiniu access key 
  qiniu_sk: your qiniu secrect key 
  img_url_ttl: 3600  # 3600 second, the ttl for qiniu img url
  type: qiniu # or base64, if base64, the base_url, qiniu_ak, qiniu_sk and img_url_ttl is unnecessary

```

### config post
add the following code in the header of the post to indicate that this post's content should be encrypted. NOTE, all option is optional, this means you can discard all the options if you don't want use this features

```
encrypt: true
enc_replace_url: true # this indicate wether the plugin should replace the img url in this post, this option has a higher priority than `replace_all_url` in _config.yml
enc_pwd: 123456 # this is the way to set encrypt password for this post
enc_img_type: qiniu # or base64
```

then run `hexo g` and `hexo s`, open the encrypted post, 
you will find that, the page request you to enter a password.


---
---
---

#the config rul detail

# the base rule
configs for this plugin in _config.yml are all in encrypt: scope
eg: 
encrypt:
		pwdfile: xxx
		type: xxx

# rule for encrypt content
## config whether encrypt a content
in post header
	encrypt: true

## config the password
- store the password in a file, config as pwdfile: finename
- config the password in _config.yml directly, password: passwd
- config the password for one post,  enc_pwd: 123456

# rule for generate img url

## first and foremost you should open the switch
		you could config replace_all_url: true in _config.yml
		or config enc_replace_url: true in post which need encode(replace) the url

## for now, the generator support qiniu which the img stored in qiniu cloud and base64 which encode the img to base64 and make it inline in html

- in _config.yml, config type
- or in post header, config enc_img_type
- or in `![](type://)`, make the url start with type://

the value of type could be `qiniu` or `base64` only

## the priority is:
```
![](type://) > post header > _config.yml
```


if you never config the type in anywhere, then qiniu is default

## base64:
the url rule:(or you can call it path)
the path support three types:
~/, / and ./
the ~/ will be replaced to / type
the ./ will be replaced to / type with base_dir which is the post asset path(data.asset_dir)

## qiniu:

### key
the qiniu need access key and secrect key first.
then config it as qiniu_ak: qiniu_sk: in _config.yml
- you can also config a ttl in seconds for the generated img url, which default value is 1 hour
 	this means if you don't config it, the img which stored in qiuniu  will not be available after
 	one hour later.

### base_url rule:
the base_url is only support for qiniu
so, if the url encode type is qiniu and url is not a full path
then connect the base_url and the url
otherwise ignore the base_url



