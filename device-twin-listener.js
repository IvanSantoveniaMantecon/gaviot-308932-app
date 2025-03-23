'use strict';
//Crea un objeto Device Client mediante el paquete instalado.
const Client = require('azure-iot-device').Client;;
/*El objeto Client admite los protocolos: Amqp, Http, Mqtt, MqttWs,
AmqpWs
Crea un objeto Protocol mediante un paquete de transporte instalado.*/
const Mqtt = require('azure-iot-device-mqtt').Mqtt
// Reemplaza con la cadena de conexión de tu dispositivo
const connectionString = "HostName=MIW-WEB-IOT-HUB.azure-devices.net;DeviceId=IoT-device-1;SharedAccessKey=TzGiNBj15U/AbgiLBdeXyC8VPb7ZZT/aCI/lcof3WD4=";
// Crear el cliente de servicio pasadole el la cadena de conexión y el protocolo
const serviceClient = Client.fromConnectionString(connectionString, Mqtt)
console.log("Conectando al IoT Hub...");
// Nombre del dispositivo al que enviarás el mensaje
//const targetDevice = "iot-device-1";
async function listenForPropertyChanges() {
try {
    await serviceClient.open();
console.log("Servicio abierto...");
var twinDevice = await serviceClient.getTwin();
console.log("Dispositivo obtenido...");
// Establecer un agente de escucha para detectar cambios en las propiedades
twinDevice.on('properties.desired', (patch) => {
console.log("Cambio en las propiedades deseadas:", patch);
// Aquí puedes agregar lógica adicional para manejar los cambios
});
console.log("Escuchando cambios en el dispositivo gemelo...");
} catch (err) {
console.error("Error al conectar con el dispositivo gemelo:",
err.message)
} finally {
await serviceClient.close();
}
}
listenForPropertyChanges();