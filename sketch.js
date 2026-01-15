/* * [BLE通信制御スクリプト]
 * 概要: p5.ble.jsライブラリを用いてESP32とのBLE接続を確立し，
 * 定期的にセンサーデータ（電圧・電流）を取得してAR表示へ反映させる．
 */

// ============================================================
// 定数定義: BLE UUID設定
// ※ESP32側のファームウェアで定義されたUUIDと完全に一致させる必要がある
// ============================================================
const serviceUuid = "4FAF0001-A428-4034-B095-81E5B9420000"; // サービスUUID
const targetUuid  = "BEB5483E-36E1-4688-B7F5-EA07361B26A8"; // キャラクタリスティックUUID

// ============================================================
// グローバル変数定義
// ============================================================
let myBLE;            // p5.bleインスタンス格納用
let myCharacteristic; // 読み書き対象のキャラクタリスティック（データの通り道）

/**
 * [初期化関数: setup]
 * ページ読み込み時にp5.jsによって自動的に呼び出される．
 * BLEハンドラの初期化およびUIイベントの登録を行う．
 */
function setup() {
  // p5.jsのデフォルトキャンバス生成を無効化
  // (A-FrameによるAR描画領域との重複・干渉を防ぐため)
  noCanvas();

  // BLEハンドラの生成
  myBLE = new p5ble();

  // HTML上の接続ボタン要素を取得し、クリックイベントを登録
  const connectBtn = select("#connectBtn");
  if (connectBtn) {
    connectBtn.mousePressed(connectToBle);
  }
}

/**
 * [接続開始関数: connectToBle]
 * ユーザ操作をトリガーとして，Web Bluetooth APIによるデバイススキャンを開始する．
 */
function connectToBle() {
  // 指定したサービスUUIDを持つデバイスへの接続を試行
  // 接続完了後，コールバック関数 gotCharacteristics を実行する
  myBLE.connect(serviceUuid, gotCharacteristics);
}

/**
 * [接続完了コールバック関数: gotCharacteristics]
 * BLE接続が確立し，サービスの探索が完了した時点で呼び出される．
 * * @param {Object} error - エラーオブジェクト（正常時はnull）
 * @param {Array} characteristics - 検出されたキャラクタリスティックの配列
 */
function gotCharacteristics(error, characteristics) {
  // エラーハンドリング
  if (error) {
    console.error('BLE Connection Error:', error);
    return;
  }
  
  // 接続確立に伴い，接続ボタンを非表示にする（UI更新）
  select("#connectBtn").hide();

  // 取得したキャラクタリスティック一覧から，通信対象のUUIDを持つものを探索
  for (let i = 0; i < characteristics.length; i++) {
    if (characteristics[i].uuid.toLowerCase() == targetUuid.toLowerCase()) {
      // 対象のキャラクタリスティックをグローバル変数に保持
      myCharacteristic = characteristics[i];
      
      // データ取得ループの開始
      // Readモードを採用し，500ms周期でセンサー値をポーリングする
      setInterval(readDataLoop, 500); 
      break;
    }
  }
}

/**
 * [データ取得ループ関数: readDataLoop]
 * setIntervalにより定期的（500ms毎）に実行される．
 * ESP32に対してデータの読み取り要求を発行する．
 */
function readDataLoop() {
  // BLE接続が維持されており，かつキャラクタリスティックが特定できている場合のみ実行
  if (myBLE.isConnected() && myCharacteristic) {
    // データを文字列(string)形式で読み取り，完了後に handleData を呼び出す
    myBLE.read(myCharacteristic, 'string', handleData);
  }
}

/**
 * [データ受信ハンドラ: handleData]
 * ESP32から受信したデータを解析し，AR空間上のテキスト要素へ反映させる．
 * * @param {Object} error - 読み取りエラー（正常時はnull）
 * @param {String} data - 受信データ文字列（形式: "電圧値,電流値"）
 */
function handleData(error, data) {
  // エラー発生時またはデータ空の場合は処理を中断
  if (error || !data) return;

  // CSV形式の文字列データ "Voltage,Current" をカンマで分割して配列化
  let values = String(data).split(',');
    
  // データ形式の整合性チェック（要素数が2以上あるか）
  if (values.length >= 2) {
    let voltage = values[0]; // 配列の0番目：電圧値
    let current = values[1]; // 配列の1番目：電流値

    // DOM操作によりAR空間内の電圧表示要素(#voltText)を更新
    let voltEl = document.querySelector('#voltText');
    if (voltEl) voltEl.setAttribute('value', voltage + " V");
    
    // DOM操作によりAR空間内の電流表示要素(#currText)を更新
    let currEl = document.querySelector('#currText');
    if (currEl) currEl.setAttribute('value', current + " A");
  }
}
