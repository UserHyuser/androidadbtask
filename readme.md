 Script launch GoogleApp, send request "Elon Musk", goes through the first link. After that it collapse all windows.
<br> Works on 720p tablet mode 20fps settings of NOX player
<br> Works with big timeouts because was tested on emulator which works awful.
<br> Known issues: <li>Google result page isn't static. So somewhere you need to update screenshots (replace ./screens/screens/cropped... on ./screens/cropped).
<li> If emulator too laggy some adb input commands may work incorrect 

------------------------------------------------------------------------------------------------------------------------------
 Скрипт запускает приложение Google, составляет запрос "Elon Musk", переходит по первой ссылке и выходит на домашний экран.
<br> Работает с большими задержками, так как тестировался через эмулятор, который работает неприлично медленно.
<br> Еще не всегда нормально срабатывают adb команды через эмулятор. Решение: добавить кучу проверок или увеличить время ожидания между командами.
<br> Известные проблемы: <li>Результат поиска гугл часто меняется (добавляются актуальные новости свурху результатов), иногда придется править эталонные скриншоты (заменой ./screens/screens/cropped... on ./screens/cropped).
<li> Если эмулятор идет очень проблемно (как у меня, например), возможны некорректные результы  выполнения команд adb input
 
 
------------------------------------------------------------------------------------------------------------------------------
<br> Screenshots to compare with : ./screenshots/screenshots
<br> Tags: adb node.js nodejs android google

Clues for me:


Connect nox to adb: just adb connect 127.0.0.1:62001


"OK Google"
adb shell am start -n com.google.android.googlequicksearchbox/com.google.android.apps.gsa.staticplugins.opa.OpaActivity


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

