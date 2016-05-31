## description
	If you want to make an permission with one post, (eg:enter an password to view the content)
then this hexo plugin is for you.

## install
```
npm install hexo-encrypt
```
in hexo root dir, edit the package.json, add the follow code in dependencies scope
```
"hexo-encrypt": "^0.1.0",
```

## features
- encrypt one post content with AES

## usage
### config encrypt password
in _config.yml add the follow code
```
# encrypt
encrypt:
  pwdfile: encrypt_password		# this store the password in a file, the whole content of this file will be regard as the password
    #password: 123456 # this set the password here
```

### config post
add the following code in the header of the post to indicate that this post's content should be encrypted
```
encrypt: true
```

then run `hexo g` and `hexo s`, open the encrypted post, 
you will find that, the page request you to enter a password.

