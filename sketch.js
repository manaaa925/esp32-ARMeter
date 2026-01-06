// ESP32のUUID設定
const serviceUuid = "4FAF0001-A428-4034-B095-81E5B9420000";
const voltageUuid = "BEB5483E-36E1-4688-B7F5-EA07361B26A8";
const currentUuid = "BEB5483E-36E1-4688-B7F5-EA07361B26A9";

let myBLE;

function setup() {
  // A-Frame側で描画するため、p5のキャンバスは作成しない
  noCanvas();

  myBLE = new p5ble();

  // HTMLのボタンに接続関数を割り当て
  const connectBtn = select("#connectBtn");
  connectBtn.mousePressed(connectToBle);
}

function connectToBle() {
  myBLE.connect(serviceUuid, gotCharacteristics);
}

function gotCharacteristics(error, characteristics) {
  if (error) {
    console.error('BLE Error:', error);
    return;
  }
  console.log('Connected to ESP32!');
  select("#connectBtn").hide(); // 接続成功後にボタンを隠す

  // 各UUIDに対応するデータ通知を開始
  for (let i = 0; i < characteristics.length; i++) {
    if (characteristics[i].uuid == voltageUuid.toLowerCase()) {
      myBLE.startNotifications(characteristics[i], handleVoltage);
    }
    if (characteristics[i].uuid == currentUuid.toLowerCase()) {
      myBLE.startNotifications(characteristics[i], handleCurrent);
    }
  }
}

// 受信した電圧値をARテキストに反映
function handleVoltage(data) {
  let val = Number(data).toFixed(3);
  let el = document.querySelector('#voltText'); // A-Frame要素を直接指定
  if (el) el.setAttribute('value', val + " V");
}

// 受信した電流値をARテキストに反映
function handleCurrent(data) {
  let val = Number(data).toFixed(3);
  let el = document.querySelector('#currText');
  if (el) el.setAttribute('value', val + " A");
}
