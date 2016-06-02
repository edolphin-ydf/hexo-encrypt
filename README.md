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

```

### config post
add the following code in the header of the post to indicate that this post's content should be encrypted. NOTE, all option is optional, this means you can discard all the options if you don't want use this features

```
encrypt: true
enc_replace_url: true # this indicate wether the plugin should replace the img url in this post, this option has a higher priority than `replace_all_url` in _config.yml
enc_pwd: 123456 # this is the way to set encrypt password for this post
```

then run `hexo g` and `hexo s`, open the encrypted post, 
you will find that, the page request you to enter a password.

