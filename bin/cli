#!/bin/bash

# Follow symlinks to $0 to find ourselves.
src="${BASH_SOURCE[0]}"
while [ -h "$src" ]; do
  bindir="$( cd -P "$( dirname "$src" )" && pwd )"
  src="$(readlink "$src")"
  [[ $src != /* ]] && src="$bindir/$src"
done

bindir="$( cd -P "$( dirname "$src" )" && pwd )"

# Locate the install root
root=`dirname "$bindir"`

forever="$root/node_modules/forever/bin/forever"
script="$root/server.js"

case "$1" in
    start)
        extra_opts="--spinSleepTime 1000 --minUptime 30000"
        ;;
    list)
        script=""
        ;;
    logs)
        script=""
        ;;
    -h)
        echo "Usage: $0 [start|restart|stop|list|logs]"
        exit
esac

NODE_ENV=production $forever ${*:1} $extra_opts $script
