#!/bin/sh 
# $Id$

VERSION=20090116-1
#Cant use named pipes due to blocking at script level
EXE=$0
while [ -L "$EXE" ] ; do
    EXE=$( ls -l "$EXE" | sed 's/.*-> //' )
done
HOME=$( echo $EXE | sed -r 's|[^/]+$||' )
HOME=$(cd "${HOME:-.}" ; pwd )
TVMODE=`cat /tmp/tvmode`
OWNER=nmt
GROUP=nmt
cd "$HOME"

PERMS() {
    chown $OWNER:$GROUP "$1" "$1"/*
}

HTML() {
    echo "<p>$@<p>"
}


site="http://prodynamic.co.uk/nmt/$appname"
backupdir="$HOME.backup_undo"

UPGRADE() {

    appname="$1"

    cd "$HOME"

    #Because HDX/Istar lacks any compression utils using tar files from now on.
    echo "<p>Start $1<p>"
    case "$2" in 
        check)
            rm -f VERSION
            if ! wget -q -O VERSION "$site/VERSION" ; then
                echo ERROR > VERSION
                PERMS .
                exit 1
            fi
            ;;
        checkbeta)
            rm -f VERSION
            if ! wget -q -O VERSION "$site/VERSION-BETA" ; then
                echo ERROR > VERSION
                PERMS .
                exit 1
            fi
            ;;
            #This is not a first time install but just to overwrite files with
            # downloaded ones. see install-cgi for first time install
        install)
            NEWVERSION=`cat VERSION`
            tardir="$HOME/versions"
            newtgzfile="$appname-$NEWVERSION.tgz" 
            newtarfile="$appname-$NEWVERSION.tar" 

            if [ ! -d "$tardir" ] ; then mkdir p "$tardir" ; fi
            PERMS .

            #Get new
            HTML Fetch $site/$newtgzfile 
            rm -f -- "$tardir/$newtgzfile"
            if ! wget -q  -O "$tardir/$newtgzfile" "$site/$newtgzfile" ; then
                echo "ERROR getting $site/$newtgzfile" > VERSION;
                PERMS .
                exit 1
            fi

            $HOME/gunzip.php "$newtgzfile" "$newtarfile"
            rm -f "$newtgzfile"

            HTML Backup old files
            if [ -d "$backupdir" ] ; then
                if [ -d "$backupdir.2" ] ; then
                    rm -fr -- "$backupdir.2"
                fi
                mv "$backupdir" "$backupdir.2"
            fi
            cp -a "$HOME" "$backupdir"

            if [ -f pre-update.sh ] ; then rm -f ./pre-update.sh ;  fi
            if [ -f post-update.sh ] ; then rm -f ./post-update.sh || true ; fi

            HTML Unpack new files
            tar xf "$tardir/$newtarfile"
            chown -R $OWNER:$GROUP .

            HTML Pre Update actions
            if [ -f pre-update.sh ] ; then
                ./pre-update.sh || true
                rm -f ./pre-update.sh || true
            fi

            HTML Set Permissions
            PERMS "$tardir"

            HTML Post Update actions
            if [ -f post-update.sh ] ; then
                ./post-update.sh || true
                rm -f ./post-update.sh || true
            fi

            HTML Upgrade Complete
            ;;

        undo)

            if [ ! -d "$backupdir" ] ; then
                echo Cant undo : no folder "$backupdir"
                return 1;
            fi

            if [ -d "$backupdir.abort" ] ; then
                rm -fr -- "$backupdir.abort"
            fi

            mv "$HOME" "$backupdir.abort"
            mv "$backupdir" "$HOME"
            chown -R $OWNER:$GROUP .

            HTML Undo Complete
            ;;
    esac

}

UPGRADE "$@"
