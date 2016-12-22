/**
 * Manages the log viewer <div> element
 */
function LogViewer(log) {
	this.log = log;
	this.dom = document.createElement("div");
	this.dom.className = "pia-debug-log";
	
	this.parser = new LogParser(log);
	this.sections = this.parser.parse();
	this.renderSections(this.sections);
}

/**
 * Renders all sections
 */
LogViewer.prototype.renderSections = function(sections) {
	var that = this;
	var xhr = new XMLHttpRequest();
	xhr.open("GET", chrome.extension.getURL("src/debuglog.html"), true);
	xhr.onreadystatechange = function() {
		if(xhr.readyState === 4) {
			that.renderSectionsTemplate(xhr.responseText, sections);
		}
	};
	xhr.send();
};

/**
 * Renders all sections using an HTML text template and the sections data
 */
LogViewer.prototype.renderSectionsTemplate = function(html, sections) {
	this.dom.innerHTML = html;
	this.domlog = this.dom.querySelector("div.contents");
	
	for(var section in sections) {
		var func = "render_" + section;
		
		if(func in this) {
			this[func](sections[section]);
		}
	}
};

/**
 * Renders the debug log ID
 */
LogViewer.prototype.render_debug_id = function(id) {
	this.dom.querySelector("header .log-id").textContent = id;
	document.title = "Log #" + id + " | PIA Support Tools";
};

/**
 * Renders the system information and versions
 */
LogViewer.prototype.render_sysinfo = function(sysinfo) {
	this.dom.querySelector("header .app-version").textContent = sysinfo.app_version;
	this.dom.querySelector("header .os").textContent = sysinfo.os_version;
};

/**
 * Renders regular sections
 */
LogViewer.prototype.render_plain = function(titleText, text) {
	var section = document.createElement("section");
	var title = document.createElement("h3");
	title.textContent = titleText;
	var content = document.createElement("pre");
	content.textContent = text;
	
	section.appendChild(title);
	section.appendChild(content);
	this.domlog.appendChild(section);
	
	return section;
};

/**
 * Renders a parsed multiline section
 */
LogViewer.prototype.render_multiline = function(titleText, lines) {
	var section = document.createElement("section");
	var title = document.createElement("h3");
	title.textContent = titleText;
	var content = document.createElement("pre");
	
	lines.forEach(function(line, i) {
		var lineEl = document.createElement("div");
		lineEl.className = "log-line " + (i&1 ? "odd" : "even");
		
		var span = document.createElement("span");
		span.className = "date";
		span.textContent = line.date;
		lineEl.appendChild(span);
		
		span =  document.createElement("span");
		span.className = "text";
		span.textContent = line.text;
		lineEl.appendChild(span);
		
		content.appendChild(lineEl);
	});
	
	section.appendChild(title);
	section.appendChild(content);
	this.domlog.appendChild(section);
	
	return section;
};

/**
 * Renders the interfaces section
 */
LogViewer.prototype.render_interfaces = function(text) {
	this.render_plain("Network Interfaces", text).id = "interfaces";
};

/**
 * Renders the routes section
 */
LogViewer.prototype.render_routes = function(text) {
	this.render_plain("Routes", text).id = "routes";
};

/**
 * Renders the pia_manager section
 */
LogViewer.prototype.render_pia_manager = function(text) {
	text = this.helper_removeBasePath(text);
	text = this.helper_splitDate(text, /^\[[0-9]{2}\/[0-9]{2}\/[0-9]{2,4} [0-9]{2}:[0-9]{2}:[0-9]{2}\] /);
	
	this.render_multiline("PIA Manager Daemon", text).id = "pia_manager";
};

/**
 * Renders the pia_nw section
 */
LogViewer.prototype.render_pia_nw = function(text) {
	text = this.helper_removeBasePath(text);
	text = this.helper_splitDate(text,
		/^\[[0-9]{1,2}\/[0-9]{1,2}\/[0-9]{2,4}, [0-9]{1,2}:[0-9]{2}:[0-9]{2} (?:AM|PM)\] /);
	this.render_multiline("PIA NW Tray", text).id = "pia_nw";
};

/**
 * Renders the openvpn section
 */
