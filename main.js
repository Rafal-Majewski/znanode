{
	let Module=require("module");
	let requireOld=Module.prototype.require;
	Module.prototype.require=function(...args) {
		args[0]=(args[0][0] == "/" && args[0].substr(0, 4) != "/run")?(__dirname+args[0]):(args[0]);
		return requireOld.apply(this, args);
	};
}
const terser=require("terser");
const http=require("http");
const fs=require("fs");
const minify=require("minify");

const readdirRecSync=(path, files)=>{
	if (!files) files=[];
	let localFiles=fs.readdirSync(path);
	localFiles.forEach((localFile)=>{
		if (fs.statSync(path+"/"+localFile).isDirectory()) readdirRecSync(path+"/"+localFile, files);
		else files.push(path+"/"+localFile);
	});
	return files;
};

const processSrcFile=(file)=>{
	let component=require(file);
	let content=terser.minify(file.styles);
	return content;
};

const components=readdirRecSync("./src").reduce((sum, file)=>{
	let componentId=file.split('/').slice(-1)[0].slice(0, -3);
	//let component=require(file);
	//JSON.stringify({styles: component.styles.replace(/\n|\t/g, "").replace(/,}/g, "}").replace(/: +/g, ":").replace(/ +{/g, "{"), node: component.node})
	sum[componentId]=processSrcFile(file);
	return sum;
}, {});

console.log(components);

let server=http.createServer(async(req, res)=>{
	res.setHeader("Access-Control-Allow-Origin", "*");
	res.respond=(status, data)=>{
		res.setHeader("Content-Type", "application/javascript");
		res.statusCode=status;
		res.end(data);
	};
	if (req.method != "GET") return res.respond(405, "Method Not Allowed");
	req.surl=req.url.split("/").slice(1);
	console.log(req.surl);
	res.respond(200, components[req.surl[0]]);
	// req.surl.shift();
	// if (req.headers.authorization) {
	// 	let tokenError=await Session.findOne({token: req.headers.authorization}).then(async(session)=>{
	// 		if (!session) return codes.invalidToken;
	// 		session.updateOne({expireTime: Date.now()+config.tokenValidityTime});
	// 		req.session=session;
	// 		return null;
	// 	}).catch((error)=>{
	// 		if (error.name == "CastError") codes.invalidToken;
	// 		return codes.internalError;
	// 	});
	// 	if (tokenError) return res.respond(tokenError);
	// }
	// else req.session={ownerId: ""};

	// let route=routes;
	// while (true) {
	// 	if (route.subroutes[req.surl[0]]) {
	// 		route=route.subroutes[req.surl[0]];
	// 		req.surl.shift();
	// 	}
	// 	else break;
	// }
	// if (route.methods[req.method]) {
	// 	let data="";
	// 	req.on("data", (chunk)=>{
	// 		data+=chunk;
	// 	});
	// 	req.on("end", ()=>{
	// 		req.body=data;
	// 		route.methods[req.method](req, res);
	// 	});
	// }
	// else {
	// 	if (Object.keys(route.methods).length == 0) return res.respond(codes.notFound);
	// 	else return res.respond(codes.methodNotAllowed);
	// }
}).listen(4100);