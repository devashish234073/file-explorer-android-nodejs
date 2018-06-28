var fs   = require('fs');
var http = require('http');
var PORT = 8888;
tree     = [];
var sep  = "__##_#";

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

function scanDir(u){
    var ls=[];
    try{
        ls=fs.readdirSync(u+"/");
    } catch(e){
        return;
    }
    for(var i=0;i<ls.length;i++){
        if(ls[i].indexOf(".")===0){
            continue;
        }
        if(tree[u]===undefined){
            tree[u]=[ls[i]];
        } else {
            tree[u].push(ls[i]);
        }
        scanDir(u+"/"+ls[i]);
    }
}

function URL2Key(u){
    u=u.trim();
    u=u.replace(/%20/g," ");
    if(u.indexOf(".")!==0){
        u="."+u;
    }
    if(u.length>0){
        if(u[u.length-1]==="/"){
            u=u.substr(0,u.length-1);
        }
    }
    u=u.trim();
    return u;
}

function find(txt){
    var reslts=[];
    for(k in tree){
        var l = tree[k];
        for(var i=0;i<l.length;i++){
            if(l[i].indexOf(txt)>-1){
                reslts.push(k+sep+l[i]);
            }
        }
    }
    return reslts;
}

function getFormat(fName){
    if(fName.indexOf(".")>0){
        var tmp=fName.split(".");
        if(tmp.length>1){
            return tmp[tmp.length-1];
        }
    }
    return null;
}

function breakURL(u){
    var path   = u;
    var fName  = null;
    var format = null;
    var v=u.replace("./",sep);
    if(v.indexOf("/")===-1){
        format=getFormat(v);
        if(format!==null){
            return {"path":"./","fName":v.replace(sep,""),"format":format};
        }
        return {"path":path,"fName":fName,"format":format};
    }
    v=v.split("/");
    if(v.length>1){
        path="";
        fName=v[v.length-1];
        format=getFormat(fName);
        for(var i=0;i<v.length-1;i++){
            path+=v[i];
            if(i!=v.length-2){
                path+="/";
            }
        }
        path=path.replace(sep,"./");
    }
    return {"path":path,"fName":fName,"format":format};
}

function init(){
    tree=[];
    scanDir(".");
}

function fetch(u){
    var ret=tree[u];
    if(ret===undefined){
        var obj=breakURL(u);
        if(obj.fName!=null){
            ret=tree[URL2Key(obj.path)];
            if(ret===undefined){
                return {"type":"err"," msg":"File '"+obj.fName+"' not found in '"+obj.path+"'"};
            } else {
                var data=fs.readFileSync(u);
                return {"type":"file","format":obj.format,"content":data};
            }
        } else {
            return {"type":"err"," msg":"Unable to open '"+u+"' directory"};
        }
    } else {
        return {"type":"folder","content":ret};
    }
}

function getBasicForm() {
    var ret = `<html>
    <meta name="viewport" content="width=device-width version=1.0">
    <head>
    <style>
    input[type='button'],input[type='text']{
        display:block;
        text-decoration:none;
        padding:4px;
        border:1px solid goldenrod;
        width:98%;
        border-top-left-radius:15px;
        border-top-right-radius:15px;
        border-bottom-left-radius:15px;
        border-bottom-right-radius:15px;
    }
    input[type='text']{
        padding-left:12px;
    }
    .file{
        background-color:bisque;
        color:hotpink;
    }
    .folder{
        background-color:gold;
        color:green;   
    } 
    .diff{
        background-color:darkorchid;
        color:white;
    }
    </style>
    </head>`;
    return ret;
}

function getLastURL(url){
    var backURL="/";
    if(url!=="/"){
        var ndx=url.length-1;
        while(ndx>0 && url[ndx]!=="/"){
            ndx--;
        }
        if(url[ndx]==="/"){
            backURL=url.substr(0,ndx);
        }
        if(ndx===0){
            backURL="/";
        }
    }
    return backURL;
}

function folderResp(folders,url){
    var ret=getBasicForm();
    ret+=`<body>
    <form method="GET" action="SearchFileExplorer">
    <input type="text" name="searchTxt" placeholder="Search">
    </form>
    <form class="mainForm" method="GET">`;
    ret+="<input type='button' class='diff' onclick='doSubmit(\"/\")' value='"+"[Home]"+"'>";
    var backURL=getLastURL(url);
    ret+="<input type='button' class='diff' onclick='doSubmit(\""+backURL+"\")' value='"+"[Back]"+"'>";
    var className = "";
    for(var i=0;i<folders.length;i++){
        if(folders[i].indexOf(".")>0){
            className = "file";
        } else {
            className = "folder";
        }
        ret+="<input class='"+className+"' type='button' onclick='doSubmit(\""+(url==="/"?"":url)+"/"+folders[i]+"\")' value='"+folders[i]+"'>";
    }
    ret+=`
    </form>
    <script>
        function doSubmit(action) {
            var form = document.querySelector(".mainForm");
            form.setAttribute("action",action);
            form.submit();
        }
    </script>
    `;
    ret+="</body></html>";
    return ret;
}

function srchResultResp(srchRslt) {
    if(srchRslt.length==0){
        return "No file matched the search text.";
    }
    var ret=getBasicForm();
    ret+="<body><form class='mainForm' method='POST'>";
    for(var i=0;i<srchRslt.length;i++) {
        var tmp = srchRslt[i].split(sep);
        var path = tmp[0];
        var file = tmp[1];
        ret+="<input type='button' title='"+path+"' value='"+file+"' onclick='doSubmit(\""+path+"\")'>";
    }
    ret+=`
    </form>
    <script>
        function doSubmit(action) {
            var form = document.querySelector(".mainForm");
            form.setAttribute("action",action);
            form.submit();
        }
    </script>`;
    ret+="</body></html>";
    return ret;
}

init();

var server = http.createServer((req,res)=>{
    var origURL=req.url;
    if(origURL.indexOf("/SearchFileExplorer")>-1){
        var tmp = origURL.split("?");
        if(tmp.length===2){
            var srch = tmp[1];
            srch = srch.split("=");
            if(srch.length===2){
                srch = srch[1];
                var srchRslt = find(srch);
                res.end(srchResultResp(srchRslt));
            } else {
                res.end("Unable to parse request url");
            }
        } else {
            res.end("Unable to parse request url");
        }
    } else if(req.url!=="/favicon.ico"){
        
origURL=origURL.replace("?","");
        var url=URL2Key(origURL);
        var ret=fetch(url);
        if(ret.type==="folder"){
            ret=folderResp(ret.content,origURL);
        } else if(ret.type==="file"){
            var f=ret.format;
            if(f!==null){
                var mime=getMIMEType(f);
                res.writeHead(200,{"Content-Type":mime});
            }
            ret=ret.content;
        } else {
            ret=JSON.stringify(ret);
        }
        res.end(ret);
    }
 else {
        res.end("<a href='./'>Unexpected Err. Go Home</a>");
    }
});

server.listen(PORT);
console.log("Server started at PORT:"+PORT);
