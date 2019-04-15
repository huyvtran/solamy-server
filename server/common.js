exports.getCurrentTime = function() {
    let now_date = new Date();
    let year = now_date.getFullYear();
    let month = now_date.getMonth() + 1;
    let day = now_date.getDate();
    let hour = now_date.getHours();
    let minute = now_date.getMinutes();
    let second = now_date.getSeconds();
    month = month < 10 ? '0'+month : month;
    day = day < 10 ? '0'+day : day;
    hour = hour < 10 ? '0'+hour : hour;
    minute = minute < 10 ? '0'+minute : minute;
    second = second < 10 ? '0'+second : second;
    let date_time = year+"-"+month+"-"+day+" "+hour+":"+minute+":"+second;
    return date_time;
};

exports.getCurrentDate = function() {
    let now_date = new Date();
    let year = now_date.getFullYear();
    let month = now_date.getMonth() + 1;
    let day = now_date.getDate();    
    month = month < 10 ? '0'+month : month;
    day = day < 10 ? '0'+day : day;    
    let date = year+"-"+month+"-"+day;
    return date;
};

exports.getCorrectDate = function(str_date) {
    let now_date = new Date(str_date);
    let year = now_date.getFullYear();
    let month = now_date.getMonth() + 1;
    let day = now_date.getDate();    
    month = month < 10 ? '0'+month : month;
    day = day < 10 ? '0'+day : day;    
    let date = year+"-"+month+"-"+day;
    return date;
};

exports.getCorrectDay = function(str_date) {
    let now_date = new Date(str_date);    
    let day = now_date.getDate();    
    return day;
};

exports.getCorrectTime = function(str_date) {
    let now_date = new Date(str_date);
    let year = now_date.getFullYear();
    let month = now_date.getMonth() + 1;
    let day = now_date.getDate();
    let hour = now_date.getHours();
    let minute = now_date.getMinutes();
    let second = now_date.getSeconds();
    month = month < 10 ? '0'+month : month;
    day = day < 10 ? '0'+day : day;
    hour = hour < 10 ? '0'+hour : hour;
    minute = minute < 10 ? '0'+minute : minute;
    second = second < 10 ? '0'+second : second;
    let date_time = year+"-"+month+"-"+day+" "+hour+":"+minute+":"+second;
    return date_time;
};

exports.getDiffTime = function(minute) {    
    let diffTime = "";

    if(minute < 60)
        diffTime = minute+"분";
    else if(minute < 60*24)
        diffTime = Math.floor(minute/60)+"시간 ";
    else if(minute < 60*24*366)
        diffTime = Math.floor(minute/60/24)+"일";
    else
        diffTime = Math.floor(minute/60/24/365)+"년";
    
    return diffTime;
};