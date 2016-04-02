var elmId;
var templateUrl;
var template;
var dataUrl;
var data;

function loadCaseDetail(_elmId,_templateUrl,_dataUrl){
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
		    showContents(elmId);
		}
	    };
	    reqData.open("GET",dataUrl,true);
	    reqData.send();
	}
    }
    reqTemplate.open("GET",templateUrl,true);
    reqTemplate.send();
}

function showContents(elmId){
    document.getElementById(elmId).innerHTML=new EJS({text:template}).render({data:data});
    // execution of scripts embedded in template
    var scriptList=document.getElementById(elmId).getElementsByTagName("script");
    for(var i=0;i<scriptList.length;i++){
	eval(scriptList[i].innerHTML);
    }
}

function showTimelineView(branchId,timelineContainerId){
    var i;
    var branchnum;
    var branchdata;
    var timelinedata;
    for(i=0;i<data.length;i++){
	if(data[i]["branchid"]==branchId){
	    branchdata=data[i];
	    timelinedata=data[i]["timeline"];
	    branchnum=i;
	}
    }
    var containerElm=document.getElementById(timelineContainerId);
    containerElm.innerHTML="";
    var visjsitemarray=[];
    for(i=0;i<timelinedata.length;i++){
	var timelineHTML='<div class="nooverflow"><abbr class="'+timelinedata[i]["action"]+'">'+timelinedata[i]["action"]+'</abbr>';
	if(timelinedata[i]["role"]!="client"){
	    if(timelinedata[i]["worker"]==""){
		timelineHTML+='<button onclick="showWorkerAssignmentPanel(\''+branchId+'\','+i+');" class="nullworkerButton">&nbsp;</button>';
	    }else{
		timelineHTML+='<a href="worker/'+timelinedata[i]["worker"]+'"><button class="workerButton">'+timelinedata[i]["worker"]+'</button></a>';
	    }
	}
	timelineHTML+='</div>';
	if(timelinedata[i]["role"]=="tr" || timelinedata[i]["role"]=="qas"){
	    timelineHTML+='<div class="individualreward nooverflow"><span class="unitreward elmedit_editable"><span class="elmedit_view">@&yen;'+timelinedata[i]["unitreward"]+'</span><input class="elmedit_editor" type="number" min="0" value="'+timelinedata[i]["unitreward"]+'" style="display:none;"><span class="elmedit_datasource" style="display:none;">data['+branchnum+']["timeline"]['+i+']["unitreward"]</span><span class="elmedit_viewtemplate" style="display:none;">"@&yen;"+newValue</span></span><span class="rewardratio elmedit_editable"><span class="elmedit_view">&times;'+timelinedata[i]["rewardratio"]+'%</span><input class="elmedit_editor" type="number" min="0" value="'+timelinedata[i]["rewardratio"]+'" style="display:none;"><span class="elmedit_datasource" style="display:none;">data['+branchnum+']["timeline"]['+i+']["rewardratio"]</span><span class="elmedit_viewtemplate" style="display:none;">"&times;"+newValue+"%"</span></span><span class="totalreward elmedit_reqrecalc"><span class="elmedit_view">&yen;'+Math.floor(timelinedata[i]["unitreward"]*branchdata["wc"]*timelinedata[i]["rewardratio"]/100).toLocaleString()+'</span><span class="elmedit_recalcstatement" style="display:none;">Math.floor(data['+branchnum+']["timeline"]['+i+']["unitreward"]*data['+branchnum+']["wc"]*data['+branchnum+']["timeline"]['+i+']["rewardratio"]/100)</span><span class="elmedit_viewtemplate" style="display:none;">"&yen;"+newValue.toLocaleString()</span></span></div>';
	}else{
	    timelineHTML+='<div class="individualreward nooverflow"></div>'
	}
	if(timelinedata[i]["end"]==""){
	    timelineHTML+='<div class="datetime"><dl><dt>Start</dt><dd>'+timelinedata[i]["start"]+'</dd></dl></div>';
	    visjsitemarray.push({id:i,content:timelineHTML,start:timelinedata[i]["start"],className:timelinedata[i]["status"]});
	}else{
	    timelineHTML+='<div class="datetime"><dl><dt>Start</dt><dd>'+timelinedata[i]["start"]+'</dd><dt>End</dt><dd>'+timelinedata[i]["end"]+'</dd></dl></div>';
	    visjsitemarray.push({id:i,content:timelineHTML,start:timelinedata[i]["start"],end:timelinedata[i]["end"],className:timelinedata[i]["status"]});
	}
    }
    var items=new vis.DataSet(visjsitemarray);
    var options={
	margin:0,
	selectable:false
    };
    var timeline=new vis.Timeline(containerElm,items,options);
    // add overflow:visible property to .vis-item-overflow
    var visItemElms=containerElm.getElementsByClassName("vis-item-overflow");
    for(i=0;i<visItemElms.length;i++){
	visItemElms[i].style="overflow:visible;";
    }
}

