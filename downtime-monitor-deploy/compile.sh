#!/usr/bin/env sh
GOOS=linux GOARCH=amd64 go build downtimealert.go
scp downtimealert dan@96.126.111.175:/home/dan/service-monitor/
scp config.yaml dan@96.126.111.175:/home/dan/service-monitor/
echo "Program Copied"
echo ""
echo ">> NOW SSH TO THE BOX AND CONFIRM IT WORKS <<"
echo ""
