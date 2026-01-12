const serviceUuid = "4FAF0001-A428-4034-B095-81E5B9420000";
const voltageUuid = "BEB5483E-36E1-4688-B7F5-EA07361B26A8";
const currentUuid = "BEB5483E-36E1-4688-B7F5-EA07361B26A9";

let myBLE;

function setup() {
  noCanvas();
  myBLE = new p5ble();
  const connectBtn = select("#connectBtn");
  connectBtn.mousePressed(connectToBle);
}

function connectToBle() {
  myBLE.connect(serviceUuid, gotCharacteristics);
  document.querySelector('#debugConsole').innerHTML = "Status: Connecting...";
}

function gotCharacteristics(error, characteristics) {
  if (error) {
    console.error('BLE Error:', error);
    document.querySelector('#debugConsole').innerHTML = "Status: Error!";
    return;
  }
  console.log('Connected!');
  select("#connectBtn").hide();
  
  // デバッグ表示更新
  document.querySelector('#debugConsole').innerHTML = "Status: Connected!<br>Volt: ---<br>Curr: ---";

  for (let i = 0; i < characteristics.length; i++) {
    if (characteristics[i].uuid == voltageUuid.toLowerCase()) {
      myBLE.startNotifications(characteristics[i], handleVoltage);
    }
    if (characteristics[i].uuid == currentUuid.toLowerCase()) {
      myBLE.startNotifications(characteristics[i], handleCurrent);
    }
  }
}

function handleVoltage(data) {
  let val = Number(data).toFixed(3);
  
  // 1. AR空間のテキストを更新
  let arEl = document.querySelector('#arVolt');
  if (arEl) arEl.setAttribute('value', val + " V");

  // 2. 画面左上のデバッグ表示を更新
  updateDebugDisplay("Volt", val + " V");
}

function handleCurrent(data) {
  let val = Number(data).toFixed(3);
  
  // 1. AR空間のテキストを更新
  let arEl = document.querySelector('#arCurr');
  if (arEl) arEl.setAttribute('value', val + " A");

  // 2. 画面左上のデバッグ表示を更新
  updateDebugDisplay("Curr", val + " A");
}

// デバッグ表示書き換え用ヘルパー
function updateDebugDisplay(type, val) {
  let consoleDiv = document.querySelector('#debugConsole');
  let currentHTML = consoleDiv.innerHTML;
  
  // 正規表現で数値を書き換え（簡易実装）
  if(type === "Volt") {
    consoleDiv.innerHTML = currentHTML.replace(/Volt: .*?<br>/, "Volt: " + val + "<br>");
  } else if (type === "Curr") {
     consoleDiv.innerHTML = currentHTML.replace(/Curr: .*?$/, "Curr: " + val);
  }
}