function calcMarginForBranch(branchId){
    var branchNum,i;
    for(branchNum=0;branchNum<data.length;branchNum++){
	if(data[branchNum]["branchid"]==branchId){
	    break;
	}
    }
    var workerReward=0;
    for(i=0;i<data[branchNum]["timeline"].length;i++){
	if(data[branchNum]["timeline"][i]["role"]=="tr" || data[branchNum]["timeline"][i]["role"]=="qas"){
	    workerReward+=Math.floor(data[branchNum]["timeline"][i]["unitreward"]*data[branchNum]["wc"]*data[branchNum]["timeline"][i]["rewardratio"]/100);
	}
    }
    var totalReward=Math.floor(data[branchNum]["unitreward"]*data[branchNum]["wc"]*data[branchNum]["rewardratio"]/100);
    return totalReward-workerReward;
}

var editMode=false;
var origData;

function toggleEditMode(buttonElm){
    var i;
    if(editMode){
	// TODO:変更チェック・同期確認
	// TODO:サーバ同期
	var freenotes=document.getElementsByClassName("caseDetail_internalnote");
	for(i=0;i<freenotes.length;i++){
	    freenotes[i].style="overflow-y:visible;";
	}
	if(typeof buttonElm!="undefined"){
	    buttonElm.className=buttonElm.className.substring(0,buttonElm.className.lastIndexOf(" selected"));
	}
	document.getElementById("caseDetail_header").innerHTML="Case details";
	document.getElementsByTagName("main")[0].className="";
	disableElmEdit();
    }else{
	var freenotes=document.getElementsByClassName("caseDetail_internalnote");
	for(i=0;i<freenotes.length;i++){
	    freenotes[i].style="overflow-y:scroll;height:70px;";
	}
	if(typeof buttonElm!="undefined"){
	    buttonElm.className+=" selected";
	}
	document.getElementById("caseDetail_header").innerHTML="Case details (edit mode)";
	document.getElementsByTagName("main")[0].className="editModeBackground";
	origData=JSON.parse(JSON.stringify(data));
	enableElmEdit();
    }
    editMode=!editMode;
}

var editingTimelineData;
var editingTimelineBranchNum;
var editingTimelineContainerId;

function editTimeline(branchId,timelineContainerId){
    var i;
    for(i=0;i<data.length;i++){
	if(data[i]["branchid"]==branchId){
	    editingTimelineBranchNum=i;
	}
    }
    editingTimelineData=JSON.parse(JSON.stringify(data[editingTimelineBranchNum]["timeline"]));
    editingTimelineContainerId=timelineContainerId;
    document.getElementById("timelineEdit").style="display:block";
    document.getElementById("timelineEdit_branchid").innerHTML=branchId;
    timelineEditErrorOutput("");
    loadTimelineEditor("timelineEdit_editor");
}

function sortEditingTimelineData(){
    editingTimelineData.sort(function(a,b){
	return Number(a["id"])-Number(b["id"]);
    });
}

