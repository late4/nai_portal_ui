var nimonoEndpoint="https://naiportal-html5-late4.c9users.io/req";

function callNimonoAPI(className,methodName,param,callback){
    var sessionId=localStorage.getItem("sessionId");
    if(sessionId==null || typeof(sessionId)=="undefined"){
        sessionId="";
    }
    var requestBody=JSON.stringify({
        "className":className,
        "methodName":methodName,
        "paramJSON":JSON.stringify(param),
        "sessionId":sessionId
    });
    var req=new XMLHttpRequest();
    req.onload=function(){
        if(req.readyState==4){
            var retObj=JSON.parse(req.responseText);
            localStorage.setItem("sessionId",retObj["sessionId"]);
            callback(retObj);
        }
    }
    req.open("POST",nimonoEndpoint,true);
    req.send(requestBody);
}
