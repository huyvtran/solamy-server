var mysql = require("mysql");  
var crypto = require('./crypto');
var conf = null;
var pool = null;

function nop(a,b,c,d,e,f,g){

}
  
function query(sql,callback){  
    pool.getConnection(function(err,conn){  
        if(err){  
            callback(err,null,null);  
        }else{  
            conn.query(sql,function(qerr,vals,fields){  
                conn.release();  
                callback(qerr,vals,fields);  
            });  
        }  
    });  
};

exports.init = function(config){
    console.log("db init come!");
    pool = mysql.createPool({  
        host: config.HOST,
        user: config.USER,
        password: config.PSWD,
        database: config.DB,
        port: config.PORT
    });
    conf = config;
    console.log(conf);
}; 

exports.multi_query = function(sqlList, cnt, callback){
    callback = callback == null? nop:callback;

    var connection = mysql.createConnection({  
        host: conf.HOST,
        user: conf.USER,
        password: conf.PSWD,
        database: conf.DB,
        port: conf.PORT,
        multipleStatements: true
    });
    connection.connect();
    
    connection.query(sqlList, [1, cnt], function(error, results, fields) {
        if (error) {
            callback(null);
            throw error;
        }
        else{
            if(results.length > 0)
                callback(results);
            else
                callback(0);

        }        
    });
    connection.end();    
};

/*********************************************/

/********************User*********************/
exports.getPassword = function(password, callback) {
    if( password == null) {
        callback(false);
        return;
    }
    var sql = 'SELECT PASSWORD("'+password+'") AS password';
    
    query(sql, function(err, rows, fields) {
        if (err) {
            callback(null);
            throw err;
        }
        else {
            if(rows.length == 0){
                callback(null);
                return;
            }    
            callback(rows[0]);
        }
    }); 
};


exports.getInstallation=function(callback){
    console.log("getInstallation")

    callback = callback == null? nop:callback;
    
    var sql = 'SELECT * FROM tbl_install';
    query(sql, function(err, rows, fields) {
        if (err) {
            callback(null);
            throw err;
        }
        else {
            console.log(rows);
            if(rows.length == 0){
                callback(null);
                return;
            }    
            callback(rows);
        }
    }); 

}
exports.getInstallDetail=function(callback){
    console.log("tbl_inquiry_detail")

    callback = callback == null? nop:callback;
    
    var sql = 'SELECT * FROM tbl_install_detail';
    query(sql, function(err, rows, fields) {
        if (err) {
            callback(null);
            throw err;
        }
        else {
            console.log(rows);
            if(rows.length == 0){
                callback(null);
                return;
            }    
            callback(rows);
        }
    }); 

}

exports.requestGovernmentInquiry = function(data, callback){
    caallback = callback == null? nop:callback;
    if(data == null ) {
        callback(false);
        return;
    }
    console.log(data);
    var sql = 'INSERT INTO tbl_inquiry( email, name,phone, division, status, reg_time) VALUES("'
        +data.email+'", "'+data.name+'", "'+data.contact+'", "'+data.division+'","0",NOW() )';
    
    query(sql, function(err, rows, fields) {
        if (err) {
            if(err.code == 'ER_DUP_ENTRY'){
                callback(false);
                return;         
            }
            console.log(err);
            callback(false);
            throw err;
        }
        else {
            console.log("insert done");
            callback("ok");
        }
    });
};

