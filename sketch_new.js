// --- sketch_new.js ---
const serviceUuid = "4FAF0001-A428-4034-B095-81E5B9420000";
const targetUuid  = "BEB5483E-36E1-4688-B7F5-EA07361B26A8";

let myBLE, myCharacteristic;

function setup() {
  noCanvas();
  myBLE = new p5ble();
  const connectBtn = select("#connectBtn");
  if (connectBtn) connectBtn.mousePressed(connectToBle);
}

function connectToBle() {
  myBLE.connect(serviceUuid, gotCharacteristics);
}

function gotCharacteristics(error, characteristics) {
  if (error) return;
  select("#connectBtn").hide();
  for (let i = 0; i < characteristics.length; i++) {
    if (characteristics[i].uuid.toLowerCase() == targetUuid.toLowerCase()) {
      myCharacteristic = characteristics[i];
      setInterval(readDataLoop, 500); 
      break;
    }
  }
}

function readDataLoop() {
  if (myBLE.isConnected() && myCharacteristic) {
    myBLE.read(myCharacteristic, 'string', handleData);
  }
}

function handleData(error, data) {
  if (error || !data) return;
  let values = String(data).split(',');
  if (values.length >= 2) {
    let voltage = values[0];
    let current = values[1];

    // 電圧（赤・左側）
    let voltEl = document.querySelector('#voltText');
    if (voltEl) voltEl.setAttribute('value', voltage + " V");
    
    // 電流（オレンジ・右側）
    let currEl = document.querySelector('#currText');
    if (currEl) currEl.setAttribute('value', current + " A");
  }
}
