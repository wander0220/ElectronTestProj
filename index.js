const { app, BrowserWindow } = require("electron");
const { initCommunication } = require("./communication");

function createWindow() {
  const win = new BrowserWindow({
    // icon: __dirname + "/favicon.ico", // 아이콘 설정
    // width: 800, height: 600, // 창 크기 설정
    // minWidth: 800, minHeight: 600, // 최소 크기 설정
    // maxWidth: 1920, maxHeight: 1080, // 최대 크기 설정
    // x: 100, y: 100, // 창 위치 설정
    // center: true, // 창 중앙 위치 설정
    // fullscreen: true, // 풀스크린 모드, F11로 해제 가능
    // autoHideMenuBar: true, // 메뉴바 숨김
    // resizable: false, // 리사이즈 불가
    // frame: true, // 프레임 표시
    webPreferences: {
      nodeIntegration: true, // Node.js 통합
      contextIsolation: false,
    },
  });
  global.mainWindow = win;

  // win.setMenuBarVisibility(true); // 메뉴바 표시

  win.maximize(); // 최대화
  win.loadFile("index.html"); // 로컬 파일 로드

  // 통신 모듈 초기화 (TCP/UDP 송신 및 수신)
  initCommunication();
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
