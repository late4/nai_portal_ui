var timezones=[
    {"abbr":"+09:00","name":"JST","default":"true"},
    {"abbr":"Z","name":"UTC"}
];

function initTimezoneSelector(elmName,firstSelect){
    if(typeof firstSelect=="undefined"){
	firstSelect="Z";
    }
    var firstSelectHit=false;
    var options="";
    for(var i=0;i<timezones.length;i++){
	if(timezones[i]["abbr"]==firstSelect){
	    options+="<option value=\""+timezones[i]["abbr"]+"\" selected>"+timezones[i]["abbr"]+" : "+timezones[i]["name"]+"</option>";
	    firstSelectHit=true;
	}else{
	    options+="<option value=\""+timezones[i]["abbr"]+"\">"+timezones[i]["abbr"]+" : "+timezones[i]["name"]+"</option>";
	}
    }
    if(!firstSelectHit){
	var options="";
	for(var i=0;i<timezones.length;i++){
	    if(timezones[i]["default"]=="true"){
		options+="<option value=\""+timezones[i]["abbr"]+"\" selected>"+timezones[i]["abbr"]+" : "+timezones[i]["name"]+"</option>";
		firstSelectHit=true;
	    }else{
		options+="<option value=\""+timezones[i]["abbr"]+"\">"+timezones[i]["abbr"]+" : "+timezones[i]["name"]+"</option>";
	    }
	}
    }
    document.getElementById(elmName).innerHTML+=options;
}

function getCurrentTimezone(){
    var offset=new Date().getTimezoneOffset();
    if(offset==0){
	return "Z";
    }
    var sign;
    if(offset<0){
	offset=-offset;
	sign="+";
    }else{
	sign="-";
    }
    var h=Math.floor(offset/60);
    var m=offset%60;
    if(h<10){
	h="0"+h.toString();
    }else{
	h=h.toString();
    }
    if(m<10){
	m="0"+m.toString();
    }else{
	m=m.toString();
    }
    return sign+h+":"+m;
}

function convertDateObjToString(date,timezone){
    var offsetToUTC=date.getTimezoneOffset();
    var offsetToTimezone=parseTimezoneToMinutes(timezone);
    date.setMinutes(date.getMinutes()+offsetToUTC+offsetToTimezone);
    var year=date.getYear()+1900;
    var mon=date.getMonth()+1;
    var day=date.getDate();
    var hour=date.getHours();
    var min=date.getMinutes();
    var sec=date.getSeconds();
    return year+"-"+("0"+mon).slice(-2)+"-"+("0"+day).slice(-2)+" "+("0"+hour).slice(-2)+":"+("0"+min).slice(-2)+":"+("0"+sec).slice(-2)+" "+timezone;
}

function convertTimeStringToSpecifiedTimezone(str,timezone){
    var date=new Date(str);
    return convertDateObjToString(date,timezone);
}

function parseTimezoneToMinutes(timezone){
    if(timezone=="Z"){
	return 0;
    }else{
	var minutes=Number(timezone.substring(1,3))*60+Number(timezone.substring(4,6));
	if(timezone[0]=="-"){
	    minutes=-minutes;
	}
	return minutes;
    }
}
