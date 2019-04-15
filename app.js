var db = require('./utils/db');
var configs = require("./configs");
var http_service = require("./server/http_service");

var config = configs.solarmy_server();
db.init(configs.mysql());

http_service.start(config);