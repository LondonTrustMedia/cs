const DEBUGLOG_CSS = `
html, body {
  margin: 0;
  padding: 0; }

body {
  font-family: sans-serif;
  color: #333333;
  background: #D2E9D5;
  padding: 40px 0 0 60px;
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
    padding: 0 10px;
    height: 100%;
    white-space: nowrap; }
  header div.log-id {
    background: #4ABF5A;
    width: 60px;
    max-width: 60px;
    padding: 0;
    text-align: center;
    flex-shrink: 0; }
    header div.log-id:before {
      content: "Log ID:";
      display: block;
      font-size: 0.6em;
      height: 1.6em;
      margin-top: -0.85em; }
  header div.app-version {
    background: #47B856; }
    header div.app-version:before {
      content: "v"; }
  header div.device {
    background: #47B856;
    border-left: 2px solid #39B54A; }

nav {
  position: fixed;
  top: 40px;
  left: 0;
  bottom: 0;
  width: 60px;
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
    border-radius: 4px 4px 0 0;
    background: #1F9A2E;
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
		openvpn_config: {text: "Conf",  tooltip: "OpenVPN Configuration"},
		pia_manager: {text: "Mng",  tooltip: "Management Daemon"},
		pia_nw:      {text: "NW",   tooltip: "Tray Application"},
		pia_log:     {text: "VPN",  tooltip: "PIA Protocol Log"},
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
		${renderDevice(log.sysinfo.device)}
		<div class="os">${esc(log.sysinfo.os_version)}</div>
	</header>

	<nav>
		${renderNav(log)}
	</nav>

	<div class="contents">
		${renderLogPlain(log, "interfaces", "Network Interfaces")}
		${renderLogPlain(log, "dns", "DNS Configuration")}
		${renderLogPlain(log, "routes", "Routes")}
		${renderLogPlain(log, "openvpn_config", "OpenVPN Configuration")}
		${renderLogMultiline(log, "pia_manager", "Management Daemon")}
		${renderLogMultiline(log, "pia_nw", "Tray Application")}
		${renderLogMultiline(log, "pia_log", "PIA Protocol Log")}
		${renderLogMultiline(log, "openvpn", "OpenVPN")}
		${renderLogPlain(log, "regions", "Regions")}
		${renderLogPlain(log, "latencies", "Latencies")}
		${renderLogPlain(log, "crash", "Crash Dumbs")}
	</div>
</body>
</html>`;
	}


	/**
	 * Renders the device info if it should be there
	 */
	function renderDevice(device) {
		if (device) {
			return `<div class="device">${esc(device)}</div>`
		}
		return "";
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
		if(!str) {
			return "";
		}
		if(typeof str === "number") {
			return str;
		}
		
		return str
			.replace(/&/g, "&amp;")
			.replace(/</g, "&lt;")
			.replace(/>/g, "&gt;")
			.replace(/"/g, "&quot;")
			.replace(/'/g, "&#039;")
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
			let data = log.slice(m.match.index + m.match[0].length, end).trim();
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
		
		// OpenVPN Config
		{
			section: "openvpn_config",
			match: /\n\openvpn_config\n/m,
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
						/^[0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2} /,
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
document.documentElement.innerHTML = renderDebugLog(
	new LogParser(document.getElementsByTagName("pre")[0].textContent)
);