function loadTimelineEditor(editorId){
    var timezoneOptions=document.getElementById("timelineEditTimezoneSelect").options;
    var timezone;
    for(i=0;i<timezoneOptions.length;i++){
	if(timezoneOptions[i].selected){
	    timezone=timezoneOptions[i].value;
	}
    }
    sortEditingTimelineData();
    var editorElm=document.getElementById(editorId);
    var editorContent="<tr><th>Action</th><th>Start</th><th>&rarr;</th><th>End</th><th></th></tr>";
    var actionSelectorIDs=[];
    for(var i=0;i<editingTimelineData.length;i++){
	var action=editingTimelineData[i];
	var insert=false;
	var insertionPrecedingId;
	var insertionFollowingId;
	if(editingTimelineData[i]["status"]=="untouched" && new Date(editingTimelineData[i]["start"]).getTime()>new Date().getTime()){
	    if(i==0){
		insert=true;
		insertionPrecedingId=null;
		insertionFollowingId=editingTimelineData[i]["id"];
	    }else if(new Date(editingTimelineData[i]["start"]).getTime()!=new Date(editingTimelineData[i-1]["end"]).getTime()){
		insert=true;
		insertionPrecedingId=editingTimelineData[i-1]["id"];
		insertionFollowingId=editingTimelineData[i]["id"];
	    }
	}
	if(insert){
	    if(insertionPrecedingId==null){
		editorContent+='<tr class="timelineEdit_nullRow"><td colspan="5"><select id="actionSelectBefore'+i+'"><option value="null">-- Select action --</option></select><button onclick="addNewMilestoneToTimeline(null,\''+insertionFollowingId+'\',this.parentNode.parentNode);">Add new milestone</button></td></tr>';
	    }else{
		editorContent+='<tr class="timelineEdit_nullRow"><td colspan="5"><select id="actionSelectBefore'+i+'"><option value="null">-- Select action --</option></select><button onclick="addNewMilestoneToTimeline(\''+insertionPrecedingId+'\',\''+insertionFollowingId+'\',this.parentNode.parentNode);">Add new milestone</button></td></tr>';
	    }
	    actionSelectorIDs.push("actionSelectBefore"+i);
	}
	var timezoneAdjustedStart=convertTimeStringToSpecifiedTimezone(editingTimelineData[i]["start"],timezone);
	var timezoneAdjustedEnd=convertTimeStringToSpecifiedTimezone(editingTimelineData[i]["end"],timezone);
	editorContent+='<tr class="timelineEdit_'+editingTimelineData[i]["status"]+'Row"><td>'+editingTimelineData[i]["action"]+'</td><td>';
	if(editingTimelineData[i]["status"]=="untouched"){
	    editorContent+='<input class="timelineEdit_startdate" type="date" value="'+timezoneAdjustedStart.split(" ")[0]+'" onfocus="timelineMilestoneDateEditStarted(this.parentNode.parentNode);"><br><input class="timelineEdit_starttime" type="time" step="1" value="'+timezoneAdjustedStart.split(" ")[1]+'" onfocus="timelineMilestoneDateEditStarted(this.parentNode.parentNode);">';
	}else{
	    editorContent+='<input class="timelineEdit_startdate" type="date" value="'+timezoneAdjustedStart.split(" ")[0]+'" readonly><br><input class="timelineEdit_starttime" type="time" step="1" value="'+timezoneAdjustedStart.split(" ")[1]+'" readonly>';
	}
	editorContent+='</td><td>&rarr;</td><td>';
	if(editingTimelineData[i]["status"]=="untouched" || editingTimelineData[i]["status"]=="inprogress"){
	    editorContent+='<input class="timelineEdit_enddate" type="date" value="'+timezoneAdjustedEnd.split(" ")[0]+'" onfocus="timelineMilestoneDateEditStarted(this.parentNode.parentNode);"><br><input class="timelineEdit_endtime" type="time" step="1" value="'+timezoneAdjustedEnd.split(" ")[1]+'" onfocus="timelineMilestoneDateEditStarted(this.parentNode.parentNode);">';
	}else{
	    editorContent+='<input class="timelineEdit_enddate" type="date" value="'+timezoneAdjustedEnd.split(" ")[0]+'" readonly><br><input class="timelineEdit_endtime" type="time" step="1" value="'+timezoneAdjustedEnd.split(" ")[1]+'" readonly>';
	}
	editorContent+='</td><td>';
	if(editingTimelineData[i]["status"]=="untouched"){
	    editorContent+='<button onclick="applyChangesOnTimelineMilestone(\''+editingTimelineData[i]["id"]+'\',this.parentNode.parentNode);" class="timelineEdit_rowApplyButton" style="display:none">Apply</button><button onclick="loadTimelineEditor(\'timelineEdit_editor\');" class="timelineEdit_rowCancelButton" style="display:none">Cancel</button><button onclick="removeTimelineMilestone(\''+editingTimelineData[i]["id"]+'\');" class="timelineEdit_removeButton">Remove this miliestone</button>';
	}else if(editingTimelineData[i]["status"]=="inprogress"){
	    editorContent+='<button onclick="applyChangesOnTimelineMilestone(\''+editingTimelineData[i]["id"]+'\',this.parentNode.parentNode);" class="timelineEdit_rowApplyButton" style="display:none">Apply</button><button onclick="loadTimelineEditor(\'timelineEdit_editor\');" class="timelineEdit_rowCancelButton" style="display:none">Cancel</button><button onclick="revokeTimelineMilestone(\''+editingTimelineData[i]["id"]+'\');" class="timelineEdit_revokeButton">Revoke this miliestone</button>';
	}else if(editingTimelineData[i]["status"]=="completed"){
	    editorContent+='<button onclick="revokeTimelineMilestone(\''+editingTimelineData[i]["id"]+'\');" class="timelineEdit_revokeButton">Revoke this milestone</button>';
	}
	editorContent+='</td></tr>';
    }
    if(editingTimelineData.length==0){
	editorContent+='<tr class="timelineEdit_nullRow"><td colspan="5"><select id="actionSelectLast"><option value="null">-- Select action --</option></select><button onclick="addNewMilestoneToTimeline(null,null,this.parentNode.parentNode);">Add new milestone</button></td></tr>';
    }else{
	editorContent+='<tr class="timelineEdit_nullRow"><td colspan="5"><select id="actionSelectLast"><option value="null">-- Select action --</option></select><button onclick="addNewMilestoneToTimeline(\''+editingTimelineData[editingTimelineData.length-1]["id"]+'\',null,this.parentNode.parentNode);">Add new milestone</button></td></tr>';
    }
    actionSelectorIDs.push("actionSelectLast");
    editorElm.innerHTML=editorContent;
    for(i=0;i<actionSelectorIDs.length;i++){
	initActionSelector(actionSelectorIDs[i]);
    }
}

