// --- 設定値 ---
const serviceUuid = "4FAF0001-A428-4034-B095-81E5B9420000";
const targetUuid  = "BEB5483E-36E1-4688-B7F5-EA07361B26A8";

let myBLE;
let myCharacteristic; // データの読み取り場所

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
  myBLE.connect(serviceUuid, gotCharacteristics);
}

function gotCharacteristics(error, characteristics) {
  if (error) {
    console.error('BLE Error:', error);
    return;
  }
  
  // 接続成功したらボタンを消す
  select("#connectBtn").hide();

  // ターゲットのUUIDを探して場所を記憶する
  for (let i = 0; i < characteristics.length; i++) {
    if (characteristics[i].uuid.toLowerCase() == targetUuid.toLowerCase()) {
      myCharacteristic = characteristics[i];
      
      // 【重要】0.5秒ごとにデータを読みに行く（READモード）
      setInterval(readDataLoop, 500); 
      break;
    }
  }
}

// 定期的に実行される読み取り関数
function readDataLoop() {
  // 接続されていて、場所が特定できていれば読み込む
  if (myBLE.isConnected() && myCharacteristic) {
    myBLE.read(myCharacteristic, 'string', handleData);
  }
}

// データを受け取ってAR表示を変える関数
function handleData(error, data) {
  if (error || !data) return; // エラーや空データなら何もしない

  // データ "3.300,0.120" をカンマで分割
  let values = String(data).split(',');
    
  if (values.length >= 2) {
    let voltage = values[0]; // 前半：電圧
    let current = values[1]; // 後半：電流

    // AR空間のテキスト(Voltage)を更新
    let voltEl = document.querySelector('#voltText');
    if (voltEl) voltEl.setAttribute('value', voltage + " V");
    
    // AR空間のテキスト(Current)を更新
    let currEl = document.querySelector('#currText');
    if (currEl) currEl.setAttribute('value', current + " A");
  }
}
