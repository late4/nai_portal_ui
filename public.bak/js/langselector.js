var languages=[
    {"abbr":"Multi","name":"Multiple languages"},
    {"abbr":"ja-JP","name":"Japanese"},
    {"abbr":"en-US","name":"English(US)"},
    {"abbr":"en-GB","name":"English(UK)"},
    {"abbr":"zh-TW","name":"Chinese(Traditional)"},
    {"abbr":"zh-CN","name":"Chinese(Simplified)"}
];

function initLanguageSelector(elmName,firstSelect){
    if(typeof firstSelect=="undefined"){
	firstSelect="";
    }
    var options="";
    for(var i=0;i<languages.length;i++){
	if(languages[i]["abbr"]==firstSelect){
	    options+="<option value=\""+languages[i]["abbr"]+"\" selected>"+languages[i]["abbr"]+" : "+languages[i]["name"]+"</option>";
	}else{
	    options+="<option value=\""+languages[i]["abbr"]+"\">"+languages[i]["abbr"]+" : "+languages[i]["name"]+"</option>";
	}
    }
    document.getElementById(elmName).innerHTML+=options;
}