function timelineMilestoneDateEditStarted(rowObj){
    var i,j;
    var allRows=rowObj.parentNode.childNodes;
    for(i=0;i<allRows.length;i++){
	if(allRows[i]!=rowObj){
	    var childInputs=allRows[i].getElementsByTagName("input");
	    for(j=0;j<childInputs.length;j++){
		childInputs[j].disabled=true;
	    }
	    var childButtons=allRows[i].getElementsByTagName("button");
	    for(j=0;j<childButtons.length;j++){
		childButtons[j].style="display:none";
	    }
	}
    }
    var rowApplyButtons=rowObj.getElementsByClassName("timelineEdit_rowApplyButton");
    if(rowApplyButtons.length!=0){
	rowApplyButtons[0].style="display:inline";
    }
    var rowCancelButtons=rowObj.getElementsByClassName("timelineEdit_rowCancelButton");
    if(rowCancelButtons.length!=0){
	rowCancelButtons[0].style="display:inline";
    }
    var revokeButtons=rowObj.getElementsByClassName("timelineEdit_revokeButton");
    if(revokeButtons.length!=0){
	revokeButtons[0].style="display:none";
    }
    var removeButtons=rowObj.getElementsByClassName("timelineEdit_removeButton");
    if(removeButtons.length!=0){
	removeButtons[0].style="display:none";
    }
}

function timelineEditErrorOutput(msg){
    document.getElementById("timelineEdit_errorMsg").innerHTML=msg;
}

