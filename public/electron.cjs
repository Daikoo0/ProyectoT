const { app, BrowserWindow } = require('electron')

function createWindow () {
    const win = new BrowserWindow({
      width: 800,
      height: 600,
    })
  
    win.loadURL('http://localhost:4173')
  }

  app.whenReady().then(() => {
    createWindow()
  })

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit()
    }
  })


  const { spawn } = require('child_process');

let goApp = spawn('./main.go');

goApp.stdout.on('data', (data) => {
  console.log(`stdout: ${data}`);
});

goApp.stderr.on('data', (data) => {
  console.error(`stderr: ${data}`);
});

goApp.on('close', (code) => {
  console.log(`child process exited with code ${code}`);
});
  