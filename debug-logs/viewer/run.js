document.documentElement.innerHTML = renderDebugLog(
	new LogParser(document.getElementsByTagName("pre")[0].textContent)
);
"";
