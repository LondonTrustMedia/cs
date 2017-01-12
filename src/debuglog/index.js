const fs         = require("fs");
const https      = require("https");
const Handlebars = require("handlebars").create();
const sass       = require("node-sass");
const entities   = require("entities");
const Log        = require("./logv1");
const SupportTools = require("../support-tools");
const streamToString = require("../utils").streamToString;
const config     = require("../../config");

// HTML Render template
Handlebars.registerHelper("oddEven", function(index) {
	return index&1 ? "odd" : "even";
});

const template = Handlebars.compile(
	fs.readFileSync(
		"src/debuglog/views/index.html",
		{ encoding: "utf8" }
	),
	{ preventIndent: true }
);
const styles = sass.renderSync({file: "src/debuglog/style.scss"});


// Cache and automatic cleanup
var cache = [];

setInterval(function() {
	let now = new Date();
	Object.keys(cache).forEach(function(logid) {
		if(now - cache[logid].used > config.debugLog.cacheExpire) {
			delete cache[logid];
		}
	});
}, config.debugLog.cacheCleanInterval);


// Support tools access
var supportTools = new SupportTools(config.supportTools.user, config.supportTools.password);

function connectSupportTools() {
	supportTools.authenticate(config.supportTools.keepaliveInterval, function() {
		console.log("Support tools online");
	}, function(error) {
		console.error("Support tools failed, retrying...", error);
		setTimeout(connectSupportTools, config.supportTools.retryInterval);
	});
}

connectSupportTools();


/**
 * Main debug log request handler
 */
module.exports = function(request, response) {
	// Only allow valid debug URLs
	if(!request.url.match(/^\/[0-9]{3}\/[0-9]{4}$/)) {
		response.statusCode = 400;
		response.end("The request URL must be a valid debug log URL");
		return;
	}
	
	// Function to return and display the log
	function displayLog(logCache) {
		response.setHeader("Content-Type", "text/html; charset=UTF-8");
		
		if(!logCache.html) {
			logCache.html = template({
				css: styles.css,
				log: logCache.log
			});
		}
		
		logCache.used = new Date();
		
		response.end(logCache.html);
	}
	
	// Cache hit?
	// TODO: That might be the web server's responsibility
	if(request.url in cache) {
		return displayLog(cache[request.url]);
	}
	
	
	// Not a cached log, request from the support tools
	if(!supportTools.isReady) {
		response.statusCode = 502;
		return response.end("Support tools service is currently offline. Try again later.");
	}
	
	supportTools.request({
		hostname: "files.privateinternetaccess.com",
		port: 443,
		path: "/support_support/debug_log" + request.url,
		method: "GET"
	})
	.on("response", function(res) {
		if(res.statusCode > 500) {
			response.statusCode = 502;
			response.end("The upstream server returned an error.");
			return;
		}
		else if(res.statusCode === 404) {
			response.statusCode = 404;
			response.end("This debug log does not exist.");
			return;
		}
		else if(res.statusCode !== 200) {
			response.statusCode = res.statusCode;
			res.pipe(response);
			return;
		}
		
		streamToString(res, function(logdata) {
			logdata = logdata.replace(/^[^]*?<pre>([^]*)<\/pre>[^]*?$/, "$1");
			logdata = entities.decodeHTML(logdata);
			
			cache[request.url] = {
				loaded: new Date(),
				used: new Date(),
				log: new Log(logdata)
			};
			
			displayLog(cache[request.url]);
		});
	})
	.on("error", function(error) {
		console.error("Error fetching debug log "+request.url, error);
		response.statusCode = 502;
		response.end("Failed to load debug log from upstream");
	})
	.end();
};
