'use strict';
const iothub = require('azure-iothub');

const connectionString = "HostName=MIW-WEB-IOT-HUB.azure-devices.net;SharedAccessKeyName=iothubowner;SharedAccessKey=d+0UHRK7a8RYP68xuRjYXW15BLFrMljItAIoTLQYFoI=";
const registry = iothub.Registry.fromConnectionString(connectionString);

// Recibe argumentos desde `server.js`
const [deviceId, name, ipAddress, latitude, longitude] = process.argv.slice(2);

if (!deviceId || !name || !ipAddress || !latitude || !longitude) {
    console.error("Faltan parámetros. Uso: node D2C-messages.js <deviceId> <name> <ipAddress> <latitude> <longitude>");
    process.exit(1);
}

const device = new iothub.Device(null);
device.deviceId = deviceId;

// Registro del dispositivo
registry.create(device, (err, deviceInfo) => {
    if (err) {
        console.log(`Error al registrar el dispositivo: ${err.toString()}`);
    } else {
        console.log(`Dispositivo registrado con éxito:`);
        console.log(JSON.stringify({ deviceId, name, ipAddress, latitude, longitude }, null, 2));
    }
});
