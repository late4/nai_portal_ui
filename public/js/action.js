var actions=[
    {
	"abbr":"OrderD",
	"name":"Order (deferred payment)",
	"role":"client"
    },
    {
	"abbr":"OrderP",
	"name":"Order (prepayment)",
	"role":"client"
    },
    {
	"abbr":"TR",
	"name":"Translation",
	"role":"worker"
    },
    {
	"abbr":"QAS",
	"name":"Quality assurance",
	"role":"worker"
    },
    {
	"abbr":"Deliv",
	"name":"Delivery",
	"role":"client"
    },
    {
	"abbr":"INS",
	"name":"Inspection",
	"role":"client"
    }
];

function initActionSelector(elmName,firstSelect){
    if(typeof firstSelect=="undefined"){
	firstSelect="";
    }
    var options="";
    for(var i=0;i<actions.length;i++){
	if(actions[i]["abbr"]==firstSelect){
	    options+="<option value=\""+actions[i]["abbr"]+"\" selected>"+actions[i]["abbr"]+" : "+actions[i]["name"]+"</option>";
	}else{
	    options+="<option value=\""+actions[i]["abbr"]+"\">"+actions[i]["abbr"]+" : "+actions[i]["name"]+"</option>";
	}
    }
    document.getElementById(elmName).innerHTML+=options;
}

function getRoleForAction(action){
    for(var i=0;i<actions.length;i++){
	if(actions[i]["abbr"]==action){
	    return actions[i]["role"];
	}
    }
    return undefined;
}
