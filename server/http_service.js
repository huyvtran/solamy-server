var express = require('express');
var formidable = require('formidable');
var path = require('path');
var fs = require('fs');
var nodemailer = require('nodemailer'); 
var request = require('request'); 

var db = require('../utils/db');
var http = require('../utils/http');
var userMgr = require('./usermgr');
var common = require('./common');

var cookieParser = require('cookie-parser');
var cookieSession = require('cookie-session');

var app = express();
var config = null;

app.all('*', function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "X-Requested-With");
	res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
	res.header("X-Powered-By",' 3.2.1');
	res.header("Content-Type", "application/json;charset=utf-8");
	next();
});

app.use(cookieParser());
app.use(cookieSession({
	keys: ['node_yun'],
	cookie: {
	  // maxAge: 100 * 60 * 60 // 쿠키 유효기간 1시간
	  maxAge: 1
	}
}));

exports.start = function(cfg){
	config = cfg;	
	app.listen(config.HTTP_PORT);
	console.log("Http server is running on " + config.HTTP_PORT);
};

/****************** Global ***************************/

var getRandNumber = function (max, min) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
var sendMail = function(mail, subject, text) {
	console.log("sendmail come"+mail);
	var transporter = nodemailer.createTransport({
	  service: 'gmail',
	  auth: {
		user: 'suntechking@gmail.com',
		pass: 'solarmy365!'
	  }
	});

	var mailOptions = {
	  from: 'suntechking@gmail.com',
	  to: mail,
	//   to: 'hammerstrike331@hotmail.com',
	  subject: subject,
	  text: text
	};

	transporter.sendMail(mailOptions, function(error, info){
	  if (error) {
			console.log("error come")
		console.log(error);
	  } else {
		console.log('Email sent: ' + info.response);
	  }
	//   res.status(200).send('error-top-account');
	});
}
var sendMessage = function(device, message){
	var restKey = 'OWUxNTk2OGEtZjNmOC00MjA2LWI1ZWEtYjJhMTYxZTM3MjQy';
	var appID = 'a7627c17-c314-4d42-b7d3-2f8369a77e09';
	request(
		{
			method:'POST',
			uri:'https://onesignal.com/api/v1/notifications',
			headers: {
				"authorization": "Basic "+restKey,
				"content-type": "application/json"
			},
			json: true,
			body:{
				'app_id': appID,
				'contents': {en: message},
				'include_player_ids': Array.isArray(device) ? device : [device]
			}
		},
		function(error, response, body) {
			if(!body.errors){
				console.log(body);
			}else{
				console.error('Error:', body.errors);
			}
			
		}
	);
}
/********************User*********************/

app.post('/test', function(req, res) {

	var form = new formidable.IncomingForm();
	form.multiples = true;
    form.parse(req, function (err, fields, files) {

    	// db.getPassword('password', function(result) {
    	// 	console.log("/test", result);
    	// });
		console.log("/test", fields);
		http.send(res, "ok", 'result---');
	});	
    form.on('error', function(err) {
		console.log('test: '+err);
	});
});
///////////////////////
app.post('/sendPush', function(req, res){	
	var form = new formidable.IncomingForm();
	form.multiples = true;
    form.parse(req, function (err, fields, files) {
		let type = fields.type;
		let note = '';
		if(type == 0) {
			note = '분석결과가 도착했습니다.';
		}else {
			note = '업체 비교 견적이 도착했습니다.';
		}
		db.getUserInfoById(fields.user_id, function(result) {
            if(result != null) {
				if(result.push_flag) {
					sendMessage(result.token , note);
				}
				http.send(res, "ok", true);
            } else {
                http.send(res, "fail", false);
            }
        });
	});	
    form.on('error', function(err) {
		console.log('sendPush: '+err);
	});
});

app.post('/checkUser', function(req, res){	
	console.log("check user come")
	var form = new formidable.IncomingForm();
	form.multiples = true;
    form.parse(req, function (err, fields, files) {	
			console.log(fields)	
		db.checkEmail(fields, function(result) {
			console.log("result is ")
			console.log(result);
            if(result != null) {
				http.send(res, "ok", result);				
            } else {
							console.log("failed");
                http.send(res, "fail", false);
            }
        });
	});	
    form.on('error', function(err) {
		console.log('checkUser: '+err);
	});
});

