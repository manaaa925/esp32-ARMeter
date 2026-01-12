// ESP32のUUID設定
const serviceUuid = "4FAF0001-A428-4034-B095-81E5B9420000";
const voltageUuid = "BEB5483E-36E1-4688-B7F5-EA07361B26A8";
const currentUuid = "BEB5483E-36E1-4688-B7F5-EA07361B26A9";

let myBLE;

function setup() {
  // 【重要】p5.jsのキャンバスを作らない設定
  // これがないと、p5.jsが白い画面を作ってARカメラを隠してしまいます
  noCanvas();

  myBLE = new p5ble();

  // HTMLのボタンに接続関数を割り当て
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
    updateDebug("Status: Connection Error!");
    return;
  }
  console.log('Connected to ESP32!');
  select("#connectBtn").hide(); // 接続成功後にボタンを隠す
  updateDebug("Status: Connected!<br>Waiting for data...");

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
  // 数値にして桁数を揃える
  let val = Number(data).toFixed(3);
  
  // A-Frameのテキストを書き換え
  // document.querySelectorを使って、A-Frameの世界にある物体を操作します
  let el = document.querySelector('#voltText'); 
  if (el) el.setAttribute('value', val + " V");

  // デバッグ表示も更新（トラブル時に役立ちます）
  updateDebug("Volt: " + val + " V");
}

// 受信した電流値をARテキストに反映
function handleCurrent(data) {
  let val = Number(data).toFixed(3);
  
  let el = document.querySelector('#currText');
  if (el) el.setAttribute('value', val + " A");
  
  updateDebug("Curr: " + val + " A");
}

// 画面左上のデバッグ表示を更新する関数
function updateDebug(msg) {
  let debugEl = document.querySelector('#debugConsole');
  if (debugEl) {
    // 電圧・電流の場合は追記、それ以外は上書きなど簡易的な処理
    if(msg.startsWith("Volt") || msg.startsWith("Curr")) {
       // 現在の内容を取得して書き換え（簡易実装）
       if(msg.startsWith("Volt")) debugEl.innerHTML = debugEl.innerHTML.replace(/Volt: .*?<br>/, msg + "<br>");
       else if(msg.startsWith("Curr")) debugEl.innerHTML = debugEl.innerHTML.replace(/Curr: .*?$/, msg);
       else debugEl.innerHTML += "<br>" + msg;
    } else {
       // ステータス更新時
       debugEl.innerHTML = "Status: " + msg + "<br>Volt: --- V<br>Curr: --- A";
    }
  }
}
