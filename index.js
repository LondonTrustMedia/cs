const http = require("http");
const config = require("./config");

const modules = ['debuglog'];

http.createServer(function(request, response) {
	let components = request.url.split("/");
	
	if(modules.indexOf(components[1]) !== -1) {
		request.url = "/" + components.slice(2).join("/");
		require("./src/debuglog/")(request, response);
	}
	else {
		response.statusCode = 404;
		response.end("Unknown endpoint");
	}
}).listen(config.http.port, config.http.host);