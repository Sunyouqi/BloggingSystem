import http from "node:http"
import fs from "node:fs"
import path from "node:path"


let port = "3000";
let host = "localhost";

let server = http.createServer((req, res) => {
    console.log(req.url, " method:", req.method);
    let ext = path.extname(req.url);
    if (req.url == "/") {
        let filePath = path.join(import.meta.dirname, "index.html");
        //console.log(filePath);
        let mainPage = fs.readFileSync(filePath, { encoding: "utf-8", flag: "r" });
        res.writeHead(200, { "Content-Type": "text/html;charset=utf8" });
        res.write(mainPage);
        res.end();
    }
    if (ext == '.css') {
        let filePath = path.join(import.meta.dirname, "style.css");

        let styleSheet = fs.readFileSync(filePath, { encoding: "utf-8", flag: "r" });
        res.writeHead(200, { "Content-Type": "text/css;charset=utf8" });
        res.write(styleSheet);
        res.end();
    }
    if (ext == '.js') {
        let filePath = path.join(import.meta.dirname, "client.js");

        let clientScript = fs.readFileSync(filePath, { encoding: "utf-8", flag: "r" });
        res.writeHead(200, { "Content-Type": "application/javascript;charset=utf8" });
        res.write(clientScript);
        res.end();
    }
    if (req.url == "/POSTARTICLE") {

        req.on("data", msg => {
            console.log((msg.toString()).replace(/\&nbsp\;/g, ' '));
        })
    }
    if (req.url == "/?anotherDomain") {
        console.log('received');
        res.writeHead(200, { "Access-Control-Allow-Origin": "*", "Content-Type": "text/plain;charset:utf8" })
        res.write("this is another server");
        res.end();
        let requestBack = http.request({
            method: "POST",
            host: "192.168.2.16",
            port: "1500",
            path: "/answer",
            headers: {
                "Content-Type": "text/plain",
            }
        }, res => {
            //console.log("get answer:", res);
        });
        requestBack.write("Can I get answer?");
        requestBack.end();
    }
    if (req.url == "/photo.jpg") {
        let pathImg = path.join(import.meta.dirname, "photo.jpg");
        let photoF = fs.readFileSync(pathImg, { flag: "r" });
        res.setHeader("Content-Type", "image/jpg");
        res.write(photoF);
        res.end();
    }

});


server.listen(port, host, () => {
    console.log("server is listening to localhost at port", port);
})