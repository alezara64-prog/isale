$sourceCode = @"
using System;
using System.Diagnostics;
using System.IO;
using System.Reflection;

class KaraokeManagerLauncher {
    static void Main() {
        string exePath = Assembly.GetExecutingAssembly().Location;
        string exeDir = Path.GetDirectoryName(exePath);
        string batPath = Path.Combine(exeDir, "start-karaoke-manager.bat");

        if (File.Exists(batPath)) {
            ProcessStartInfo psi = new ProcessStartInfo();
            psi.FileName = batPath;
            psi.WorkingDirectory = exeDir;
            psi.UseShellExecute = true;
            Process.Start(psi);
        } else {
            Console.WriteLine("Errore: start-karaoke-manager.bat non trovato in " + exeDir);
            Console.WriteLine("Premi un tasto per uscire...");
            Console.ReadKey();
        }
    }
}
"@

# Rimuovi il vecchio exe se esiste
$exePath = "D:\Karaoke Manager\KaraokeManager.exe"
if (Test-Path $exePath) {
    Remove-Item $exePath -Force
}

Add-Type -TypeDefinition $sourceCode -OutputAssembly $exePath -OutputType ConsoleApplication
Write-Host "KaraokeManager.exe creato con successo in: $exePath"
