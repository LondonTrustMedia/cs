#!/bin/bash
set -e
NS=vpnbench
FIFO=""
SELF=""
LOG="log.txt"

function benchmark() {
	nsexe speedtest-cli --simple --secure | sed 's/^/        /g'
}


###################

function init() {
	FIFO=$PWD/benchmark.fifo
	SELF=$(which "${BASH_SOURCE[0]}")
	
	mkfifo "$FIFO" || true
	ip netns add "$NS" || true
}

function clean() {
	ip netns del "$NS"
	rm "$PWD/benchmark.fifo"
}

function nsexe() {
	ip netns exec "$NS" $@ || true
}

function run() {
	local vpid
	local vpnip
	
	if [[ ! -d "$2" ]]; then
		echo "Error: A directory of VPN profiles must be specified." > /dev/stderr
		clean
		exit -1
	fi
	
	for provider in "$2"/*/; do
		prettyProvider=${provider#$2/}
		echo "${prettyProvider%*/}:"
		
		for profile in "${provider}"*.ovpn; do
			echo "    $(echo $profile | sed -r 's|.*?/(.*?)\.ovpn|\1|'):"
			profile=$(realpath "$profile")
			
			openvpn \
				--cd "$(dirname "${profile}")" \
				--config "$profile" \
				--script-security 2 \
				--iproute "$SELF" \
				--route-up "$SELF vpn-up '$FIFO'" \
				--down "$SELF vpn-down '$FIFO'" \
				2>&1 >> "$LOG" &
			vpid=$!
			
			# Ugly, but OpenVPN will take much longer to start anyway
			sleep 3 # catch config errors
			
			if ps $vpid > /dev/null; then
				read vpnip < "$FIFO" # wait for VPN to go up
				
				if [[ "$vpnip" != "ABORT" ]]; then
					benchmark || true
					kill $vpid || true
					wait $vpid || true
				fi
			fi
		done
	done
}

function vpnip() { # link set dev tun0 up ...
	if [[ "$1" = "link" ]]; then
		ip link set dev $4 netns "$NS"
	fi
	
	nsexe ip $@ 2>&1 >> "$LOG"
}

function vpnup() { # 1:tun_dev 2:tun_mtu 3:link_mtu 4:local_ip 5:remote_ip 6:action
	echo $4 > "$FIFO" # notify main script of the VPN being up
}

function vpndown() {
	true
}

case $1 in
	clean)
		clean
		;;
	
	run)
		init
		run $@
		clean
		;;
	
	abort)
		FIFO=$PWD/benchmark.fifo
		echo ABORT > "$FIFO"
		;;
	
	# OpenVPN hacks
	link|route|addr)
		vpnip $@
		;;
	
	vpn-up)
		FIFO="$2"
		shift 2
		vpnup $@
		;;
	
	vpn-down)
		FIFO="$2"
		shift 2
		vpndown $@
		;;
	
	*)
		echo "Usage: $0 {run|clean|abort} [profiles-directory]"
		echo '  Profiles directory structure must be $provider/*.ovpn'
esac