app.post('/checkEmail', function(req, res){
	console.log("check Email comeeeeeeeeee!!!!");
	
	// check login
	var form = new formidable.IncomingForm();
	form.multiples = true;
    form.parse(req, function (err, fields, files) {
			console.log("fields is : ")
			console.log(fields);
		db.checkEmail(fields, function(result) 
		{
			console.log(result);
            if(result != null) 
            {
		    	db.getPassword( fields.password, function(password) {
						var p1=String.fromCharCode.apply(null, new Uint16Array(result.password));
						var p2=String.fromCharCode.apply(null, new Uint16Array(password.password));
		    		if( p1 == p2 ) {
							console.log("ok ");
		    			http.send(res, "ok", result);		
		    		}else {
							console.log("ok but not matched");
		    			http.send(res, "ok", 'not-match');
		    		}
		    	});
				
            } else {
							console.log("failed");
                http.send(res, "fail", false);
            }
        });
	});	
    form.on('error', function(err) {
		console.log('checkEmail: '+err);
	});
});

app.post('/updatePassword', function(req, res){	
	var form = new formidable.IncomingForm();
	form.multiples = true;
    form.parse(req, function (err, fields, files) {
		db.updatePassword(fields.email, fields.password, function(result) {
            if(result != null) {
				http.send(res, "ok", result);				
            } else {
                http.send(res, "fail", false);
            }
        });
	});	
    form.on('error', function(err) {
		console.log('updatePassword: '+err);
	});
});

app.post('/getInstallation',function(req,res){
	db.getInstallation( function(result) 
	{
					if(result != null) 
					{
						console.log(result);
		
	
					http.send(res, "ok", result);
			
		}else {
			http.send(res, "ok", false);
		}
	});
})
app.post('/getInstallDetail',function(req,res){
	db.getInstallDetail( function(result) 
	{
					if(result != null) 
					{
						console.log(result);
		
	
					http.send(res, "ok", result);
			
		}else {
			http.send(res, "ok", false);
		}
	});
})

app.post('/requestGovernmentInquiry',function(req,res){
	console.log("requestGovernmentInquiry");
	var form = new formidable.IncomingForm();
	form.multiples = true;
    form.parse(req, function (err, fields, files) {
			console.log(fields);
			db.requestGovernmentInquiry(fields, function(result) 
			{
							if(result != null) 
							{
								console.log(result);
				
			
							http.send(res, "ok", result);
					
				}else {
					http.send(res, "ok", false);
				}
			});
		});

})
app.post('/getInquiry',function(req,res){
	db.getInquiry( function(result) 
	{
					if(result != null) 
					{
						console.log(result);
		
	
					http.send(res, "ok", result);
			
		}else {
			http.send(res, "ok", false);
		}
	});
})
app.post('/getBanner',function(req,res){
	db.getBanner( function(result) 
	{
					if(result != null) 
					{
						console.log(result);
		
	
					http.send(res, "ok", result);
			
		}else {
			http.send(res, "ok", false);
		}
	});
})
app.post('/getQuotation',function(req,res){
	db.getQuotation( function(result) 
	{
					if(result != null) 
					{
						console.log(result);
		
	
					http.send(res, "ok", result);
			
		}else {
			http.send(res, "ok", false);
		}
	});
})
app.post('/sendPassword', function(req, res) {

	var form = new formidable.IncomingForm();
	form.multiples = true;
    form.parse(req, function (err, fields, files) {
		db.checkEmail(fields, function(result) 
		{
            if(result != null) 
            {
				var mail = fields.email;
				var randKey = getRandNumber(10000000, 99999999);
				var subject = "[Solarmy] 임시 비밀번호입니다.";
				var text = randKey + " [Solarmy] 임시 비밀번호입니다.";
				db.updatePassword(fields.email, randKey, function(resultPass) {
					if(resultPass) {
						sendMail(mail, subject, text);
						http.send(res, "ok", 'send ok');
					}
				});
			}else {
				http.send(res, "ok", false);
			}
		});
	});	
    form.on('error', function(err) {
		console.log('sendPassword: '+err);
	});
});