exports.getInquiry=function(callback){
    console.log("getInquiry")

    callback = callback == null? nop:callback;
    
    var sql = 'SELECT * FROM tbl_inquiry';
    query(sql, function(err, rows, fields) {
        if (err) {
            callback(null);
            throw err;
        }
        else {
            console.log(rows);
            if(rows.length == 0){
                callback(null);
                return;
            }    
            callback(rows);
        }
    }); 

}
exports.getBanner=function(callback){
    console.log("tbl_banner")

    callback = callback == null? nop:callback;
    
    var sql = 'SELECT * FROM tbl_banner';
    query(sql, function(err, rows, fields) {
        if (err) {
            callback(null);
            throw err;
        }
        else {
            console.log(rows);
            if(rows.length == 0){
                callback(null);
                return;
            }    
            callback(rows);
        }
    }); 

}
exports.getQuotation=function(callback){
    console.log("getQuotationgetQuotationgetQuotation")

    callback = callback == null? nop:callback;
    
    var sql = 'SELECT * FROM tbl_estimates';
    query(sql, function(err, rows, fields) {
        if (err) {
            callback(null);
            throw err;
        }
        else {
            console.log(rows);
            if(rows.length == 0){
                callback(null);
                return;
            }    
            callback(rows);
        }
    }); 

}
exports.checkEmail = function(field, callback){
    console.log("ccccacsdcsdcsdc email select start"+field.email);
    callback = callback == null? nop:callback;
    
    var sql = 'SELECT * FROM tbl_users WHERE email="'+field.email+'"';
    console.log(field.email);
    query(sql, function(err, rows, fields) {
        if (err) {
            callback(null);
            throw err;
        }
        else {
            console.log(rows);
            if(rows.length == 0){
                callback(null);
                return;
            }    
            callback(rows[0]);
        }
    }); 
};


exports.createUser = function(data, callback){
    callback = callback == null? nop:callback;
    if(data == null ) {
        callback(false);
        return;
    }
    console.log(data);
    var sql = 'INSERT INTO tbl_users( email, password, type, login_type, reg_time) VALUES("'
        +data.email+'", PASSWORD("'+data.password+'"), "'+data.type+'", "'+data.login_type+'", NOW() )';
    
    query(sql, function(err, rows, fields) {
        if (err) {
            if(err.code == 'ER_DUP_ENTRY'){
                callback(false);
                return;         
            }
            console.log(err);
            callback(false);
            throw err;
        }
        else {
            console.log("insert done");
            callback(rows.insertId);
        }
    });
};

exports.deleteUser = function(id, callback){
    callback = callback == null? nop:callback;
    if(id == null || id < 1) {
        callback(false);
        return;
    }
    
    var sqlList = 'DELETE FROM tbl_users WHERE id="'+id+'";';
    sqlList += ' DELETE FROM tbl_contract WHERE comp_id="'+id+'";'; 
        
    exports.multi_query(sqlList, 2, function(ret) {
        if(ret != null) {
            callback(true);
        }
    });
};

exports.getUserInfoById = function(id, callback){
    console.log("getUserInfoById")
    callback = callback == null? nop:callback;
    if(id == null || id < 1) {
        callback(null);
        return;
    }

    var sql = 'SELECT * FROM tbl_users WHERE id="'+id+'"';
    
    query(sql, function(err, rows, fields) {
        if (err) {
            callback(null);
            throw err;
        }
        else {
            if(rows.length == 0){
                callback(null);
                return;
            }    
            callback(rows[0]);
        }
    }); 
};

exports.getUserInfoList = function(callback){
    var sql = 'SELECT * FROM tbl_users ORDER BY id';    
    query(sql, function(err, rows, fields) {
        if (err) {
            callback(null);
            throw err;
        }
        else {
            if(rows.length == 0){
                callback(null);
                return;
            }    
            callback(rows);
        }
    }); 
};

