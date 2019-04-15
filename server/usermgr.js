var db = require('../utils/db');
var common = require('./common');

var userSocketList = {};
var userInfoList = {};
var chatRoomList = [];

exports.initUserInfoList = function() {
    db.getUserInfoList(function(result) {
        if(result) {
            userInfoList = {};
            for(let i in result) {                
                let userInfo = {
                    id :        result[i].id,
                    name :      result[i].name,
                    email :     result[i].email,
                    type :      result[i].type,
                    login_type : result[i].login_type,
                    push :      result[i].push,
                    status :    result[i].status,
                    address :     result[i].address,
                    contact : result[i].contact,
                    month_fee :    result[i].month_fee,
                    hp_num : result[i].hp_num,
                    // partners
                    company_name : result[i].company_name,
                    clerk :  result[i].clerk,
                    elect_num : result[i].elect_num,
                    business_num : result[i].business_num,  // 사업자번호
                    bank_num : result[i].bank_num,
                    bank_name : result[i].bank_name,
                    tax_email : result[i].tax_email,
                    tax_clerk : result[i].tax_clerk,
                    reg_time :  common.getCorrectTime(result[i].reg_time)
                };
                
                userInfoList[result[i].id] = userInfo;
            }
            // console.log(chatRoomList);
        }
    });
};

exports.createUser = function(data, callback){
    let reg_time = common.getCurrentTime();

    db.createUser(data, reg_time, function(userId) {
        if(userId) {
            let userInfo = {
                id : userId,
                name : '',
                email : data.email,
                type : data.type,       // normal, partners
                login_type : data.login_type,
                push : 1,
                status : 1,
                contact : '',
                month_fee : 0,
                hp_num : '',
                // partners
                company_name : '',
                clerk :  '',
                elect_num : '',
                business_num : '',  // 사업자번호
                bank_num : '',
                bank_name : '',
                tax_email : '',
                tax_clerk : '',
                reg_time :  ''
            };
            userInfoList[userId] = userInfo;

            let res = {
                user_id : userId
            };
            callback(res);
        } else {
            callback(false);
        }
    });    
};

exports.delUserInfo = function(userId){
    delete userInfoList[userId];    
};

exports.getUserInfo = function(userId){
    return userInfoList[userId];
};

exports.updateUserInfoByField = function(field, userId, value){
    if(field == 'name') {
        userInfoList[userId].name = value;
    }
    else if(field == 'email') {
        userInfoList[userId].email = value;
    }
    else if(field == 'type') {
        userInfoList[userId].type = parseInt(value);;
    }
    else if(field == 'login_type') {
        userInfoList[userId].login_type = parseInt(value);
    }
    else if(field == 'push') {
        userInfoList[userId].push = parseInt(value);
    }
    else if(field == 'status') {
        userInfoList[userId].status = parseInt(value);
    }
    else if(field == 'contact') {
        userInfoList[userId].contact += value;
    }
    else if(field == 'month_fee') {
        userInfoList[userId].month_fee = parseInt(value);
    }
    else if(field == 'hp_num') {
        userInfoList[userId].hp_num = value;
    }
    else if(field == 'company_name') {
        userInfoList[userId].company_name = value;
    }
    else if(field == 'clerk') {
        userInfoList[userId].clerk = value;
    }
    else if(field == 'elect_num') {
        userInfoList[userId].elect_num = value;
    }
    else if(field == 'business_num') {
        userInfoList[userId].business_num = value;
    }
    else if(field == 'bank_num') {
        userInfoList[userId].bank_num = value;
    }
    else if(field == 'bank_name') {
        userInfoList[userId].bank_name = value;
    }
    else if(field == 'tax_email') {
        userInfoList[userId].tax_email = value;
    }
    else if(field == 'tax_clerk') {
        userInfoList[userId].tax_clerk = value;
    }
    else if(field == 'reg_time') {
        userInfoList[userId].reg_time = value;
    }   
};

exports.getChatRoomCnt = function(){
    return chatRoomList.length;
};