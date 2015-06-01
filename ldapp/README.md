# Little Dragon Mobile App


This is an app that is made with the [Cordova Command Line Interface](http://cordova.apache.org/docs/en/5.0.0/guide_cli_index.md.html#The%20Command-Line%20Interface) with the [Crosswalk Plugin](https://github.com/crosswalk-project/cordova-plugin-crosswalk-webview) and some other plugins. There are some caveats about [using WebGL in xwalk/Cordova](https://crosswalk-project.org/documentation/about/faq.html#Canvas-and-WebGL-support).

# Post-git Checkout Steps
1. Try `sudo npm install -g cordova` 
1. If that fails for some reason, try following the [cordova setup steps](https://cordova.apache.org/docs/en/4.0.0/guide_cli_index.md.html)
1. open up a terminal window in the "ldapp" filder
1. `cordova prepare`  # This will fetch all platforms (android, ios) and plugins (crosswalk, vibration, osc, device, ZeroConf, Insomnia, network-information) saved in config.xml
1. You might have to ` sudo npm install -g ios-sim` if you want to run on ios
1. `cordova emulate [android | ios]`
1. `cordova run [android | ios] --device`


## Setup Steps

Just for posterity, this is how I setup the entire project

1. sudo npm install -g cordova
1. cordova create ldapp com.odddivision.littledragon LittleDragon
1. cd little-dragon
1. cordova platform add android --save
1. cordova platform add ios --save
	1. sudo npm install -g ios-sim
	1. sudo npm install -g ios-deploy
1. cordova plugin add cordova-plugin-crosswalk-webview --save
1. cordova plugin add cordova-plugin-vibration --save
1. cordova plugin add https://github.com/sy1vain/cordova-osc-plugin.git --save
1. cordova plugin add org.apache.cordova.device --save
1. cordova plugin add https://github.com/vstirbu/ZeroConf --save
1. cordova plugin add plugin add https://github.com/EddyVerbruggen/Insomnia-PhoneGap-Plugin.git --save
1. cordova plugin add cordova-plugin-network-information --save
1. cordova build
1. Add to config.xml

    <!-- force landscape mode -->
    <preference name="Orientation" value="landscape" />
    <!-- needed to enable WebGL -->
    <preference name="xwalkCommandLine" value="--ignore-gpu-blacklist" />
    <!-- get rid of top menubar -->
    <preference name="Fullscreen" value="true" />
    <!-- for iOS -->
    <preference name="DisallowOverscroll" value="true"/>
    <!-- for iOS, to get rid of warning about iCloud backup -->
    <preference name="BackupWebStorage" value="local" />

1. cordova emulate android
1. cordova run --device

## Release Build
Only if you want to make a release build, which I haven't noticed makes too much of a difference. This was a PITA to figure out. I pieced it together painfully from tiny clues at the [Cordova Android Tools instructions](https://cordova.apache.org/docs/en/edge/guide_platforms_android_tools.md.html).

1. [Generate a keystore](https://docs.oracle.com/cd/E19509-01/820-3503/ggfen/index.html)
`keytool -keystore platforms/android/dragon.keystore -genkey -alias dragon`

2. Make a file called `release-signing.properties` and put it into the platforms/android folder. This will be auto-detected by the Gradle build system apparently.
3. Put the following inside
    storeFile=dragon.keystore
    storePassword=dragonito
    keyAlias=dragon
    keyPassword=dragonito
4. cordova run --release android