Set WshShell = CreateObject("WScript.Shell")

projectDir = "D:\ZCMC_SYSTEMS\AttendanceQR"
logFile = projectDir & "\storage\logs\attendance_auto_create.log"

' WindowStyle = 0 (Hidden / Silent), WaitOnReturn = True
command = "cmd.exe /c ""cd /d " & projectDir & " && php artisan attendance:create-flag >> """ & logFile & """ 2>&1"""

WshShell.Run command, 0, True
