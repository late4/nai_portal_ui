var data=[];

var elmId;
var templateUrl;
var dataUrl;
var template;

function initList(_elmId,_templateUrl,_dataUrl){
    elmId=_elmId;
    templateUrl=_templateUrl;
    dataUrl=_dataUrl;
    var reqTemplate=new XMLHttpRequest();
    reqTemplate.onload=function(){
	if(reqTemplate.readyState==4){
	    template=reqTemplate.responseText;
	    var reqData=new XMLHttpRequest();
	    reqData.onload=function(){
		if(reqData.readyState==4){
		    data=JSON.parse(reqData.responseText);
		    showList();
		}
	    }
	    reqData.open("GET",dataUrl,true);
	    reqData.send();
	}
    }
    reqTemplate.open("GET",templateUrl,true);
    reqTemplate.send();
}

function showList(){
    var listElm=document.getElementById(elmId);
    listElm.innerHTML=new EJS({text:template}).render({data:data,startIndex:0,count:Infinity});    
}

function requestDataWithOptions(opt){
    alert("Not implemented yet");
}
