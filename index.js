const http = require("http");
const config = require("./config");

const modules = {
	debuglog: require("./src/debuglog/")
};

http.createServer(function(request, response) {
	let components = request.url.split("/");
	
	if(components[1] in modules) {
		request.url = "/" + components.slice(2).join("/");
		modules[components[1]](request, response);
	}
	else {
		response.statusCode = 404;
		response.end("Unknown endpoint");
	}
}).listen(config.http.port, config.http.host);