app.post('/sendAuthKey', function(req, res) {

	console.log("sendAuthKey come")
	var form = new formidable.IncomingForm();
	form.multiples = true;
    form.parse(req, function (err, fields, files) {

		var randKey = getRandNumber(100000, 999999);
		req.session.randKey = randKey;
		var subject = "[Solarmy] 인증번호란에 입력해주세요";
		var text = randKey + " [Solarmy] 인증번호\n 인증번호란에 입력해주세요.";
		// console.log(text);
		sendMail(fields.email ,subject, text);
		console.log(fields.email);
		http.send(res, "ok", randKey);
		
	});	
    form.on('error', function(err) {
		console.log('sendPassword: '+err);
	});
});

app.post('/registerUser', function(req, res){	
	var form = new formidable.IncomingForm();
	form.multiples = true;
    form.parse(req, function (err, fields, files) {
		db.createUser(fields, function(result) {
            if(result != null) {
				http.send(res, "ok", result);
            } else {
                http.send(res, "fail", false);
            }
        });
	});	
    form.on('error', function(err) {
		console.log('registerUser: '+err);
	});
});

app.post('/deleteUser', function(req, res){	
	var form = new formidable.IncomingForm();
	form.multiples = true;
    form.parse(req, function (err, fields, files) {			
		db.deleteUser(fields.user_id, function(result) {
            if(result) {				
				http.send(res, "ok", true);				
            } else {
                http.send(res, "fail", false);
            }
        });
	});	
    form.on('error', function(err) {
		console.log('deleteUser: '+err);
	});
});

app.post('/getUserInfoById', function(req, res){	
	var form = new formidable.IncomingForm();
	form.multiples = true;
    form.parse(req, function (err, fields, files) {	
			console.log("get comecome");
			console.log(fields.user_id)	
		db.getUserInfoById(fields.user_id, function(result) {
            if(result != null) {
				http.send(res, "ok", result);				
            } else {
                http.send(res, "fail", false);
            }
        });
	});	
    form.on('error', function(err) {
		console.log('getUserInfoById: '+err);
	});
});

app.post('/updatePushFlag', function(req, res){		
	var form = new formidable.IncomingForm();
	form.multiples = true;
    form.parse(req, function (err, fields, files) {
		db.updateTable(fields, function(result) {
            if(result) {
				http.send(res, "ok", true);				
            } else {
                http.send(res, "fail", false);
            }
        });
	});	
    form.on('error', function(err) {
		console.log('updatePushFlag: '+err);
	});
});
app.post('/updateTokenId', function(req, res){		
	var form = new formidable.IncomingForm();
	form.multiples = true;
    form.parse(req, function (err, fields, files) {
		db.updateTable(fields, function(result) {
            if(result) {
				http.send(res, "ok", true);				
            } else {
                http.send(res, "fail", false);
            }
        });
	});	
    form.on('error', function(err) {
		console.log('updatePushFlag: '+err);
	});
});

app.post('/updateUserLicences', function(req, res){	
	var form = new formidable.IncomingForm();
	form.multiples = true;
    form.parse(req, function (err, fields, files) {		
		var filepath = path.join(__dirname, config.IMG_PATH);
		!fs.existsSync(filepath) && fs.mkdirSync(filepath); 
		
		var d = new Date();
		var n = d.getTime();
		let filename = n+'.jpg';

		if(fields.url != "") {
			var buff = new Buffer(fields.url, 'base64');
			fs.writeFile(filepath + "/" + filename, buff, function (err) {
				if(err == null) {
					fields.url = filename;
					db.updateUserLicences(fields, function(result) {
						if(result) {
							http.send(res, "ok", filename);
						} else {
							http.send(res, "fail", false);
						}
					});
				} else {
					http.send(res, "fail", false);
				}
			});
		}
		else {
			db.updateUserLicences(fields, function(result) {
				if(result) {
					http.send(res, "ok", "no_img");
				} else {
					http.send(res, "fail", false);
				}
			});
		}
	});	
    form.on('error', function(err) {
		console.log('updateUserImg: '+err);
	});
});

app.post('/updatePartnerData', function(req, res){	
	var form = new formidable.IncomingForm();
	form.multiples = true;
    form.parse(req, function (err, fields, files) {
		db.updatePartnerData(fields, function(result) {
			if(result != null) {
				http.send(res, "ok", true);
            } else {
                http.send(res, "fail", false);
            }
        });
	});	
    form.on('error', function(err) {
		console.log('updatePartnerData: '+err);
	});
});
/*********************************************/

