#!/bin/sh

# ipmon
LOAD_SETTINGS() {
    #load all settings from syabas generated file (esp Workgroup & ipaddress)
    sed '/=/ {s/=/="/;s/$/"/}' /tmp/setting.txt > /tmp/setting.txt.sh
    . /tmp/setting.txt.sh
}

LOAD_SETTINGS
while sleep 30 ; do
    if ! ping -c 1 $eth_gateway ; then
        ( ping -c 1 $eth_gateway ; ifconfig eth0 ; date ; ifdown eth0 ; ifup eth0 ; ping -c 1 $eth_gateway  )  >> /share/ip.log
        sleep 60
    fi
done
