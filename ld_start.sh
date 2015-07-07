#!/bin/bash

killall fcserver-osx
killall ledControl
killall ldserver

echo "=== LAUNCHING fcserver-osx ==="
cd "${HOME}/Developer/little-dragon/fadecandy/"
./fcserver-osx showtime.json >> ${HOME}/Desktop/fcserver.log 2>&1 &

sleep 5

echo "=== LAUNCHING ledControl ==="
cd "${HOME}/Developer/little-dragon/fadecandy/ledControl/application.macosx"
open -g ledControl.app

echo "=== LAUNCHING ldserver ==="
cd "${HOME}/Developer/little-dragon/ldserver"
node server.js >> ${HOME}/Desktop/server.log 2>&1 &

echo "=== LAUNCHING 1_pink_cloud.als  ==="
cd "${HOME}/Developer/little-dragon/songs/1_pink_cloud Project"
open -g 1_pink_cloud.als

echo "=== DONE  ==="
sleep 5