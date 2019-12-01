Connect nox to adb: just adb connect 127.0.0.1:62001

Enable "Root" checkbox in nox setting
Go to setting in nox emulator, turn on developer option, turn on usb debugging
Go to nox directory, run command: nox_adb.exe connect 127.0.0.1:62001 It works for me

adb shell screencap -p /sdcard/screenshot.png - take a screenshot

am start -a android.intent.action.VIEW 'Elon Musk' - в браузере загуглить

adb shell am start -a android.intent.action.VIEW -c android.intent.category.BROWSABLE -e android.intent.extra.REFERRER_NAME android-app://com.google.android.googlequicksearchbox/https/www.packtpaintings.com -d http://examplepetstore.com/host_path com.packt.android

am start -n android.intent.action.VIEW -d "google.com/search?q=how%20can%20I%20do%20it?" --activity-clear-task

"OK Google"
adb shell am start -n com.google.android.googlequicksearchbox/com.google.android.apps.gsa.staticplugins.opa.OpaActivity

"Run lite search app"
monkey -p com.google.android.apps.searchlite 1


"Run main google app"
am start -n com.google.android.googlequicksearchbox/com.google.android.apps.gsa.searchnow.SearchNowActivity


"Run main google app"
am start -n com.google.android.googlequicksearchbox/com.google.android.googlequicksearchbox.SearchActivity
input text "Elon%sMusk"
input keyevent 66 - Enter; 3 - Home



"Take a screenshot"
adb -e shell screencap -p /sdcard/screen.png
adb pull /sdcard/screen.png
adb shell rm /sdcard/screen.png