function applyChangesOnTimelineMilestone(milestoneId,rowObj){
    var changedStartDate=rowObj.getElementsByClassName("timelineEdit_startdate")[0].value;
    var changedStartTime=rowObj.getElementsByClassName("timelineEdit_starttime")[0].value;
    var changedEndDate=rowObj.getElementsByClassName("timelineEdit_enddate")[0].value;
    var changedEndTime=rowObj.getElementsByClassName("timelineEdit_endtime")[0].value;
    var errorFieldsName=[];
    if(changedStartDate.length==0){
	errorFieldsName.push("Starting date");
    }
    if(changedStartTime.length==0){
	errorFieldsName.push("Starting time");
    }
    if(changedStartTime.lastIndexOf(":")==2){
	changedStartTime+=":00";
    }
    if(changedEndDate.length==0){
	errorFieldsName.push("Ending date");
    }
    if(changedEndTime.lastIndexOf(":")==2){
	changedEndTime+=":00";
    }
    if(changedEndTime.length==0){
	errorFieldsName.push("Ending time");
    }
    if(errorFieldsName.length!=0){
	timelineEditErrorOutput("Milestone schedule update failed: Input values are invalid in the following fields.<br>"+errorFieldsName.join(", "));
	loadTimelineEditor("timelineEdit_editor");
	return;
    }
    var timezoneOptions=document.getElementById("timelineEditTimezoneSelect").options;
    var timezone;
    for(i=0;i<timezoneOptions.length;i++){
	if(timezoneOptions[i].selected){
	    timezone=timezoneOptions[i].value;
	}
    }
    var changedStart=changedStartDate+" "+changedStartTime+" "+timezone;
    var changedEnd=changedEndDate+" "+changedEndTime+" "+timezone;
    if(new Date(changedStart).getTime()>=new Date(changedEnd).getTime()){
	timelineEditErrorOutput("Milestone schedule update failed: Changed date&time of starting and ending are reversed.");
	loadTimelineEditor("timelineEdit_editor");
	return;
    }
    sortEditingTimelineData();
    for(var i=0;i<editingTimelineData.length;i++){
	if(editingTimelineData[i]["id"]==milestoneId){
	    if(i!=0){
		var precedingEnd=editingTimelineData[i-1]["end"];
		if(new Date(changedStart).getTime()<new Date(precedingEnd).getTime()){
		    timelineEditErrorOutput("Milestone schedule update failed: The changed schedule is overlapping to other milestones.");
		    loadTimelineEditor("timelineEdit_editor");
		    return;
		}
	    }
	    if(i!=editingTimelineData.length-1){
		var followingStart=editingTimelineData[i+1]["start"];
		if(new Date(changedEnd).getTime()>new Date(followingStart).getTime()){
		    timelineEditErrorOutput("Milestone schedule update failed: The changed schedule is overlapping to other milestones.");
		    loadTimelineEditor("timelineEdit_editor");
		    return;
		}
	    }
	    editingTimelineData[i]["start"]=changedStart;
	    editingTimelineData[i]["end"]=changedEnd;
	    break;
	}
    }
    timelineEditErrorOutput("");
    loadTimelineEditor("timelineEdit_editor");
}

function addNewMilestoneToTimeline(precedingId,followingId,rowObj){
    var i;
    var timezoneOptions=document.getElementById("timelineEditTimezoneSelect").options;
    var timezone;
    for(i=0;i<timezoneOptions.length;i++){
	if(timezoneOptions[i].selected){
	    timezone=timezoneOptions[i].value;
	}
    }
    var action;
    var actionOptions=rowObj.getElementsByTagName("select")[0].options;
    for(i=0;i<actionOptions.length;i++){
	if(actionOptions[i].selected){
	    action=actionOptions[i].value;
	}
    }
    if(action=="null"){
	timelineEditErrorOutput("New milestone addition failed: Action for new milestone is not selected.");
	loadTimelineEditor("timelineEdit_editor");
	return;
    }
    var role=getRoleForAction(action);
    var id,startDate,endDate;
    if(precedingId==null && followingId==null){
	id="0";
	startDate=new Date;
	endDate=new Date();
	endDate.setDate(endDate.getDate()+1);
    }else if(precedingId==null){
	id=(Number(followingId)-1).toString();
	for(i=0;i<editingTimelineData.length;i++){
	    if(editingTimelineData[i]["id"]==followingId){
		endDate=new Date(editingTimelineData[i]["start"]);
		startDate=new Date(editingTimelineData[i]["start"]);
		startDate.setDate(startDate.getDate()-1);
		if(startDate.getTime()<new Date().getTime()){
		    startDate=new Date();
		}
	    }
	}
	startDate.setDate(startDate.getDate()-1);
    }else if(followingId==null){
	id=(Number(precedingId)+1).toString();
	for(i=0;i<editingTimelineData.length;i++){
	    if(editingTimelineData[i]["id"]==precedingId){
		startDate=new Date(editingTimelineData[i]["end"]);
		if(startDate.getTime()<new Date().getTime()){
		    startDate=new Date();
		}
		endDate=new Date(convertDateObjToString(startDate,timezone));
		endDate.setDate(endDate.getDate()+1);
	    }
	}
    }else{
	id=((Number(precedingId)+Number(followingId))/2).toString();
	for(i=0;i<editingTimelineData.length;i++){
	    if(editingTimelineData[i]["id"]==precedingId){
		startDate=new Date(editingTimelineData[i]["end"]);
		if(startDate.getTime()<new Date().getTime()){
		    startDate=new Date();
		}
	    }else if(editingTimelineData[i]["id"]==followingId){
		endDate=new Date(editingTimelineData[i]["start"]);
	    }
	}
    }
    if(startDate.getTime()>endDate.getTime()){
	timelineEditErrorOutput("New milestone addition failed: Too late to adding new milestone here.");
	loadTimelineEditor("timelineEdit_editor");
	return;
    }
    var start=convertDateObjToString(startDate,timezone);
    var end=convertDateObjToString(endDate,timezone);
    var newMilestoneObj={
	"id":id,
	"start":start,
	"end":end,
	"action":action,
	"role":role,
	"status":"untouched"
    };
    if(role!="client"){
	newMilestoneObj["worker"]="";
	if(role!="coordinator"){
	    newMilestoneObj["unitreward"]=0;
	    newMilestoneObj["rewardratio"]=0;
	}
    }
    editingTimelineData.push(newMilestoneObj);
    sortEditingTimelineData();
    timelineEditErrorOutput("");
    loadTimelineEditor("timelineEdit_editor");
}

