cd .
@echo off
echo  ^     ____.-------------.____ 
echo  ^ .--'      +---------+      '--._
echo  ^(          ^| MongoDB ^|           )
echo  ^|`--.____  +---------+   ____.--'^|
echo  ^|        `-.          .-'        ^|
echo  ^|           £þ£þ£þ£þ£þ           ^|
echo    `--.____                ____.--'  
echo  ^|`--.____`-.          .-'____.--'^|
echo  ^|        `-.£þ£þ£þ£þ£þ.-'        ^|
echo  ^|           £þ£þ£þ£þ£þ           ^|
echo    `--.____                ____.--'  
echo  ^|`--.____`-.          .-'____.--'^|
echo  ^|        `-.£þ£þ£þ£þ£þ.-'        ^|
echo  ^|           £þ£þ£þ£þ£þ           ^|
echo  ^(                                )
echo  ^ `--.____                ____.--'
echo  ^         `-.          .-'        
echo  ^            £þ£þ£þ£þ£þ
echo on  
@echo off
cd C:\
@echo on
C:\mongodb2.4.10\bin\mongod.exe -f C:\mongodb\mongo.conf
::PAUSE

