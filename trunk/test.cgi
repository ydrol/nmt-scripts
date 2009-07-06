#!/bin/sh
#
echo "Content-Type: text/html"
echo

DOIT() {
    ( su -s /bin/sh -c "sleep 120" </dev/null >/dev/null 2>&1 & )
}

#Log attempts by gaya/wget
date >> /share/attempts.log
echo "ARGS $*" >> /share/attempts.log

if [ "$1" = "test2" ] ; then
    #Attempt to start a long running process.
    DOIT &
fi

#
cat <<HERE
<html>
<head>
<meta http-equiv="REFRESH" content="4;./test.cgi?done" > 
</head>
<body>
ARGS $1
</body>
</html>
HERE

echo "done ARGS $1" >>/share/attempts.log