/********************logic*******************/
// 분석의뢰정보등록
app.post('/getTerm', function(req, res){		
	var form = new formidable.IncomingForm();
	form.multiples = true;
    form.parse(req, function (err, fields, files) {
		
		db.getTerm(fields, function(result) {	// user info update
            if(result) {
				http.send(res, "ok", result);
            } else {
                http.send(res, "fail", false);
            }
        });
	});	
    form.on('error', function(err) {
		console.log('getTerm: '+err);
	});
});
// for normal member
app.post('/getAddressByWord', function(req, res){		
	var form = new formidable.IncomingForm();
	form.multiples = true;
    form.parse(req, function (err, fields, files) {
		var keyword = fields.search_address;
		var url = "http://www.juso.go.kr/addrlink/addrLinkApiJsonp.do";
		var headers = {
			'User-Agent':       'Super Agent/0.0.1',
			'Content-Type':     'application/x-www-form-urlencoded'
		}
		
		// Configure the request
		var options = {
			url: url,
			method: 'POST',
			headers: headers,
			form: { resultType:"json", confmKey:"U01TX0FVVEgyMDE4MDgwOTE1NDcwNjEwODA2ODM=", currentPage:1, countPerPage:10,
				keyword: keyword }
		}
		
		// Start the request
		request(options, function (error, response, body) {
			if (!error && response.statusCode == 200) {
				var str = body.substr(1, body.length-2);
				var result = JSON.parse( str );
				// console.log(result.results.juso);
				http.send(res, "ok", result.results.juso);
			}
		})
		
	});	
    form.on('error', function(err) {
		console.log('getAddressByWord: '+err);
	});
});
// 분석의뢰정보등록
app.post('/analyseNormalClient', function(req, res){		
	var form = new formidable.IncomingForm();
	form.multiples = true;
    form.parse(req, function (err, fields, files) {
		
		db.updateNormalMem(fields, function(result) {	// user info update
            if(result) {
				db.addNormalAnalyse(fields, function(result) {
					if(result) {		
						http.send(res, "ok", true);
					} else {
						http.send(res, "fail", false);
					}
				});
            } else {
                http.send(res, "fail", false);
            }
        });
	});	
    form.on('error', function(err) {
		console.log('analyseNormalClient: '+err);
	});
});
// 분석의뢰정보얻기 from userId
app.post('/getAnalyseByUserId', function(req, res){	
	var form = new formidable.IncomingForm();
	form.multiples = true;
    form.parse(req, function (err, fields, files) {		
		db.getAnalyseByUserId(fields.user_id, function(result) {
			if(result != null) {
				http.send(res, "ok", result);				
            } else {
                http.send(res, "fail", false);
            }
        });
	});	
    form.on('error', function(err) {
		console.log('getAnalyseByUserId: '+err);
	});
});
// 분석의뢰정보얻기 from Id
app.post('/getAnalyseById', function(req, res){	
	var form = new formidable.IncomingForm();
	form.multiples = true;
    form.parse(req, function (err, fields, files) {		
		db.getAnalyseById(fields.analyse_id, function(result) {
			if(result != null) {
				http.send(res, "ok", result);				
            } else {
                http.send(res, "fail", false);
            }
        });
	});	
    form.on('error', function(err) {
		console.log('getAnalyseById: '+err);
	});
});
// 분석의뢰결과얻기
app.post('/getAnalyseResult', function(req, res){	
	var form = new formidable.IncomingForm();
	form.multiples = true;
    form.parse(req, function (err, fields, files) {
		db.getAnalyseResultById(fields.analyse_id, function(result) {
			if(result != null) {
				http.send(res, "ok", result);				
            } else {
                http.send(res, "fail", false);
            }
        });
	});	
    form.on('error', function(err) {
		console.log('getAnalyseResultById: '+err);
	});
});
// 참여업체정보얻기 GET ALL
app.post('/getCompanyData', function(req, res){	
	var form = new formidable.IncomingForm();
	form.multiples = true;
    form.parse(req, function (err, fields, files) {
		db.getCompanyDataByAnalId(fields.analyse_id, function(result) {
			console.log("final result is : ");
			console.log(result);
			if(result != null) {
				http.send(res, "ok", result);
            } else {
                http.send(res, "fail", false);
            }
        });
	});	
    form.on('error', function(err) {
		console.log('getCompanyData: '+err);
	});
});
// 참여업체정보얻기 GET ALL (일반회원 진행현황)
app.post('/getCompanyDataByCompId', function(req, res){	
	var form = new formidable.IncomingForm();
	form.multiples = true;
    form.parse(req, function (err, fields, files) {
		db.getCompanyDataByCompId(fields, function(result) {
			if(result != null) {
				http.send(res, "ok", result);
            } else {
                http.send(res, "fail", false);
            }
        });
	});	
    form.on('error', function(err) {
		console.log('getCompanyDataByCompId: '+err);
	});
});
// 분석상태 변경
app.post('/updateAnalyseData', function(req, res){	
	var form = new formidable.IncomingForm();
	form.multiples = true;
    form.parse(req, function (err, fields, files) {		
		db.updateAnalyseData(fields, function(result) {
			if(result != null) {
				http.send(res, "ok", result);				
            } else {
                http.send(res, "fail", false);
            }
        });
	});	
    form.on('error', function(err) {
		console.log('updateAnalyseData: '+err);
	});
});
// 견적상태 변경(계약일&설치희망일) 변경
app.post('/updateContData', function(req, res){	
	var form = new formidable.IncomingForm();
	form.multiples = true;
    form.parse(req, function (err, fields, files) {
		db.updateAnalyseDates(fields, function(result) {
			if( result ) {
				let data = {
					field: 'status',
					value: '2',			//2:계약완료
					analyse_id: fields.analyse_id
				}
				db.updateAnalyseData(data, function(result1) {
					if(result1 != null) {
						http.send(res, "ok", true);
					}else 
						http.send(res, "fail", false);	
				});
            } else {
                http.send(res, "fail", false);
            }
        });
	});	
    form.on('error', function(err) {
		console.log('updateContData: '+err);
	});
});
// 참여업체상세정보얻기
app.post('/getCompanyDetail', function(req, res){	
	var form = new formidable.IncomingForm();
	form.multiples = true;
    form.parse(req, function (err, fields, files) {		
		db.getCompanyDetail(fields.comp_id, function(result) {
			if(result != null) {
				http.send(res, "ok", result);
            } else {
                http.send(res, "fail", false);
            }
        });
	});	
    form.on('error', function(err) {
		console.log('getCompanyDetail: '+err);
	});
});
// 견적관리정보얻기
app.post('/getContractInfoData', function(req, res){	
	var form = new formidable.IncomingForm();
	form.multiples = true;
    form.parse(req, function (err, fields, files) {		
		db.getContractInfoData(function(result) {
			if(result != null) {
				http.send(res, "ok", result);
            } else {
                http.send(res, "fail", false);
            }
        });
	});	
    form.on('error', function(err) {
		console.log('getContractInfoData: '+err);
	});
});
// 고객평가주기
app.post('/setCustomerRating', function(req, res){	
	var form = new formidable.IncomingForm();
	form.multiples = true;
    form.parse(req, function (err, fields, files) {
		let data = {
			field: 'custom_replay',
			value: fields.comment,
			comp_id: fields.comp_id
		}
		db.updateContractDatesByCompID(data, function(result) {
			if( result ) {
				db.addContDates(fields, function(result1) {
					if( result1 ) { 
						http.send(res, "ok", true);
					}else {
						http.send(res, "fail", false);
					}
				});
            } else {
                http.send(res, "fail", false);
            }
        });
	});	
    form.on('error', function(err) {
		console.log('setCustomerRating: '+err);
	});
});

