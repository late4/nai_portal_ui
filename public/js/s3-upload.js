
var fileNum = 1; // XXX

/* // XXX

function loadTemplate {
     var req = new XMLHttpRequest();
     req.onload = function() {
          if (req.readyState == 4) {

          }
     }
     reqBase.open("GET",baseTemplateUrl,true);
     reqBase.send();
}

*/

window.onload = function() {
     listFile();
}

function selectFile(num) {
     var selector = document.getElementById("f-file"+num);
     selector.click();
}

function updateFile(num) {
     var display = document.getElementById("disp-file"+num);
     var selector = document.getElementById("f-file"+num);
     if (selector.value) {
          var filename = selector.value.split("\\");
          var basename = filename[filename.length - 1];
          display.innerHTML = basename;

          s3Upload(selector.files[0]);
     }
}

function s3Upload(file) {
     AWS.config.update(
          {
               accessKeyId: 'XXXX',
               secretAccessKey: 'XXXX', // XXX: hardcoded
               region: 'ap-northeast-1'

          }
     );
     AWS.config.region = 'ap-northeast-1';

     var bucket = new AWS.S3(
          {
               params: {
                    Bucket: 'bem134-portal-files'
               }
          }
     );
     var params = { Key: 'test-upload.txt', ContentType: file.type, Body: file };
     bucket.upload(params, function (err, data) {
          console.log(err ? "error" : "saved")
     });
}

function listFile() {

     // XXX

}

function addFile() {
     var template = document.getElementById('template-addfile').innerHTML;
     var table = document.getElementById('table-files').innerHTML;
     fileNum++;

     var newRow = template.replace(/__FILENUMBER__/g, fileNum.toString());
     console.log(table);

     document.getElementById('table-files').innerHTML += newRow;
}