// --- 設定値 ---
const serviceUuid = "4FAF0001-A428-4034-B095-81E5B9420000";
const targetUuid  = "BEB5483E-36E1-4688-B7F5-EA07361B26A8";

let myBLE;
let myCharacteristic; // データの読み取り場所を保存しておく変数

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
  updateDebug("Connected! Searching target...");

  // ターゲットのUUIDを探す
  let found = false;
  for (let i = 0; i < characteristics.length; i++) {
    if (characteristics[i].uuid.toLowerCase() == targetUuid.toLowerCase()) {
      myCharacteristic = characteristics[i]; // 場所を保存
      found = true;
      break;
    }
  }

  if (found) {
    updateDebug("Target Found!<br>Starting Read Loop...");
    
    // 【ここが変更点】
    // 通知(Notify)を待つのではなく、0.5秒ごとに自分から読みに行く(Read)
    setInterval(readDataLoop, 500); 
    
  } else {
    updateDebug("Error: UUID not found!");
  }
}

// 定期的に実行される読み取り関数
function readDataLoop() {
  if (myBLE.isConnected() && myCharacteristic) {
    // データ形式を 'string' 指定して読み取る
    myBLE.read(myCharacteristic, 'string', handleData);
  }
}

function handleData(error, data) {
  // エラー処理（読み取り失敗時）
  if (error) {
    // エラーが出ても気にせず次のループを待つ
    return;
  }
  
  // データが空っぽでなければ処理する
  if (data) {
    let values = String(data).split(',');
    
    if (values.length >= 2) {
      let voltage = values[0];
      let current = values[1];

      // A-Frameの表示更新
      let voltEl = document.querySelector('#voltText');
      if (voltEl) voltEl.setAttribute('value', voltage + " V");
      
      let currEl = document.querySelector('#currText');
      if (currEl) currEl.setAttribute('value', current + " A");

      // 左上のデバッグ表示更新
      updateDebug("RX: " + data);
    }
  }
}

function updateDebug(msg) {
  let el = document.querySelector('#debugConsole');
  if (el) {
    // RX（受信データ）の場合はシンプルに表示
    if (msg.startsWith("RX")) {
      el.innerHTML = "Status: Reading...<br>" + msg;
    } else {
      el.innerHTML = msg;
    }
  }
}
