cd .
@echo off
echo  ^     ____.-------------.____ 
echo  ^ .--'      +---------+      '--._
echo  ^(          ^| MongoDB ^|           )
echo  ^|`--.____  +---------+   ____.--'^|
echo  ^|        `-.          .-'        ^|
echo  ^|           ����������           ^|
echo    `--.____                ____.--'  
echo  ^|`--.____`-.          .-'____.--'^|
echo  ^|        `-.����������.-'        ^|
echo  ^|           ����������           ^|
echo    `--.____                ____.--'  
echo  ^|`--.____`-.          .-'____.--'^|
echo  ^|        `-.����������.-'        ^|
echo  ^|           ����������           ^|
echo  ^(                                )
echo  ^ `--.____                ____.--'
echo  ^         `-.          .-'        
echo  ^            ����������
echo on  
@echo off
cd C:\
@echo on
C:\mongodb2.4.10\bin\mongod.exe -f C:\mongodb\mongo.conf
::PAUSE

