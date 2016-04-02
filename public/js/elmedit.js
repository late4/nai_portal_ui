function disableElmEdit(){
    var editableElms=document.getElementsByClassName("elmedit_editable");
    for(var i=0;i<editableElms.length;i++){
	editableElms[i].onclick=function(){};
    }    
}

function enableElmEdit(){
    var i;
    var editableElms=document.getElementsByClassName("elmedit_editable");
    for(i=0;i<editableElms.length;i++){
	editableElms[i].onclick=function(){
	    editableElmEditMode(this);
	    event.stopPropagation();
	};
	var editorElms=editableElms[i].getElementsByClassName("elmedit_editor");
	if(editorElms.length!=0){
	    editorElms[0].onkeypress=function(){
		if(event.keyCode==13){
		    if(this.tagName!="TEXTAREA" && this.tagName!="textarea"){
			editableElmViewMode(this.parentNode);
		    }
		}
	    };
	    editorElms[0].onkeydown=function(){
		if(event.keyCode==9){
		    moveToNextEditableElm(this.parentNode);
		    event.preventDefault();
		    event.stopPropagation();
		}
	    };
	    editorElms[0].onclick=function(){event.stopPropagation();};
	    editorElms[0].onblur=function(){editableElmViewMode(this.parentNode);};
	    editorElms[0].onchange=function(){editableElmValueChanged(this.parentNode)};
	}
    }
    var reqRecalcElms=document.getElementsByClassName("elmedit_reqrecalc");
    for(i=0;i<reqRecalcElms.length;i++){
	recalcElmValue(reqRecalcElms[i]);
    }
}

function editableElmEditMode(elm){
    var viewElms=elm.getElementsByClassName("elmedit_view");
    for(var i=0;i<viewElms.length;i++){
	viewElms[i].style="display:none;"
    }
    var editorElms=elm.getElementsByClassName("elmedit_editor");
    if(editorElms.length!=0){
	editorElms[0].style="display:inline;"
	editorElms[0].focus();
    }
}

function editableElmViewMode(elm){
    var viewElms=elm.getElementsByClassName("elmedit_view");
    for(var i=0;i<viewElms.length;i++){
	viewElms[i].style="display:inline;"
    }
    var editorElms=elm.getElementsByClassName("elmedit_editor");
    if(editorElms.length!=0){
	editorElms[0].style="display:none;"
    }
}

function moveToNextEditableElm(elm){
    var editableElms=document.getElementsByClassName("elmedit_editable");
    var currentIndex=-1;
    for(var i=0;i<editableElms.length;i++){
	if(editableElms[i]==elm){
	    currentIndex=i;
	}
    }
    if(currentIndex!=-1){
	editableElmViewMode(editableElms[currentIndex]);
	editableElmEditMode(editableElms[(currentIndex+1)%editableElms.length]);
    }
}

function editableElmValueChanged(elm){
    var i;
    var editorElm=elm.getElementsByClassName("elmedit_editor")[0];
    var editorTagName=editorElm.tagName;
    var newValue;
    switch(editorTagName){
    case "input":
    case "INPUT":
    case "textarea":
    case "TEXTAREA":
	newValue=editorElm.value;
	break;
    case "select":
    case "SELECT":
	var options=editorElm.options;
	for(i=0;i<options.length;i++){
	    if(options[i].selected){
		newValue=options[i].value;
	    }
	}
	break;
    default:
	newValue="";
	break;
    }
    var validationElms=elm.getElementsByClassName("elmedit_validation");
    for(i=0;i<validationElms.length;i++){
	var validationResult=eval(validationElms[i].innerHTML);
	if(!validationResult){
	    return;
	}
    }
    var viewTemplateElms=elm.getElementsByClassName("elmedit_viewtemplate");
    var viewContent;
    if(viewTemplateElms.length!=0){
	viewContent=eval(viewTemplateElms[0].innerHTML);
    }else{
	viewContent=newValue;
    }
    var viewElms=elm.getElementsByClassName("elmedit_view");
    for(i=0;i<viewElms.length;i++){
	viewElms[i].innerHTML=viewContent;
    }
    var dataSourceElms=elm.getElementsByClassName("elmedit_datasource");
    for(i=0;i<dataSourceElms.length;i++){
	eval(dataSourceElms[i].innerHTML+"=newValue;");
    }
    var evalOnChangeElms=elm.getElementsByClassName("elmedit_evalonchange");
    for(i=0;i<evalOnChangeElms.length;i++){
	eval(evalOnChangeElms[i].innerHTML);
    }
    var reqRecalcElms=document.getElementsByClassName("elmedit_reqrecalc");
    for(i=0;i<reqRecalcElms.length;i++){
	recalcElmValue(reqRecalcElms[i]);
    }
}

function recalcElmValue(elm){
    var recalcStatement=elm.getElementsByClassName("elmedit_recalcstatement")[0].innerHTML;
    var viewTemplate="";
    var templateElms=elm.getElementsByClassName("elmedit_viewtemplate");
    if(templateElms.length!=0){
	viewTemplate=templateElms[0].innerHTML;
    }else{
	viewTemplate="newValue";
    }
    var newValue=eval(recalcStatement);
    var viewContent=eval(viewTemplate);
    var viewElms=elm.getElementsByClassName("elmedit_view");
    for(var i=0;i<viewElms.length;i++){
	viewElms[i].innerHTML=viewContent;
    }
}