exports.updateTable = function(data, callback){
    callback = callback == null? nop:callback;
    if(data == null) {
        callback(false);
        return;
    }
    
    var sql = 'UPDATE tbl_users SET `'+data.field+'`="'+data.value+'" WHERE id="'+data.user_id+'"';
    
    query(sql, function(err, rows, fields) {
        if (err) {
            if(err.code == 'ER_DUP_ENTRY'){
                callback(false);
                return;         
            }
            callback(false);
            throw err;
        }
        else {
            callback(true);            
        }
    });
};
// 파트너정보 업데이트
exports.updatePartnerData = function(data, callback){
    callback = callback == null? nop:callback;
    if(data == null) {
        callback(false);
        return;
    }
    var sql = 'UPDATE tbl_users SET `company_name`="'+data.comp_name+'", '+'`address`="'+data.address+'", '+'`contact`="'+data.contact+'", '+'`hp_num`="'+data.hp_num+'", ';
        sql += '`clerk`="'+data.clerk+'", `bank_name`="'+data.bank_name+'", ';
        sql += '`bank_num`="'+data.bank_num+'", '+'`tax_email`="'+data.tax_email+'", '+'`tax_clerk`="'+data.tax_clerk+'" ';
        sql += 'WHERE email="'+data.email+'"';
    
    query(sql, function(err, rows, fields) {
        if (err) {
            if(err.code == 'ER_DUP_ENTRY'){
                callback(false);
                return;         
            }
            callback(false);
            throw err;
        }
        else {
            callback(true);            
        }
    });
};
exports.updateUserLicences = function(data, callback){
    callback = callback == null? nop:callback;
    if(data == null) {
        callback(false);
        return;
    }
    var sql = 'UPDATE tbl_users SET `'+data.field+'`="'+data.url+'" WHERE email="'+data.email+'"';
    
    query(sql, function(err, rows, fields) {
        if (err) {
            if(err.code == 'ER_DUP_ENTRY'){
                callback(false);
                return;         
            }
            callback(false);
            throw err;
        }
        else {
            callback(true);            
        }
    });
};

exports.updatePassword = function(email, value, callback){
    callback = callback == null? nop:callback;
    if( value == null || email == null) {
        callback(false);
        return;
    }
    
    var sql = 'UPDATE tbl_users SET `password`=PASSWORD("'+value+'") WHERE email="'+email+'"';
    
    query(sql, function(err, rows, fields) {
        if (err) {
            if(err.code == 'ER_DUP_ENTRY'){
                callback(false);
                return;         
            }
            callback(false);
            throw err;
        }
        else {
            callback(true);            
        }
    });
};

/********************logic*************************/

exports.getTerm = function(data, callback){
    callback = callback == null? nop:callback;
    if(data == null) {
        callback(false);
        return;
    }
    var sql = 'SELECT term FROM tbl_terms where type="'+data.type+'"';
    query(sql, function(err, rows, fields) {
        if (err) {
            callback(null);
            throw err;
        }
        else {
            if(rows.length == 0){
                callback(null);
                return;
            }    
            callback(rows[0]);
        }
    }); 
};
exports.updateNormalMem = function(data, callback){
    callback = callback == null? nop:callback;
    if(data == null) {
        callback(false);
        return;
    }
    
    var sql = 'UPDATE tbl_users SET `name`="'+data.name+'", '+'`address`="'+data.address+'", '+'`contact`="'+data.contact+'", '+'`month_fee`="'+data.month_fee+'"';
    sql += ' WHERE email="'+data.email+'"';
    
    query(sql, function(err, rows, fields) {
        if (err) {
            if(err.code == 'ER_DUP_ENTRY'){
                callback(false);
                return;         
            }
            callback(false);
            throw err;
        }
        else {
            callback(true);            
        }
    });
};

