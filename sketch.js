// --- 設定値 ---
const serviceUuid = "4FAF0001-A428-4034-B095-81E5B9420000";
// 探すターゲットのUUID（大文字小文字はプログラム内で自動調整します）
const targetUuid  = "BEB5483E-36E1-4688-B7F5-EA07361B26A8";

let myBLE;

function setup() {
  noCanvas();
  myBLE = new p5ble();

  const connectBtn = select("#connectBtn");
  if (connectBtn) {
    connectBtn.mousePressed(connectToBle);
  }
}

function connectToBle() {
  myBLE.connect(serviceUuid, gotCharacteristics);
  updateDebug("Status: Connecting...");
}

function gotCharacteristics(error, characteristics) {
  if (error) {
    console.error('BLE Error:', error);
    updateDebug("Error: " + error);
    return;
  }
  
  select("#connectBtn").hide();
  
  // 【診断ポイント】見つかったキャラクタリスティックを全部画面に出す
  let debugMsg = "Connected!<br>Found " + characteristics.length + " items:<br>";
  
  let targetFound = false;

  for (let i = 0; i < characteristics.length; i++) {
    let foundUuid = characteristics[i].uuid;
    // 画面にUUIDを表示（最初の8文字だけ表示してスペース節約）
    debugMsg += "[" + i + "] " + foundUuid.substring(0, 8) + "...<br>";

    // UUIDの一致確認（大文字小文字を無視して比較）
    if (foundUuid.toLowerCase() == targetUuid.toLowerCase()) {
      targetFound = true;
      debugMsg += "-> MATCHED! Subscribing...<br>";
      
      // 通知をオンにする
      myBLE.startNotifications(characteristics[i], handleData);
    }
  }

  if (!targetFound) {
    debugMsg += "-> TARGET NOT FOUND!<br>Check UUID in Arduino.";
  }

  // 診断結果を画面に反映
  updateDebug(debugMsg);
}

function handleData(data) {
  // データが来たらここが動く
  let values = String(data).split(',');
  if (values.length >= 2) {
    let voltage = values[0];
    let current = values[1];

    let voltEl = document.querySelector('#voltText');
    if (voltEl) voltEl.setAttribute('value', voltage + " V");
    
    let currEl = document.querySelector('#currText');
    if (currEl) currEl.setAttribute('value', current + " A");

    // データ受信成功！
    updateDebug("RX: " + data);
  }
}

function updateDebug(msg) {
  let el = document.querySelector('#debugConsole');
  if (el) el.innerHTML = msg;
}
