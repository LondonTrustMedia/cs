const DEBUGLOG_CSS = `html, body {
  margin: 0;
  padding: 0; }

body {
  font-family: sans-serif;
  color: #333333;
  background: #D2E9D5;
  padding: 40px 0 0 50px;
  margin-top: -50px; }

header {
  display: flex;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 40px;
  line-height: 40px;
  background: #39B54A;
  color: white; }
  header > div {
	white-space: nowrap;
	padding: 0 10px;
	height: 100%; }
  header div.log-id {
	background: #4ABF5A;
	width: 50px;
	max-width: 50px;
	padding: 0;
	flex-shrink: 0;
	text-align: center; }
	header div.log-id:before {
	  content: "#"; }
  header div.app-version {
	background: #47B856; }
	header div.app-version:before {
	  content: "v"; }

nav {
  position: fixed;
  top: 40px;
  left: 0;
  bottom: 0;
  width: 50px;
  background: #39B54A; }
  nav a.button {
	display: block;
	margin: 5px;
	padding: 0;
	text-align: center;
	line-height: 40px;
	color: white;
	text-decoration: none;
	background: #4ABF5A;
	border-radius: 5px;
	transition: background 60ms; }
	nav a.button:hover {
	  background: #57E069; }

section {
  margin: 10px;
  overflow: hidden;
  padding-top: 50px;
  border-radius: 4px; }
  section h3 {
	margin: 0;
	padding: 5px 10px;
	background: #1F9A2E;
	border-radius: 4px 4px 0 0;
	color: white; }
  section pre, section div.log-lines {
	background: #fafafa;
	margin-top: 0; }
  section pre {
	padding: 10px;
	overflow-y: hidden;
	overflow-x: auto;
	white-space: pre-wrap; }
  section div.log-lines {
	padding: 10px;
	overflow-y: hidden;
	overflow-x: auto;
	font-family: monospace;
	font-size: 13px; }
  section div.log-lines div.line {
	display: flex;
	transition: background 45ms;
	border-radius: 3px; }
	section div.log-lines div.line .date {
	  padding: 3px 5px;
	  color: #acacac;
	  white-space: nowrap;
	  text-decoration: none; }
	section div.log-lines div.line .text {
	  padding: 3px 5px;
	  color: #333333;
	  line-height: 150%;
	  white-space: pre; }
	section div.log-lines div.line.odd {
	  background: #f5f5f5; }
	section div.log-lines div.line:hover {
	  background: #EEF5EF; }
	section div.log-lines div.line:target {
	  background: #FFF4C1; }
`;
const renderDebugLog = (function(css) {
	const navSections = {
		interfaces:  {text: "IP",   tooltip: "Network Configuration"},
		dns:         {text: "DNS",  tooltip: "DNS Configuration"},
		routes:      {text: "Ro",   tooltip: "Routes"},
		pia_manager: {text: "Mng",  tooltip: "Management Daemon"},
		pia_nw:      {text: "NW",   tooltip: "Tray Application"},
		openvpn:     {text: "VPN",  tooltip: "OpenVPN"},
		regions:     {text: "Re",   tooltip: "Regions"},
		latencies:   {text: "Ping", tooltip: "Latencies"},
		crash:       {text: "Xx",   tooltip: "Crash Logs"}
	};
		
	return function(log) {
		return `
<!DOCTYPE html>
<html>
<head>
	<meta charset="UTF-8" />
	<title> Log #${esc(log.id)} | PIA Support Tools </title>
	<style>${css}</style>
</head>
<body>
	<header>
		<div class="log-id">${esc(log.id)}</div>
		<div class="app-version">${esc(log.sysinfo.app_version)}</div>
		<div class="os">${esc(log.sysinfo.os_version)}</div>
	</header>

	<nav>
		${renderNav(log)}
	</nav>

	<div class="contents">
		${renderLogPlain(log, "interfaces", "Network Interfaces")}
		${renderLogPlain(log, "dns", "DNS Configuration")}
		${renderLogPlain(log, "routes", "Routes")}
		${renderLogMultiline(log, "pia_manager", "Management Daemon")}
		${renderLogMultiline(log, "pia_nw", "Tray Application")}
		${renderLogMultiline(log, "openvpn", "OpenVPN")}
		${renderLogPlain(log, "regions", "Regions")}
		${renderLogPlain(log, "latencies", "Latencies")}
		${renderLogPlain(log, "crash", "Crash Dumbs")}
	</div>
</body>
</html>`;
	}
	
	
	/**
	 * Renders the navigation section
	 */
	function renderNav(log) {
		let render = "";
		for(let s in navSections) if(s in log) {
			let ss = navSections[s];
			render += `<a href="#${s}" class="button" title="${esc(ss.tooltip)}">${esc(ss.text)}</a>\n`;
		}
		return render;
	}
	
	
	/**
	 * Renders a plain text section
	 */
	function renderLogPlain(log, sectionid, title) {
		if(!(sectionid in log)) return "";
		
		return `<section id="${sectionid}">
				<h3>${esc(title)}</h3>
				<pre>${esc(log[sectionid])}</pre>
			</section>
		`;
	}
	
	
	/**
	 * Renders a multiline section
	 */
	function renderLogMultiline(log, sectionid, title) {
		if(!(sectionid in log)) return "";
		
		let lines = "";
		
		for(let i in log[sectionid]) {
			let line = log[sectionid][i];
			lines += `<div id="${sectionid}:${i}" class="line ${i&1 ? 'odd' : 'even'}">
				<a href="#${sectionid}:${i}" class="date">${line.date}</a>
				<span class="text">${esc(line.text)}</span>
			</div>
			`;
		}
		
		return `<section id="${sectionid}">
				<h3>${esc(title)}</h3>
				<div class="log-lines">
					${lines}
				</div>
			</section>
		`;
	}
	
	
	/**
	 * Poor man's HTML escaping
	 */
	function esc(str) {
		if(!str) return "";
		if(typeof str === "number") return str;
		
		return str
			.replace("&", "&amp;")
			.replace("<", "&lt;")
			.replace(">", "&gt;")
			.replace('"', "&quot;")
			.replace("'", "&#039;")
		;
	}
})(DEBUGLOG_CSS);
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
				try {
					return parseInt(data, 10);
				} catch(e) {
					return 0;
				}
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
	function splitDates(text, dateFormat) {
		var lines = [];
		var currLine = {date: null, text: ""};
		
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
document.documentElement.innerHTML = renderDebugLog(
	new LogParser(document.getElementsByTagName("pre")[0].textContent)
);