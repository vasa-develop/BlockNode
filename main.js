const url = require('url');
const path = require('path');

// Modules to control application life and create native browser window
const {app, BrowserWindow, Menu} = require('electron')

const {Docker} = require('node-docker-api');
 
const docker = new Docker({ socketPath: '/var/run/docker.sock' });

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({width: 800, height: 600})

  // and load the index.html of the app.
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }));
  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  //Build menu from template
  const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);

  Menu.setApplicationMenu(mainMenu);

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
    app.quit();
  })
}

//Start Ethereum docker
function startEthereum(){
  statusWindow = new BrowserWindow(
    {width: 200, height: 200, title: 'Blockchain Status'}
    );

  // and load the index.html of the app.
  statusWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'statusWindow.html'),
    protocol: 'file:',
    slashes: true
  }));

  docker.container.create({
  Image: 'ubuntu',
  name: 'test'
})
  .then(container => container.start())
  .then(container => container.stop())
  .then(container => container.restart())
  .then(container => container.delete({ force: true }))
  .catch(error => console.log(error));


  statusWindow.on('close', function(){
    statusWindow = null;
  });
}

//Create menu template
const mainMenuTemplate = [
{
  label: 'File',
  submenu: [
    {
      label: 'Quit',
      accelerator: process.platform == 'darwin' ? 'Command+Q' : 'Ctrl+Q',
      click(){
        app.quit();
      }
    }
  ]
},
{
  label: 'Blockchain',
  submenu:[
    {
      label: 'Ethereum',
      click(){
        startEthereum();
      }
    },
    {
      label: 'Quorum'
    }, 
    {
      label: 'HyperLedger Fabric'
    }
  ]
}
];

//if MAC add empty object to menu
if(process.platform == 'darwin'){
  mainMenuTemplate.unshift({});
}

// Add developer tools option if not in production
if(process.env.NODE_ENV !== 'production'){
  mainMenuTemplate.push({
    label: 'Developer Tools',
    submenu: [
      {
        label: 'toggle dev tools',
        accelerator: process.platform == 'darwin' ? 'Command+I' : 'Ctrl+I',
        click(item, focusedWindow){
          focusedWindow.toggleDevTools();
        }
      },
      {
        role: 'reload'
      }
    ]
  })
}



// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
