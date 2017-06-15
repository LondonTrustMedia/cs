#!/bin/sh
set -e

echo -n "const DEBUGLOG_CSS = \`" > ../debuglog.js
sassc style.scss >> ../debuglog.js;
echo "\`;" >> ../debuglog.js
cat template.js LogParser.js run.js >> ../debuglog.js 
