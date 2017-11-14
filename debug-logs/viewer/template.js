const renderDebugLog = (function(css) {
	const navSections = {
		interfaces:  {text: "IP",   tooltip: "Network Configuration"},
		dns:         {text: "DNS",  tooltip: "DNS Configuration"},
		routes:      {text: "Ro",   tooltip: "Routes"},
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