LogViewer.prototype.render_openvpn = function(text) {
	text = this.helper_removeBasePath(text);
	text = this.helper_splitDate(text,
		/^(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun) (?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) [0-9]{1,2} [0-9]{2}:[0-9]{2}:[0-9]{2} [0-9]{4}/);
	this.render_multiline("OpenVPN", text).id = "openvpn";
};

/**
 * Renders the regions section
 */
LogViewer.prototype.render_regions = function(json) {
	this.render_plain("Regions", JSON.stringify(json, null, 4)).id = "regions";
};

/**
 * Renders the latencies section
 */
LogViewer.prototype.render_latencies = function(json) {
	this.render_plain("latencies", JSON.stringify(json, null, 4)).id = "latencies";
};


/**
 * Removes PIA's base path(s) from the source file to reduce the line length
 */
LogViewer.prototype.helper_removeBasePath = function(text) {
	return text
		.replace(/^.*ocr[0-9A-Z]{4}\.tmp(?:\\|\/)/mg, "PIA:")
		.replace(/C:\\Program Files\\pia_manager/g, "PIA:")
	;
};

/**
 * Splits a log text by lines using the date tag
 */
LogViewer.prototype.helper_splitDate = function(text, dateFormat) {
	var lines = [];
	var currLine = {date: null, text: ""};
	
	text.split("\n").forEach(function(line) {
		if(line.search(/^[\s\t]*$/) >= 0) {
			return;
		}
		
		var date = line.match(dateFormat);
		
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
};


/**
 * Parses and splits the log file
 */
function LogParser(log) {
	this.log = log;
}

/**
 * Lists of all known sections to extract
 */
LogParser.prototype.parseSections = [
	{ section: "debug_id",    match: /(^|\n)debug_id\n/m,           parse: "debug_id" },
	{ section: "sysinfo",     match: /\nsysinfo\n/m,                parse: "json" },
	{ section: "interfaces",  match: /\nnetinfo\ninterfaces:\n\n/m, parse: "plain"},
	{ section: "routes",      match: /\nroutes:\n/m,                parse: "plain"},
	{ section: "pia_manager", match: /\n.*?pia_manager.log\n/m,     parse: "plain"},
	{ section: "pia_nw",      match: /\n.*?pia_nw.log\n/m,          parse: "plain"},
	{ section: "openvpn",     match: /\n.*?openvpn.log\n/m,         parse: "plain"},
	{ section: "regions",     match: /\n.*?region_data.txt\n/m,     parse: "json"},
	{ section: "latencies",   match: /\n.*?latencies.txt\n/m,       parse: "json"}
];

/**
 * Parses the debug_id section
 */
LogParser.prototype.parse_debug_id = function(data) {
	try {
		return parseInt(data, 10);
	} catch(e) {
		return 0;
	}
};

/**
 * Parses a JSON section
 */
LogParser.prototype.parse_json = function(data) {
	try {
		return JSON.parse(data.split("\n")[0]);
	} catch(e) {
		return null;
	}
};

/**
 * Parses a plain text section
 */
LogParser.prototype.parse_plain = function(data) {
	return data;
};

/**
 * Main parser that processes the log file
 */
LogParser.prototype.parse = function() {
	var sections = {};
	var matches = [];
	
	for(var i = 0; i < this.parseSections.length; i++) {
		var match = this.parseSections[i].match.exec(this.log);
		
		if(match !== null) {
			matches.push({ section: this.parseSections[i], match: match});
		}
	}
	
	matches = matches.sort(function(a, b) {
		return a.match.index - b.match.index;
	});
	
	for(var i = 0; i < matches.length; i++) {
		var m = matches[i];
		var end = (i+1 in matches) ? matches[i+1].match.index : this.log.length;
		var func = "parse_" + m.section.parse;
		var data = this.log.slice(m.match.index + m.match[0].length, end);
		
		if(func in this) {
			sections[m.section.section] = this[func](data);
		} else {
			sections[m.section.section] = data;
		}
	}
	
	return sections;
};


/**
 * Initialize on load
 */
(function() {
	var logNode = document.getElementsByTagName('pre')[0];
	var logViewer = new LogViewer(logNode.textContent);
	logNode.parentNode.replaceChild(logViewer.dom, logNode);
})();
