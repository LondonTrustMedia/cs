const LogParser = (function() {
	/**
	 * Parses a raw log file from the first version and transforms it into a native Javascript object
	 */
	function parseLog(logdata) {
		let sections = splitSections(logdata, parseSections);
		
		for(let k in sections) { // FIXME: temporary
			this[k] = sections[k];
		}
	};


	/**
	 * Splits a log file into multiple sections using known section headers
	 * 
	 * This is not particularly reliable, but the logs don't have any kind of markers to help us out here
	 */
	function splitSections(log, parseSections) {
		let sections = {};
		let matches = [];
		
		// Find the beginning of every sections using our regexes
		for(let i = 0; i < parseSections.length; i++) {
			let match = parseSections[i].match.exec(log);
			
			if(match !== null) {
				matches.push({ section: parseSections[i], match: match});
			}
		}
		
		// Sort them in their actual file order
		matches = matches.sort(function(a, b) {
			return a.match.index - b.match.index;
		});
		
		// Extract all sections assuming it ends at the next section start
		for(let i = 0; i < matches.length; i++) {
			let m = matches[i];
			let end = (i+1 in matches) ? matches[i+1].match.index : log.length;
			let data = log.slice(m.match.index + m.match[0].length, end);
			sections[m.section.section] = m.section.parse(data);
		}
		
		return sections;
	}


	/**
	 * Default list of sections of a regular log file
	 */
	const parseSections = [
		// Debug Log ID
		{
			section: "id",
			match: /(^|\n)debug_id\n/m,
			parse: function(data) {
				return data;
			}
		},
		
		// System information
		{
			section: "sysinfo",
			match: /\nsysinfo\n/m,
			parse: formatJson
		},
		
		// Network interfaces
		{
			section: "interfaces",
			match: /\nnetinfo\ninterfaces:\n/m,
			parse: formatPlain
		},
		
		// Routing table
		{
			section: "routes",
			match: /\nroutes:\n/m,
			parse: formatPlain
		},
		
		// DNS
		{
			section: "dns",
			match: /\n\ndns:\n/m,
			parse: formatPlain
		},
		
		// Management daemon
		{
			section: "pia_manager",
			match: /\n.*?pia_manager.log\n/m,
			parse: function(data) {
				return splitDates(
					removeBasePath(data),
					[
						/^\[[0-9]{2}\/[0-9]{2}\/[0-9]{2,4} [0-9]{2}:[0-9]{2}:[0-9]{2}\] /,
						/^\[[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{3}Z\] /,
					]
				);
			}
		},
		
		// Tray App
		{
			section: "pia_nw",
			match: /\n.*?pia_nw.log\n/m,
			parse: function(data) {
				return splitDates(
					removeBasePath(data),
					[
						/^\[[0-9]{1,2}\/[0-9]{1,2}\/[0-9]{2,4}, [0-9]{1,2}:[0-9]{2}:[0-9]{2} (?:AM|PM)\] /,
						/^\[[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{3}Z\] /,
					]
				);
			}
		},
		
		// PIA protocol log
		{
			section: "pia_log",
			match: /\npia_log\n/m,
			parse: function(data) {
				return splitDates(
					removeBasePath(data),
					[
						/^[0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{3} /,
					],
					[
						"--- EOF ---",
					]
				);
			}
		},
		
		// OpenVPN
		{
			section: "openvpn",
			match: /\n.*?openvpn.log\n/m,
			parse: function(data) {
				return splitDates(
					removeBasePath(data),
					[/^(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun) (?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) (?: [0-9]|[0-9]{1,2}) [0-9]{2}:[0-9]{2}:[0-9]{2} [0-9]{4}/,]
				);
			}
		},
		
		// Regions
		{
			section: "regions",
			match: /\n.*?region_data.txt\n/m,
			parse: prettyJson
		},
		
		// Latencies
		{
			section: "latencies",
			match: /\n.*?latencies.txt\n/m,
			parse: prettyJson
		}
	];


	/**
	 * Formats regular JSON data
	 */
	function formatJson(data) {
		try {
			return JSON.parse(data.split("\n")[0]);
		} catch(e) {
			return null;
		}
	}


	/**
	 * Formats plain text: do nothing
	 */
	function formatPlain(data) {
		return data;
	}


	/**
	 * Formats JSON data and pretty-print it as-is
	 */
	function prettyJson(data) {
		return JSON.stringify(formatJson(data), null, 4);
	}


	/**
	 * Removes PIA's base path from the log and replace it with "PIA:" for readability
	 */
	function removeBasePath(text) {
		return text
			.replace(/^.*ocr[0-9A-Z]{4}\.tmp(?:\\|\/)/mg, "PIA:")
			.replace(/C:\\Program Files\\pia_manager/g, "PIA:")
		;
	}


	/**
	 * Splits a log text into lines using the date marker as the new line indicator
	 * (for multiline entries like stack traces)
	 */
	function splitDates(text, dateFormat, specialLines) {
		var lines = [];
		var currLine = {date: null, text: ""};
		specialLines = specialLines || [];
		
		text.split("\n").forEach(function(line) {
			if(line.search(/^[\s\t]*$/) >= 0) {
				return;
			}
			
			var date = [];

			for (var i = 0; i < dateFormat.length; i++) {
				date = line.match(dateFormat[i]);
				if (date) {
					break;
				}
			}
			
			// check special lines and break out early
			for (var i = 0; i < specialLines.length; i++) {
				if (line == specialLines[i]) {
					lines.push(currLine);
					currLine = {date: "", text: line + "\n"};
					return
				}
			}

			if(date) {
				lines.push(currLine);
				currLine = {date: date[0], text: line.substr(date[0].length) + "\n"};
			}
			else {
				currLine.text += line + "\n";
			}
		});

		// Remove initial empty line
		if(lines.length > 0 && lines[0].date === null) {
			lines = lines.slice(1);
		}
		
		return lines;
	}
	
	return parseLog;
})();
