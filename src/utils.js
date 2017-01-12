/**
 * Simple utility function that takes a ReadableStream, gets all of
 * its contents and calls a callback with the resulting string.
 */
exports.streamToString = function(stream, callback) {
	let result = "";
	
	stream.setEncoding("utf8");
	
	stream.on("data", function(data) {
		result += data;
	});
	
	stream.on("end", function() {
		callback(result);
	});
};
