var baseTemplate;
var contentsTemplate;

function loadPage(baseTemplateUrl,contentsTemplateUrl,initScriptUrl){
    var reqBase=new XMLHttpRequest();
    reqBase.onload=function(){
	if(reqBase.readyState==4){
	    baseTemplate=reqBase.responseText;
	    var reqContents=new XMLHttpRequest();
	    reqContents.onload=function(){
		if(reqContents.readyState==4){
		    contentsTemplate=reqContents.responseText;
		    showPage();
		}
	    }
	    reqContents.open("GET",contentsTemplateUrl,true);
	    reqContents.send();
	}
    }
    reqBase.open("GET",baseTemplateUrl,true);
    reqBase.send();
}

function showPage(){
    document.getElementsByTagName("body")[0].innerHTML=new EJS({text:baseTemplate}).render({});
    document.getElementsByTagName("main")[0].innerHTML=new EJS({text:contentsTemplate}).render({});
    highlightCurrentPage();
    // execution of scripts embedded in template
    var scriptList=document.getElementsByTagName("body")[0].getElementsByTagName("script");
    for(var i=0;i<scriptList.length;i++){
	eval(scriptList[i].innerHTML);
    }
}

function highlightCurrentPage(){
    var currentPage=window.location.href;
    var menuListElms=document.getElementById("menuList").getElementsByTagName("li");
    for(var i=0;i<menuListElms.length;i++){
	var menuNode=menuListElms[i];
	if(menuNode.getElementsByTagName("a")[0].href==currentPage){
	    menuNode.className="selected";
	}
    }
}

function invokeGeneralSearch(boxElmId,resultElmId){
    var elm=document.getElementById(boxElmId);
    var keyword=elm.value;
    if(keyword!=""){
	elm.blur();
	alert("Not implemented yet");
    }
}
