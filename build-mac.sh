#!/bin/sh

#export ELECTRON_VERSION=${ELECTRON_VERSION:-1.4.16}
export ELECTRON_VERSION=${ELECTRON_VERSION:-2.0.16}

echo Building with Electron $ELECTRON_VERSION

rm -Rf /f/redshift/Redshift.app

cd ~/Nativefier \
	&& rm -Rf Redshift*/

nativefier -e $ELECTRON_VERSION -n "Redshift" --icon ~/Pictures/Redshift.png --hide-window-frame http://localhost:8080 \
	&& cp -R Redshift*/Redshift.app /f/redshift/Redshift.app && echo "Success" || echo "Fail"
