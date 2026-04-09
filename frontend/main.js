const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let pyProc = null;

function launchBackend() {
  // Chemin vers ton exécutable IA compilé
  // Electron le trouvera dans backend/dist/rag_api/ une fois installé
  const pyPath = path.join(__dirname, 'backend/dist/rag_api/rag_api.exe');
  
  // On lance le processus de manière INVISIBLE (windowsHide: true)
  pyProc = spawn(pyPath, [], {
    windowsHide: false // Cache la fenêtre noire du terminal
  });

  pyProc.on('error', (err) => {
    console.error('Échec du démarrage du backend IA:', err);
  });
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    title: "KORAI - Assistant ORL",
    icon: path.join(__dirname, 'assets/icon.png'), // Ajoute une icône si tu en as une
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false, // INDISPENSABLE pour les photos de l'otoscope
      spellcheck: false
    },
  });

  Menu.setApplicationMenu(null);

  // Charge le fichier index.html généré par Expo
  const indexPath = path.join(__dirname, 'dist/index.html');
  
  win.loadFile(indexPath).catch((err) => {
    console.error("Erreur lors du chargement de l'index.html :", err);
  });

  win.webContents.openDevTools(); // À commenter pour la version client final
}

app.whenReady().then(() => {
  launchBackend(); // Lance l'IA
  createWindow();  // Lance l'interface

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Arrête l'IA proprement quand on ferme l'application
app.on('will-quit', () => {
  if (pyProc != null) {
    pyProc.kill();
    pyProc = null;
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});