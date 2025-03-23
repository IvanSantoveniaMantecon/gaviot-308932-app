'use strict';
//Crea un objeto Client mediante el paquete instalado.
const Client = require('azure-iothub').Client;
/*El objeto Client admite los protocolos: Amqp, Http, Mqtt, MqttWs, AmqpWs
Crea un objeto Protocol mediante un paquete de transporte instalado.*/
const Message = require('azure-iot-common').Message;
//const Protocol = require('azure-iot-device-mqtt').Amqp
const Mqtt = require('azure-iot-device-mqtt').Mqtt;
// Reemplaza con la cadena de conexión de tu IoT Hub
const connectionString = "HostName=MIW-WEB-IOT-HUB.azure-devices.net;SharedAccessKeyName=service;SharedAccessKey=U7aVIG+iEJH5IN1B2XEJ5F81aRTBHgpWJAIoTLUimKM="
// Crear el cliente de servicio pasadole el la cadena de conexión y el protocolo
const serviceClient = Client.fromConnectionString(connectionString);
// Nombre del dispositivo al que enviarás el mensaje
const targetDevice = "IoT-device-1";
console.log("target device");
async function sendCloudToDeviceMessage() {
try {
await serviceClient.open();
console.log("Conectado a Azure IoT Hub");

/*
El objeto message incluye el mensaje asincrónico de la nube al
dispositivo. La funcionalidad del mensaje funciona de la misma manera a
través de AMQP, MQTT y HTTP.
El objeto message admite varias propiedades, incluidas estas. Consulte
las propiedades message para obtener una lista completa.
ack: comentarios de entrega. Se describe en la sección siguiente.
properties: mapa que contiene claves de cadena y valores para almacenar
propiedades de mensaje personalizadas.
messageId: se usa para poner en correlación la comunicación
bidireccional.
*/
const message = new Message(JSON.stringify({comando: "encender_luz",
    value:"1"}));
    console.log("Enviando mensaje a " + targetDevice + ": " +
    message.getData());
    /*
    Use la función send para enviar un mensaje asincrónico de la nube al
    dispositivo a la aplicación de dispositivo mediante IoT Hub. send admite
    estos parámetros:
    - deviceID: la identidad del dispositivo de destino.
    - message: cuerpo del mensaje que se enviará al dispositivo.
    - done: función opcional a la que se llamará cuando se complete la
    operación. Se llama a done con dos argumentos:
    objeto error (puede ser null).
    Objeto de respuesta específico del transporte (útil para el
    registro o la depuración).
    */
    await serviceClient.send(targetDevice, message);
    console.log("Mensaje enviado correctamente");
    } catch (err) {
    console.error("Error al enviar el mensaje:", err.message);
    } finally {
    await serviceClient.close();
    }
    }
    // Ejecutar el envío del mensaje
    setInterval(function(){
    console.log("ejecutado código");
    sendCloudToDeviceMessage();
    }, 1000);