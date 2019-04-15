var IP = "192.168.2.131";
var HTTP_PORT = 3200;
// var ELECT_IMG = "../../uploads";
// var BUSS_IMG = "../../uploads";

var IMG_PATH = "../uploads";


exports.mysql = function(){
	return {
		HOST:'uws7-087.cafe24.com',
		USER:'tiddler',
		PSWD:'a7693707!',
		DB:'tiddler'
	}
};

exports.solarmy_server = function(){
	return {
		SERVER_IP: IP,
		HTTP_PORT: HTTP_PORT,
		IMG_PATH: IMG_PATH
	};
};