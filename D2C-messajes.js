'use strict';
const iothub = require('azure-iothub');
const deviceId = "my-device-2"
const connecctionString = "HostName=MIW-WEB-IOT-HUB.azure-devices.net;SharedAccessKeyName=iothubowner;SharedAccessKey=jXQmSXAhX41ZeAh5fVLBBQMS3jP+nebYAAIoTOn2Jjg="
const registry = iothub.Registry.fromConnectionString(connecctionString);
const device = new iothub.Device(null);
device.deviceId = deviceId;

registry.create(device, (err, _deviceInfo) => {
    if(err){
        console.log(`Error al registrar el dispositivo: ${err.toString()}`)
    }
});