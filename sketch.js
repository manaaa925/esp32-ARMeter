// --- 設定値：Arduinoコードと完全に一致させる必要があります ---
const serviceUuid = "4FAF0001-A428-4034-B095-81E5B9420000";
// Arduinoで設定した DATA_CHAR_UUID と同じにする
const dataUuid    = "BEB5483E-36E1-4688-B7F5-EA07361B26A8";

let myBLE;

function setup() {
  // AR画面の邪魔をしないようにキャンバスは作らない
  noCanvas();

  myBLE = new p5ble();

  // HTMLのボタンに接続機能を割り当て
  const connectBtn = select("#connectBtn");
  if (connectBtn) {
    connectBtn.mousePressed(connectToBle);
  }
}

function connectToBle() {
  // BLE接続を開始
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
  // 接続できたらボタンを隠す
  select("#connectBtn").hide();
  updateDebug("Status: Connected! Waiting for data...");

  // キャラクタリスティックを探して通知(Notify)をONにする
  for (let i = 0; i < characteristics.length; i++) {
    if (characteristics[i].uuid == dataUuid.toLowerCase()) {
      // 見つけたら handleData 関数を呼び出すように設定
      myBLE.startNotifications(characteristics[i], handleData);
      break;
    }
  }
}

// データ受信時に実行される関数
function handleData(data) {
  // 送られてくるデータは "3.300,0.120" のような文字列
  // これをカンマ(,)で2つに分割する
  let values = String(data).split(',');

  // 正しく2つのデータに分かれたか確認
  if (values.length >= 2) {
    let voltage = values[0]; // 前半が電圧
    let current = values[1]; // 後半が電流

    // 1. AR空間のテキスト(A-Frame)を書き換え
    let voltEl = document.querySelector('#voltText');
    if (voltEl) voltEl.setAttribute('value', voltage + " V");

    let currEl = document.querySelector('#currText');
    if (currEl) currEl.setAttribute('value', current + " A");

    // 2. 左上のデバッグ表示も更新
    updateDebug("Volt: " + voltage + " V<br>Curr: " + current + " A");
  }
}

// 画面左上のデバッグ表示を更新する便利関数
function updateDebug(msg) {
  let el = document.querySelector('#debugConsole');
  if (el) {
    // 電圧電流のデータなら書き換え、それ以外（ステータス）ならそのまま表示
    if (msg.startsWith("Volt")) {
       el.innerHTML = "Status: Receiving<br>" + msg;
    } else {
       el.innerHTML = msg;
    }
  }
}