/////////////// for partners /////////////////////
// 요청 견적얻기
app.post('/getAnalyseData', function(req, res){	
	var form = new formidable.IncomingForm();
	form.multiples = true;
    form.parse(req, function (err, fields, files) {		
		db.getAnalyseData(fields, function(result) {
			console.log(fields);
			if(result != null) {
				console.log("getanalyseData");
				console.log(result);
				http.send(res, "ok", result);				
            } else {
                http.send(res, "fail", false);
            }
        });
	});	
    form.on('error', function(err) {
		console.log('getAnalyseData: '+err);
	});
});
// 제출한 견적얻기
app.post('/getSubmitContract', function(req, res){	
	var form = new formidable.IncomingForm();
	form.multiples = true;
    form.parse(req, function (err, fields, files) {		
		db.getSubmitContract(fields, function(result) {
			if(result != null) {
				http.send(res, "ok", result);				
            } else {
                http.send(res, "fail", false);
            }
        });
	});	
    form.on('error', function(err) {
		console.log('getSubmitContract: '+err);
	});
});
// 계약 견적얻기
app.post('/getAgreeContract', function(req, res){	
	var form = new formidable.IncomingForm();
	form.multiples = true;
    form.parse(req, function (err, fields, files) {
		db.getAgreeContract(fields, function(result) {
			if(result != null) {
				http.send(res, "ok", result);
            } else {
                http.send(res, "fail", false);
            }
        });
	});	
    form.on('error', function(err) {
		console.log('getAgreeContract: '+err);
	});
});
// 설치완료 견적얻기
app.post('/getCompleteContract', function(req, res){	
	var form = new formidable.IncomingForm();
	form.multiples = true;
    form.parse(req, function (err, fields, files) {		
		db.getCompleteContract(fields, function(result) {
			if(result != null) {
				http.send(res, "ok", result);				
            } else {
                http.send(res, "fail", false);
            }
        });
	});	
    form.on('error', function(err) {
		console.log('getCompleteContract: '+err);
	});
});

