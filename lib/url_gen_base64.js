
var fs = require('fs');
var log = require('hexo-log')({
  debug: false,
  silent: false
});

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

function genUrl(data, conf) {
	var path = conf.realUrl;
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

exports.genUrl = genUrl;

