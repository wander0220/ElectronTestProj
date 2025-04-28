const fs = require("fs");
const ini = require("ini");

// config.ini 파일 읽기
const config = ini.parse(fs.readFileSync("./config.ini", "utf-8"));

// // TCP 서버: 클라이언트 연결 및 메시지 수신/응답
// const net = require("net");

// function startTCPServer() {
//   const server = net.createServer((socket) => {
//     console.log("TCP client connected");

//     socket.on("data", (data) => {
//       console.log("TCP receive message :", data.toString());
//       // 받은 메시지에 응답 전송
//       socket.write("TCP receive message : " + data.toString());
//     });
//     socket.on("end", () => {
//       console.log("TCP client disconnected");
//     });
//   });

//   server.listen(parseInt(config.tcp.recvPort), () => {
//     // console.log(
//     //   `TCP server waiting on ${config.tcp.recvHost}:${config.tcp.recvPort}`
//     // );
//   });
// }

// // // TCP 클라이언트: 서버에 메시지 송신 및 응답 받기
// function sendTCPMessage(
//   message,
//   host = config.tcp.sendHost,
//   port = config.tcp.sendPort
// ) {
//   const client = net.createConnection({ host, port: parseInt(port) }, () => {
//     console.log("TCP client connected to server");
//     client.write(message); // message 송신
//   });

//   client.on("end", () => {
//     console.log("TCP client disconnected");
//   });
// }

// UDP 통신 모듈
const dgram = require("dgram");

// UDP 서버: 메시지 수신 및 응답 전송
function startUDPServer() {
  const udpServer = dgram.createSocket("udp4");

  // UDP 서버 이벤트 핸들러 error
  udpServer.on("error", (err) => {
    console.log(`UDP server error :\n${err.stack}`);
    udpServer.close();
  });

  // UDP 서버 이벤트 핸들러 message 수신
  udpServer.on("message", (msg, rinfo) => {
    console.log(
      `UDP receive from( ${rinfo.address}:${rinfo.port} ) msg : ${msg}`
    );

    let data;
    try {
      data = JSON.parse(msg);
      // console.log(data);
    } catch (e) {
      console.error("Invalid UDP JSON message:", msg);
      return;
    }

    // 메시지가 좌표 정보를 포함하면 renderer로 전송
    // const newFeature = {
    //   type: "Feature",
    //   geometry: {
    //     type: "Point",
    //     coordinates: [data.lng, data.lat],
    //   },
    //   properties: {
    //     strSymbolCode: data.strSymbolCode,
    //   },
    // };
    if (data.properties && global.mainWindow) {
      global.mainWindow.webContents.send("udp-message", data);
      sendUDPMessage(msg);
    }
  });

  // UDP 서버 바인딩
  if (config.udp.recvHost == "239.0.0.1") {
    // 멀티캐스트 주소인 경우
    udpServer.bind(parseInt(config.udp.recvPort), "0.0.0.0");
    udpServer.addMembership(config.udp.recvHost);
  } else {
    // 유니캐스트 주소인 경우
    udpServer.bind(parseInt(config.udp.recvPort), config.udp.recvHost);
  }
}

// UDP 클라이언트: 메시지 송신 및 응답 수신
function sendUDPMessage(
  message,
  host = config.udp.sendHost,
  port = config.udp.sendPort
) {
  console.log(`UDP send message to ${host}:${port} : ${message}`);

  // UDP 클라이언트 생성
  const udpClient = dgram.createSocket("udp4");
  udpClient.send(Buffer.from(message), parseInt(port), host, (err) => {
    if (err) {
      console.error("UDP send message error :", err);
    } else {
      console.log("UDP send message complete");
    }
  });
}

function initCommunication() {
  // 서버 시작
  // startTCPServer();
  startUDPServer();
}

module.exports = {
  initCommunication,
  // sendTCPMessage,
  sendUDPMessage,
};