exports.addNormalAnalyse = function(data, callback){
    callback = callback == null? nop:callback;
    if(data == null ) {
        callback(false);
        return;
    }
    
    var sql = 'INSERT INTO tbl_analyse ( user_id, email, name, address, contact, month_fee, reg_time) VALUES';
    sql += '("'+data.user_id+'","'+data.email+'","'+data.name+'","'+data.address+'","'+data.contact+'","'+data.month_fee+'", NOW() )';
    
    query(sql, function(err, rows, fields) {
        if (err) {
            if(err.code == 'ER_DUP_ENTRY'){
                callback(false);
                return;         
            }
            callback(false);
            throw err;
        }
        else {
            callback(rows.insertId);
        }
    });
};
// 분석의뢰정보얻기 from userID
exports.getAnalyseByUserId = function(user_id, callback){
    callback = callback == null? nop:callback;
    if(user_id == null ) {
        callback(false);
        return;
    }
    var sql = 'SELECT * FROM tbl_analyse WHERE user_id="'+user_id+'"';
    
    query(sql, function(err, rows, fields) {
        if (err) {
            callback(null);
            throw err;
        }
        else {
            if(rows.length == 0){
                callback(null);
                return;
            }    
            callback(rows);
        }
    }); 
};
// 분석의뢰정보얻기 from ID
exports.getAnalyseById = function(id, callback){
    callback = callback == null? nop:callback;
    if(id == null ) {
        callback(false);
        return;
    }
    var sql = 'SELECT * FROM tbl_analyse WHERE id="'+id+'"';
    
    query(sql, function(err, rows, fields) {
        if (err) {
            callback(null);
            throw err;
        }
        else {
            if(rows.length == 0){
                callback(null);
                return;
            }    
            callback(rows[0]);
        }
    }); 
};
// 분석의뢰결과얻기
exports.getAnalyseResultById = function(analyse_id, callback){
    callback = callback == null? nop:callback;
    if(analyse_id == null ) {
        callback(false);
        return;
    }
    var sql = 'SELECT R.*, A.address FROM tbl_analyse_result as R left join tbl_analyse as A on R.analyse_id=A.id WHERE R.analyse_id="'+analyse_id+'"';
    
    query(sql, function(err, rows, fields) {
        if (err) {
            callback(null);
            throw err;
        }
        else {
            if(rows.length == 0){
                callback(null);
                return;
            }    
            callback(rows[0]);
        }
    }); 
};
// 참여업체정보얻기 GET ALL
exports.getCompanyDataByAnalId = function(analyse_id, callback){
    callback = callback == null? nop:callback;
    console.log("getcomapnydatabyanlId")
    console.log(analyse_id)
    if(analyse_id == null ) {
        callback(false);
        return;
    }
    var sql = 'SELECT C.*, U.company_name,A.*, ';
        sql += '(SELECT ROUND(AVG(R.rate), 1) FROM `tbl_rating` AS R WHERE R.comp_id=C.comp_id) AS rate ';
        sql += 'FROM `tbl_contract` AS C LEFT JOIN tbl_users AS U ON C.comp_id=U.id LEFT JOIN tbl_analyse AS A ON A.id=C.analyse_id ';
        sql += 'WHERE C.analyse_id="'+analyse_id+'" AND C.ranking>0 AND A.rank_flag="1" ORDER BY C.ranking ASC';
    
    query(sql, function(err, rows, fields) {
        if (err) {
            callback(null);
            throw err;
        }
        else {
            if(rows.length == 0){
                callback(null);
                return;
            }    
            callback(rows);
        }
    }); 
};
// 참여업체정보얻기//(계약&평가 정보얻기)
exports.getCompanyDataByCompId = function(data, callback){
    callback = callback == null? nop:callback;
    console.log("result get is : ");
    console.log(data.comp_id);
    console.log(data.analyse_id);
    if(data == null ) {
        callback(false);
        return;
    }
    /**
     * 
     * SELECT C.*, U.company_name, (SELECT ROUND(AVG(R.rate), 1) FROM `tbl_rating` AS R WHERE R.comp_id=C.comp_id AND analyse_id="'+data.analyse_id+'") AS rate
     * FROM `tbl_contract` AS C LEFT JOIN tbl_users AS U ON C.comp_id=U.id WHERE C.comp_id="'+data.comp_id+'" AND analyse_id="'+data.analyse_id
     */
    var sql = 'SELECT C.*, U.company_name, ';
        sql += '(SELECT ROUND(AVG(R.rate), 1) FROM `tbl_rating` AS R WHERE R.comp_id=C.comp_id AND analyse_id="'+data.analyse_id+'") AS rate ';
        sql += 'FROM `tbl_contract` AS C LEFT JOIN tbl_users AS U ON C.comp_id=U.id WHERE C.comp_id="'+data.comp_id+'" AND analyse_id="'+data.analyse_id+'"';
    query(sql, function(err, rows, fields) {
        if (err) {
            callback(null);
            throw err;
        }
        else {
            if(rows.length == 0){
                callback(null);
                return;
            }    
            callback(rows[0]);
        }
    }); 
};
// 참여업체 상세정보얻기
exports.getCompanyDetail = function(comp_id, callback){
    callback = callback == null? nop:callback;
    if(comp_id == null ) {
        callback(false);
        return;
    }
    var sql  = 'SELECT C.*, U.company_name,U.area, U.address, U.elect_num, AR.solar_power, ';
        sql += '(SELECT ROUND(AVG(R.rate), 1) FROM `tbl_rating` AS R WHERE R.comp_id=C.comp_id) AS rate ';
        sql += 'FROM `tbl_contract` AS C LEFT JOIN tbl_users AS U ON C.comp_id=U.id LEFT JOIN tbl_analyse_result AS AR ON C.analyse_id=AR.analyse_id ';
        sql += 'WHERE C.comp_id="'+comp_id+'"';
    
    query(sql, function(err, rows, fields) {
        if (err) {
            callback(null);
            throw err;
        }
        else {
            if(rows.length == 0){
                callback(null);
                return;
            }    
            callback(rows[0]);
        }
    }); 
};
// 견적관리정보얻기
exports.getContractInfoData = function( callback ){
    callback = callback == null? nop:callback;
    
    var sql = 'SELECT * FROM tbl_contract_info';
    
    query(sql, function(err, rows, fields) {
        if (err) {
            callback(null);
            throw err;
        }
        else {
            if(rows.length == 0){
                callback(null);
                return;
            }    
            callback(rows[0]);
        }
    }); 
};
//status 를 4 설치완료로 변경하기 
exports.updateInstallStatus = function(data, callback){

    console.log("updateInstallStatus comemememe"+data.analyse_id);
    callback = callback == null? nop:callback;
    if(data == null) {
        callback(false);
        return;
    }
    
    var sql = 'UPDATE tbl_analyse SET `status`="4" WHERE id="'+data.analyse_id+'"';
    query(sql, function(err, rows, fields) {
        if (err) {
            if(err.code == 'ER_DUP_ENTRY'){
                callback(false);
                return;         
            }
            callback(false);
            throw err;
        }
        else {
            callback(true);            
        }
    });
};

