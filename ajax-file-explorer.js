var fs   = require("fs");
var http = require("http");

var html = `
<html>
<meta name="viewport" content="width=device-width initial-scale=1.0">
<head>
<style>
input[type='button'] {
    width:190px;
    height:25px;
    border:1px solid green;
    border-top-left-radius:10px;
    border-top-right-radius:10px;
    border-bottom-left-radius:10px;
    border-bottom-right-radius:10px;
    text-align:left;
}
.folder{
    background-color:black;
    color:white;
}
.folder:hover{
    background-color:rgb(30,40,50);
    color:white;
}
.file{
    background-color:mistyrose;
    color:olive;
}
</style>
<script>
function sendRequest(path,id) {
    var elem = document.querySelector("#"+id);
    if(elem.childElementCount>1){
        var c = elem.children[1];
        c.remove();
    } else {
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                var p = document.createElement("div");
                p.innerHTML = this.responseText;
                elem.appendChild(p);
            }
        };
        xhttp.open("GET", path, true);
        xhttp.send();
    }
}
function openFile(path) {
    var form=document.querySelector("form");
    form.setAttribute("action","_OPEN_FILE"+path);
    form.submit();
}
</script>
</head>
<body>
<form method="GET">
_{dirs}
</form>
</body>
</html>
`;

function getMIMEType(format){
    if(format === "xslt") {
        format = "xsl";
    }
    if(format==="jpg" || format==="jpeg" || format==="png"){
        return "image/"+format;
    } else if(format==="mp3" || format==="wav"){
        return "audio/"+format;
    } else if(format==="avi" || format==="mp4"){
        return "video/"+format;
    } else {
        return "text/"+format;
    }
}

function getFormat(fName){
    if(fName.indexOf(".")>-1){
        var tmp=fName.split(".");
        if(tmp.length>1){
            return tmp[tmp.length-1];
        }
    }
    return "plain";
}

function convertArrayToLink(files,origURL){
    var url = origURL;
    if(url==="/"){
        url = "";
    }
    var ret="<ul>";
    for(var i=0;i<files.length;i++) {
        if(files[i].indexOf(".")!==0){
            var id = url.replace(/\//g,"")+"_"+files[i].replace(/ /g,"-");
            var isDir = false;
            try {
                fs.readdirSync("."+url+"/"+files[i]);
                isDir = true;
            } catch (e) {}
            if(isDir){
                ret+="<li id='"+id+"'><input type='button' class='folder' title='"+files[i]+"' onclick='sendRequest(\""+url+"/"+files[i]+"\",\""+id+"\")' value=\""+files[i]+"\"></li>";
            } else {
                ret+="<li id='"+id+"'><input type='button' class='file' title='"+files[i]+"' onclick='openFile(\""+url+"/"+files[i]+"\")' value=\""+files[i]+"\"></li>";
            }
        }
    }
    ret+="</ul>";
    return ret;
}

var server = http.createServer((req,res)=>{
    var url = req.url.replace(/%20/g," ");
    var files;
    if(url.indexOf("favicon.ico")===-1){
        if(url.indexOf("/_OPEN_FILE")===0){
            url = url.replace("/_OPEN_FILE",".");
            url = url.split("?")[0].trim();
            fs.readFile(url,(err,data)=>{
                var mimeType=getMIMEType(getFormat(url));
                res.writeHead(200,{"Content-Type":mimeType});
                res.end(data);
            });
        } else {
            try {
                files = fs.readdirSync("."+url);
                var resp = html.replace("_{dirs}",convertArrayToLink(files,url));
                res.end(resp);
            } catch(e) {
                res.end("<font color='red'>ERROR</font>");
            }
        }
    }
});

server.listen(8888);