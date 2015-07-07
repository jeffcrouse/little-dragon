#!/bin/bash

killall fcserver-osx
killall ledControl
killall ldserver

cd "${HOME}/Developer/little-dragon/fadecandy/"
./fcserver-osx showtime.json >> ${HOME}/Desktop/fcserver.log 2>&1 &

cd "${HOME}/Developer/little-dragon/fadecandy/ledControl/application.macosx"
open ledControl.app >> ${HOME}/Desktop/ledControl.log 2>&1 &

cd "${HOME}/Developer/little-dragon/ldserver"
node server.js >> ${HOME}/Desktop/server.log 2>&1 &

cd "${HOME}/Developer/little-dragon/songs/1_pink_cloud Project"
open 1_pink_cloud.als



