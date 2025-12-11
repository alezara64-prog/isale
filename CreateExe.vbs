' Script VBS per creare un collegamento eseguibile
Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

' Percorso del batch
strBatchPath = "D:\Karaoke Manager\start-karaoke-manager.bat"

' Crea collegamento sul desktop
strDesktop = WshShell.SpecialFolders("Desktop")
Set oShellLink = WshShell.CreateShortcut(strDesktop & "\Karaoke Manager.lnk")
oShellLink.TargetPath = strBatchPath
oShellLink.WorkingDirectory = "D:\Karaoke Manager"
oShellLink.WindowStyle = 1
oShellLink.IconLocation = "shell32.dll,176"
oShellLink.Description = "Avvia Karaoke Manager"
oShellLink.Save

' Crea collegamento nella cartella del progetto
Set oShellLink2 = WshShell.CreateShortcut("D:\Karaoke Manager\Karaoke Manager.lnk")
oShellLink2.TargetPath = strBatchPath
oShellLink2.WorkingDirectory = "D:\Karaoke Manager"
oShellLink2.WindowStyle = 1
oShellLink2.IconLocation = "shell32.dll,176"
oShellLink2.Description = "Avvia Karaoke Manager"
oShellLink2.Save

WScript.Echo "Collegamenti creati con successo!"