// 분석상태 변경
exports.updateAnalyseData = function(data, callback){
    callback = callback == null? nop:callback;
    if(data == null) {
        callback(false);
        return;
    }
    
    var sql = 'UPDATE tbl_analyse SET `'+data.field+'`="'+data.value+'" WHERE id="'+data.analyse_id+'"';
    query(sql, function(err, rows, fields) {
        if (err) {
            if(err.code == 'ER_DUP_ENTRY'){
                callback(false);
                return;         
            }
            callback(false);
            throw err;
        }
        else {
            callback(true);            
        }
    });
};
// 분석상태(계약일&설치희망일) 변경
exports.updateAnalyseDates = function(data, callback){
    callback = callback == null? nop:callback;
    if(data == null) {
        callback(false);
        return;
    }
    
    var sql = 'UPDATE tbl_analyse SET `ins_hope_time`="'+data.installDay+'", `contract_time`=NOW() WHERE id="'+data.analyse_id+'"';
    
    query(sql, function(err, rows, fields) {
        if (err) {
            if(err.code == 'ER_DUP_ENTRY'){
                callback(false);
                return;         
            }
            callback(false);
            throw err;
        }
        else {
            callback(true);            
        }
    });
};
// 계약회사의(계약일&설치예정일&설치완료일) 변경
exports.updateContDates = function(data, callback){
    callback = callback == null? nop:callback;
    if(data == null) {
        callback(false);
        return;
    }
    
    var sql = 'UPDATE tbl_contract SET `ins_exp_time`="'+data.ins_exp_time+'", `ins_comp_time`="'+data.ins_comp_time+'", `contract_time`=NOW() WHERE id="'+data.cont_id+'"';
    
    query(sql, function(err, rows, fields) {
        if (err) {
            if(err.code == 'ER_DUP_ENTRY'){
                callback(false);
                return;         
            }
            callback(false);
            throw err;
        }
        else {
            callback(true);            
        }
    });
};
// 견적정보 변경
exports.updateContractDatesByCompID = function(data, callback){
    callback = callback == null? nop:callback;
    if(data == null) {
        callback(false);
        return;
    }
    
    var sql = 'UPDATE tbl_contract SET `'+data.field+'`="'+data.value+'" WHERE comp_id="'+data.comp_id+'"';
    
    query(sql, function(err, rows, fields) {
        if (err) {
            if(err.code == 'ER_DUP_ENTRY'){
                callback(false);
                return;         
            }
            callback(false);
            throw err;
        }
        else {
            callback(true);            
        }
    });
};
// rating 변경
exports.addContDates = function(data, callback){
    callback = callback == null? nop:callback;
    if(data == null) {
        callback(false);
        return;
    }
    
    var sql = 'INSERT INTO tbl_rating ( user_id, comp_id, analyse_id, rate) VALUES';
    sql += '("'+data.user_id+'","'+data.comp_id+'","'+data.analyse_id+'","'+data.rate+'" )';

    query(sql, function(err, rows, fields) {
        if (err) {
            if(err.code == 'ER_DUP_ENTRY'){
                callback(false);
                return;         
            }feffdfaffdfdfsfs
            callback(false);
            throw err;
        }
        else {
            callback(true);            
        }
    });
};
///////////////// 파트너's ///////////////// 
// 요청 견적얻기
exports.getAnalyseData = function(data,  callback ){
    console.log("getanalyseDataaaaaaaa come");
    console.log(data);
    callback = callback == null? nop:callback;
    if(data == null ) {
        callback(false);
        return;
    }
    var sql = 'SELECT B.* FROM (SELECT  A.*, (SELECT COUNT(*) FROM tbl_contract WHERE analyse_id=A.id AND comp_id = "'+data.comp_id+'") AS cnt ';
        sql += 'FROM tbl_analyse AS A WHERE A.analyse_status = "1" AND A.quote_status = "1" AND A.cont_comp_id = "0") AS B WHERE B.cnt="0" ORDER BY B.id';
    query(sql, function(err, rows, fields) {
        if (err) {
            callback(null);
            throw err;
        }
        else {
            
            if(rows.length == 0){
                callback(null);
                return;
            }    
            console.log("resulttttttt is ");
            callback(rows);
        }
    }); 
};
// 제출한 견적얻기
exports.getSubmitContract = function(data, callback){
    callback = callback == null? nop:callback;
    if(data == null ) {
        callback(false);
        return;
    }
    var sql = 'SELECT A.address, A.month_fee, A.reg_time, C.reg_time AS submit_cont_time, C.id, A.id AS analyse_id FROM tbl_contract AS C LEFT JOIN tbl_analyse AS A ON A.id=C.analyse_id ';
        sql += 'WHERE C.comp_id="'+data.comp_id+'" AND A.status="1" ';
    query(sql, function(err, rows, fields) {
        if (err) {
            callback(null);
            throw err;
        }
        else {
            if(rows.length == 0){
                callback(null);
                return;
            }    
            callback(rows);
        }
    }); 
};
// 계약 견적얻기
exports.getAgreeContract = function(data, callback){
    callback = callback == null? nop:callback;
    if(data == null ) {
        callback(false);
        return;
    }
    var sql = 'SELECT A.* , C.id, A.id AS analyse_id FROM tbl_contract AS C LEFT JOIN tbl_analyse AS A ON A.id=C.analyse_id ';
        sql += 'WHERE C.comp_id="'+data.comp_id+'" AND A.cont_comp_id="'+data.comp_id+'" AND A.status="2" ';
    query(sql, function(err, rows, fields) {
        if (err) {
            callback(null);
            throw err;
        }
        else {
            if(rows.length == 0){
                callback(null);
                return;
            }    
            callback(rows);
        }
    }); 
};
// 설치완료 견적얻기
exports.getCompleteContract = function(data, callback){
    console.log("getCompleteContract come")
    console.log(data);
    callback = callback == null? nop:callback;
    if(data == null ) {
        callback(false);
        return;
    }
    var sql = 'SELECT A.address, A.month_fee, A.reg_time, C.contract_time, C.id, A.id AS analyse_id,A.status FROM tbl_contract AS C LEFT JOIN tbl_analyse AS A ON A.id=C.analyse_id ';
        // sql += 'WHERE C.comp_id="'+data.comp_id+'" AND A.cont_comp_id="'+data.comp_id+'" AND C.contract_time IS NOT NULL AND C.ins_comp_time IS NOT NULL AND A.status="4"';
        sql += 'WHERE C.comp_id="'+data.comp_id+'" AND A.cont_comp_id="'+data.comp_id+'" AND A.status="4"';
    query(sql, function(err, rows, fields) {
        console.log("getCompleteContract query started")
        if (err) {
            callback(null);
            throw err;
        }
        else {
            if(rows.length == 0){
                callback(null);
                return;
            }    
            console.log(rows);
            console.log("row printing....");
            callback(rows);
        }
    }); 
};
//  ///////////////////////////
// 견적제출
exports.setSubmitContract = function(data, callback){
    callback = callback == null? nop:callback;
    if(data == null ) {
        callback(false);
        return;
    }
    
    var sql = 'INSERT INTO tbl_contract ( analyse_id, comp_id, person, price, module_name, inv_name, quality, module_guarent, inv_guarent, as_guide, final_price, reg_time) VALUES';
    sql += '("'+data.analyse_id+'","'+data.comp_id+'","'+data.person+'","'+data.price+'","'+data.module_name+'","'+data.inv_name+'", ';
    sql += '"'+data.quality+'","'+data.module_guarent+'","'+data.inv_guarent+'","'+data.as_guide+'","'+data.final_price+'", NOW() )';
    
    query(sql, function(err, rows, fields) {
        if (err) {
            if(err.code == 'ER_DUP_ENTRY'){
                callback(false);
                return;         
            }
            callback(false);
            throw err;
        }
        else {
            callback(rows.insertId);
        }
    });
};
// 제출한 견적얻기
exports.getContractById = function(id, callback){
    callback = callback == null? nop:callback;
    if(id == null ) {
        callback(false);
        return;
    }
    var sql  = 'SELECT * FROM `tbl_contract` WHERE id="'+id+'"';
    
    query(sql, function(err, rows, fields) {
        if (err) {
            callback(null);
            throw err;
        }
        else {
            if(rows.length == 0){
                callback(null);
                return;
            }    
            callback(rows[0]);
        }
    }); 
};
// exports.getQuotStatus = function(data, callback){
//     callback = callback == null? nop:callback;
//     if(data == null ) {
//         callback(false);
//         return;
//     }
//     var sql = 'SELECT A.name, A.ins_hope_time, C.price, C.cont_price, C.contract_path, C.contract_time, C.id, C.analyse_id, C.pay_flag, C.pay_time, C.custom_replay, ';
//         sql += '(SELECT ROUND(AVG(R.rate), 1) FROM `tbl_rating` AS R WHERE R.comp_id=C.comp_id AND analyse_id="'+data.analyse_id+'") AS rate ';
//         sql += 'FROM tbl_contract AS C LEFT JOIN tbl_analyse AS A ON A.id=C.analyse_id WHERE C.id="'+data.cont_id+'"';
//     query(sql, function(err, rows, fields) {
//         if (err) {
//             callback(null);
//             throw err;
//         }
//         else {
//             if(rows.length == 0){
//                 callback(null);
//                 return;
//             }    
//             callback(rows[0]);
//         }
//     }); 
// };
// 진행현황 / 계약 정보보기
exports.getQuotStatus = function(data, callback){
    console.log("getQuotStatus")
    console.log(data.analyse_id);
    console.log(data.cont_id);
    callback = callback == null? nop:callback;
    if(data == null ) {
        callback(false);
        return;
    }
    var sql = 'SELECT A.name, A.ins_hope_time, C.price, C.cont_price, A.contract_path, C.contract_time, C.id, C.analyse_id, C.pay_flag, C.pay_time, C.custom_replay, ';
        sql += '(SELECT ROUND(AVG(R.rate), 1) FROM `tbl_rating` AS R WHERE R.comp_id=C.comp_id AND analyse_id="'+data.analyse_id+'") AS rate ';
        sql += 'FROM tbl_contract AS C LEFT JOIN tbl_analyse AS A ON A.id=C.analyse_id WHERE C.id="'+data.cont_id+'"';
    query(sql, function(err, rows, fields) {
        if (err) {
            callback(null);
            throw err;
        }
        else {
            if(rows.length == 0){
                callback(null);
                return;
            }    
            callback(rows[0]);
        }
    }); 
};
/*********************************************/
exports.query = query;