#!/bin/sh
set -e

echo "const DEBUGLOG_CSS = \`" > ../debuglog.js
sass style.scss >> ../debuglog.js;
echo "\`;" >> ../debuglog.js
cat template.js LogParser.js run.js >> ../debuglog.js 
