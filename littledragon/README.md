# Little Dragon Mobile App


This is an app that is made with the [Cordova Command Line Interface](http://cordova.apache.org/docs/en/5.0.0/guide_cli_index.md.html#The%20Command-Line%20Interface) with the [Crosswalk Plugin](https://github.com/crosswalk-project/cordova-plugin-crosswalk-webview) and some other plugins. There are some caveats about [using WebGL in xwalk/Cordova](https://crosswalk-project.org/documentation/about/faq.html#Canvas-and-WebGL-support).

# Post-git Checkout Steps
1. `cordova prepare`  # This will fetch all platforms and plugins saved in config.xml
1. You might have to ` sudo npm install -g ios-sim` if you want to run on ios
1. `cordova emulate [android | ios]`
1. `cordova run [android | ios] --device`


## Setup Steps

1. sudo npm install -g cordova
1. cordova create littledragon com.odddivision.littledragon LittleDragon
1. cd little-dragon
1. cordova platform add android --save
1. cordova platform add ios --save
	1. sudo npm install -g ios-sim
1. cordova plugin add cordova-plugin-crosswalk-webview --save
1. cordova plugin add cordova-plugin-vibration --save
1. cordova plugin add https://github.com/sy1vain/cordova-osc-plugin.git --save
1. cordova build
1. Add to config.xml

<!-- needed to enable WebGL -->
<preference name="xwalkCommandLine" value="--ignore-gpu-blacklist" />
<preference name="Orientation" value="landscape" />
<!-- get rid of top menubar -->
<preference name="Fullscreen" value="true" />

1. cordova emulate android
1. cordova run --device

