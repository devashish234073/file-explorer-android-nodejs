var fs = require("fs");
var http = require("http");
var exec = require('child_process').exec;

function getMIMEType(format){
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

var server = http.createServer((req,res)=>{
    if(req.url.indexOf(".")<0){
        res.write("<html>");
        res.write("<head>");
        res.write("<meta name='viewport' content='width=device-width version=1.0'>");
        res.write("<style>");
        res.write(`.folder{
            display:block;
            text-decoration:none;
            background-color:gold;
            color:green;
            border:1px solid goldenrod;
            padding:4px;
        }
        .files{
            display:block;
            text-decoration:none;
            background-color:lemonchiffon;
            color:lightcoral;
            border:1px solid goldenrod;
            padding:4px;
        }
        `);
        res.write("</style></head>");
        exec("ls ."+req.url,(err,out)=>{
            var lines=out.split("\n");
            for(var i=0;i<lines.length;i++){
                var classInfo="class='files' ";
                if(lines[i].indexOf(".")<0){
                    classInfo="class='folder' ";
                }
                if(lines[i].trim()!=="") {
                    if(req.url==="/"){
                        res.write("<a "+classInfo+"href='/"+lines[i]+"'>"+lines[i]+"</a>");
                    } else {
                        res.write("<a "+classInfo+"href='"+req.url+"/"+lines[i]+"'>"+lines[i]+"</a>");
                    }
                }
            }
            res.end("");
        });
    } else {
        var arr=req.url.split(".");
        var format="text/html";
        if(arr.length===2){
            format=getMIMEType(arr[1].trim());
        }
        var fName="."+req.url;
        fName=fName.replace(/%20/g," ");
        fs.readFile(fName,(err,data)=>{
            if(!err){
                res.writeHead(200,{"Content-Type":format});
                res.end(data);
            } else {
                res.end("Unable to read file '"+req.url+"'");
            }
        });
    }
});

server.listen(8888);
