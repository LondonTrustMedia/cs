const https  = require("https");
const url = require("url");
const querystring = require("querystring");
const streamToString = require("./utils").streamToString;

/**
 * Manages access to the support tools and handles the authentication process
 */
module.exports = class {
	/**
	 * Initialize the support tools access with the credentials
	 */
	constructor(user, password) {
		this.user = user;
		this.password = password;
		
		this.cookies = null;
		this.isReady = false;
		this.keepaliveTimer = null;
	}
	
	/**
	 * Authenticates with the support tools and obtain a new session cookie.
	 * Optionally pings back the server at a set interval to persist the session as needed
	 */
	authenticate(keepalive, success, error) {
		var that = this;
		var cookies = {};
		
		// Generic error handler
		function onError() {
			if(error instanceof Function) {
				error.apply(null, arguments);
			}
		}
		
		// First obtain the authenticity token
		function getAuthenticityToken() {
			https.request("https://files.privateinternetaccess.com/support_users/sign_in")
			.on("response", function(response) {
				if(response.statusCode !== 200) {
					return onError(new Error("Support tools sign-in page unavailable"));
				}
				
				response.setEncoding("utf8");
				streamToString(response, function(page) {
					let token = page.match(/<input type="hidden" name="authenticity_token" value="([^"]*)"/)[1];
					
					if(!token) {
						return onError(new Error("Couldn't extract the token from the support tools sign-in page"));
					}
					else {
						doLogin(response.headers["set-cookie"].join("; "), token);
					}
				});
			})
			.on("error", onError)
			.end();
		}
		
		// With that token, perform the login
		function doLogin(cookies, token) {
			let formData = "utf8=%E2%9C%93"
				+ "&&authenticity_token=" + querystring.escape(token)
				+ "&support_user%5Bemail%5D=" + querystring.escape(that.user)
				+ "&support_user%5Bpassword%5D=" + querystring.escape(that.password)
				+ "&support_user%5Bremember_me%5D=1&commit=Login";
				
			https.request({
				hostname: "files.privateinternetaccess.com",
				port: 443,
				method: "POST",
				path: "/support_users/sign_in",
				headers: {
					Cookie: cookies,
					"Content-Type": "application/x-www-form-urlencoded"
				}
			})
			.on("response", function(response) {
				if(response.statusCode === 302 && response.headers.location.endsWith("/support_support")) {
					onLoginConfirmed(response.headers["set-cookie"].join("; "));
				}
				else {
					onError(new Error("Login to support tools failed."));
				}
			})
			.on("error", onError)
			.end(formData);
		}
		
		// Finally, login is confirmed. Store these cookies and start the keepalive if enabled
		function onLoginConfirmed(cookies) {
			that.isReady = true;
			that.cookies = cookies;
			
			if(keepalive > 0) {
				that.keepaliveTimer = setTimeout(sessionKeepalive, keepalive);
			}
			
			if(success instanceof Function) {
				success();
			}
		}
		
		// Verifies that the session is still valid by loading the support tools index
		function sessionKeepalive() {
			if(!that.isReady) return;
			
			that.request("https://files.privateinternetaccess.com/support_support")
			.on("response", function(response) {
				if(response.statusCode === 200) {
					that.keepaliveTimer = setTimeout(sessionKeepalive, keepalive);
				}
				else {
					onError(new Error("Keepalive request failed"));
				}
			})
			.on("error", onError)
			.end();
		}
		
		// Start the process
		if(this.keepaliveTimer) {
			clearTimeout(this.keepaliveTimer);
		}
		
		this.isReady = false;
		
		getAuthenticityToken();
	}
	
	
	/**
	 * Performs a request on the support tools
	 */
	request(options, callback) {
		if(!this.isReady) {
			throw new Error("Can't do a support tools request while the support tools manager is not ready.");
		}
		
		if(typeof options === "string") {
			options = url.parse(options);
		}
		
		if(!options.headers) {
			options.headers = {};
		}
		
		options.headers.Cookie = this.cookies;
		
		return https.request(options, callback);
	}
};