function removeTimelineMilestone(milestoneId){
    var i;
    for(i=0;i<editingTimelineData.length;i++){
	if(milestoneId==editingTimelineData[i]["id"]){
	    editingTimelineData.splice(i,1);
	    break;
	}
    }
    loadTimelineEditor("timelineEdit_editor");
    timelineEditErrorOutput("");
}

function revokeTimelineMilestone(milestoneId){
    var i,j;
    var timezoneOptions=document.getElementById("timelineEditTimezoneSelect").options;
    var timezone;
    for(i=0;i<timezoneOptions.length;i++){
	if(timezoneOptions[i].selected){
	    timezone=timezoneOptions[i].value;
	}
    }
    for(i=0;i<editingTimelineData.length;i++){
	if(milestoneId==editingTimelineData[i]["id"]){
	    break;
	}
    }
    var now=new Date();
    var yesterday=new Date();
    yesterday.setDate(yesterday.getDate()-1);
    for(;i<editingTimelineData.length;i++){
	if(editingTimelineData[i]["status"]=="untouched"){
	    break;
	}
	editingTimelineData[i]["status"]="revoked";
	if(new Date(editingTimelineData[i]["end"]).getTime()>now.getTime()){
	    editingTimelineData[i]["end"]=convertDateObjToString(now,timezone);
	    if(new Date(editingTimelineData[i]["start"]).getTime()>=new Date(editingTimelineData[i]["end"]).getTime()){
		editingTimelineData[i]["start"]=convertDateObjToString(yesterday,timezone);
	    }
	}
    }
    loadTimelineEditor("timelineEdit_editor");
    timelineEditErrorOutput("");
}

function confirmTimelineEdit(){
    // TODO: role==tr,qas && worker assignedなmilestoneを編集する時のメール窓
    data[editingTimelineBranchNum]["timeline"]=editingTimelineData;
    showTimelineView(data[editingTimelineBranchNum]["branchid"],editingTimelineContainerId);
    disableElmEdit();
    enableElmEdit();
    document.getElementById("timelineEdit").style="display:none";
}

function cancelTimelineEdit(){
    document.getElementById("timelineEdit").style="display:none";
}

function downloadCurrentFilesOfAll(){
    alert("downloadCurrentFilesOfAll(): not implemented yet");
}

function downloadCurrentFilesOfBranch(branchId){
    alert("downloadCurrentFilesOfBranch(branchId): not implemented yet");
}

function showVersionTree(){
    alert("showVersionTree(): not implemented yet");
}

function moveToMessageRelevantToCase(){
    alert("moveToMessageRelevantToCase(): not implemented yet");
}

function moveToMessageRelevantToBranch(branchId){
    alert("moveToMessageRelevantToBranch(branchId): not implemented yet");
}

function showNewBranchPanel(){
    alert("showNewBranchPanel(): not implemented yet");
}

function showWorkerAssignmentPanel(branchId,timelineSerial){
    alert("showWorkerAssignmentPanel(branchId,timelineSerial): not implemented yet");
}