// ///////// ///////// ///////// ///////
// 구매확정시 status 를 4로 변경 

app.post('/updateInstallStatus', function(req, res){	
	console.log("requested updateInstallStatus httpcome");
	var form = new formidable.IncomingForm();
	form.multiples = true;
    form.parse(req, function (err, fields, files) {		

			let data = {
				field: 'status',
				value: '4',			//1:견적제출
				analyse_id: fields.analyse_id
			}
			db.updateAnalyseData(data, function(result1) {
				if(result1 != null) {
					http.send(res, "ok", true);
				}else 
					http.send(res, "fail", false);	
			});
	});	
    form.on('error', function(err) {
		console.log('setSubmitContract: '+err);
	});
});

// 견적제출
app.post('/setSubmitContract', function(req, res){	
	console.log("setSubmitContract come");
	var form = new formidable.IncomingForm();
	form.multiples = true;
    form.parse(req, function (err, fields, files) {		
		db.setSubmitContract(fields, function(result) {
			if(result != null) {
				let data = {
					field: 'status',
					value: '1',			//1:견적제출
					analyse_id: fields.analyse_id
				}
				db.updateAnalyseData(data, function(result1) {
					if(result1 != null) {
						http.send(res, "ok", true);
					}else 
						http.send(res, "fail", false);	
				});
				
            } else {
                http.send(res, "fail", false);
            }
        });
	});	
    form.on('error', function(err) {
		console.log('setSubmitContract: '+err);
	});
});
// 제출한 견적보기
app.post('/getContractById', function(req, res){	
	var form = new formidable.IncomingForm();
	form.multiples = true;
    form.parse(req, function (err, fields, files) {		
		db.getContractById(fields.cont_id, function(result) {
			if(result != null) {
				http.send(res, "ok", result);
            } else {
                http.send(res, "fail", false);
            }
        });
	});	
    form.on('error', function(err) {
		console.log('getContractById: '+err);
	});
});
// 진행현황 / 계약 정보보기
app.post('/getQuotStatus', function(req, res){	
	var form = new formidable.IncomingForm();
	form.multiples = true;
    form.parse(req, function (err, fields, files) {		
		db.getQuotStatus(fields, function(result) {
			if(result != null) {
				http.send(res, "ok", result);
            } else {
                http.send(res, "fail", false);
            }
        });
	});	
    form.on('error', function(err) {
		console.log('getQuotStatus: '+err);
	});
});
// 계약회사의(계약일&설치예정일&설치완료일) 변경
app.post('/updateContDates', function(req, res){	
	var form = new formidable.IncomingForm();
	form.multiples = true;
    form.parse(req, function (err, fields, files) {		
		db.updateContDates(fields, function(result) {
			if(result != null) {
				let data = {
					field: 'status',
					value: '2',			//2:계약완료
					analyse_id: fields.analyse_id
				}
				db.updateAnalyseData(data, function(result1) {
					if(result1 != null) {
						http.send(res, "ok", true);
					}else 
						http.send(res, "fail", false);	
				});

            } else {
                http.send(res, "fail", false);
            }
        });
	});	
    form.on('error', function(err) {
		console.log('updateContDates: '+err);
	});
});
