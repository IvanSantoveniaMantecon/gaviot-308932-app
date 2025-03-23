'use strict';
//Crea un objeto Device Client mediante el paquete instalado.
const Client = require('azure-iot-device').Client;;
/*El objeto Client admite los protocolos: Amqp, Http, Mqtt, MqttWs,
AmqpWs
Crea un objeto Protocol mediante un paquete de transporte instalado.*/
const Mqtt = require('azure-iot-device-mqtt').Mqtt
// Reemplaza con la cadena de conexión de tu dispositivo
const connectionString = "HostName=MIW-WEB-IOT-HUB.azure-devices.net;DeviceId=IoT-device-1;SharedAccessKey=TzGiNBj15U/AbgiLBdeXyC8VPb7ZZT/aCI/lcof3WD4="
// Crear el cliente de servicio pasadole el la cadena de conexión y el protocolo
const serviceClient = Client.fromConnectionString(connectionString, Mqtt)
console.log("Conectando al IoT Hub...");
// Nombre del dispositivo al que enviarás el mensaje
//const targetDevice = "iot-device-1";
async function setDevicePropertiesAndTags() {
try {
await serviceClient.open();
console.log("Servicio abierto...");
//serviceClient.twinDevice = targetDevice;
var twinDevice = await serviceClient.getTwin();
//const twin = await serviceClient.getTwin(targetDevice);
console.log("Dispositivo obtenido...");
var patch = {
NetworkSettings: {
ipAddress: "192.168.1.10",
connectionType: "WiFi",
signalStrength: 100
}
}
twinDevice.properties.reported.update(patch, function (err) {
if (err) throw err;
console.log('twin state reported');
});
console.log("Propiedades actualizadas correctamente.");
} catch (err) {
    console.error("Error al actualizar las propiedades del dispositivo:",
    err.message);
    } finally {
    await serviceClient.close();
    }
    }
    setDevicePropertiesAndTags()