'use strict';
const express = require('express');
const bodyParser = require('body-parser');
const iothub = require('azure-iothub');
const { Client, Message } = require('azure-iot-device');
const { Mqtt } = require('azure-iot-device-mqtt');

const app = express();
const PORT = 8080;

app.use(bodyParser.json());
app.use(express.static(__dirname)); // Servir archivos estáticos

// 🔗 Conexión con Azure IoT Hub
const connectionString = "HostName=MIW-WEB-IOT-HUB.azure-devices.net;SharedAccessKeyName=iothubowner;SharedAccessKey=d+0UHRK7a8RYP68xuRjYXW15BLFrMljItAIoTLQYFoI=";
const registry = iothub.Registry.fromConnectionString(connectionString);

// 📌 Registrar un nuevo dispositivo en Azure IoT Hub
app.post('/register-device', (req, res) => {
    const { deviceId, name, ipAddress, latitude, longitude } = req.body;

    if (!deviceId || !name || !ipAddress || !latitude || !longitude) {
        return res.status(400).send("Faltan datos del dispositivo.");
    }

    const device = { deviceId };

    registry.create(device, (err, deviceInfo) => {
        if (err) {
            console.error(`Error registrando en Azure IoT Hub: ${err.message}`);
            return res.status(500).send("Error al registrar el dispositivo en Azure.");
        }

        res.status(201).json({
            deviceId,
            name,
            ipAddress,
            latitude,
            longitude,
            status: "Activo",
            tags: ""
        });
    });
});

// 📌 Obtener todos los dispositivos de Azure IoT Hub
app.get('/devices', (req, res) => {
    registry.list((err, deviceList) => {
        if (err) {
            console.error(`Error obteniendo dispositivos: ${err.message}`);
            return res.status(500).send("Error al obtener los dispositivos.");
        }

        const devices = deviceList.map(device => ({
            deviceId: device.deviceId,
            name: device.deviceId, // No hay campo "name" en Azure, usamos el ID por defecto
            status: device.connectionState || "Desconocido",
            tags: device.tags || ""
        }));

        res.json(devices);
    });
});

// 📌 Obtener un solo dispositivo
app.get("/device/:deviceId", (req, res) => {
    const { deviceId } = req.params;

    registry.getTwin(deviceId, (err, twin) => {
        if (err) {
            console.error("Error consultando el dispositivo:", err.message);
            return res.status(500).json({ error: "No se pudo obtener la información del dispositivo o gemelo digital." });
        }

        // Revisamos si las propiedades deseadas o reportadas existen
        const desiredProperties = twin.properties.desired || {};
        const reportedProperties = twin.properties.reported || {};

        // Devolvemos la información del gemelo digital
        res.json({
            deviceId: twin.deviceId,
            status: twin.connectionState || "Desconocido",
            desiredProperties: desiredProperties,
            reportedProperties: reportedProperties,
            capabilities: twin.capabilities || {},
            modelId: twin.modelId || "N/A",
            tags: twin.tags || {},
            version: twin.version,
            lastActivityTime: twin.lastActivityTime,
        });
    });
});

// 📌 Modificar las propiedades deseadas del gemelo digital
app.put('/device/:deviceId/properties', (req, res) => {
    const { deviceId } = req.params;
    const { frequency } = req.body;  // Recibimos la nueva frecuencia

    if (!frequency || isNaN(frequency) || frequency <= 0) {
        return res.status(400).json({ error: 'Se debe proporcionar una frecuencia válida en milisegundos.' });
    }

    registry.getTwin(deviceId, (err, twin) => {
        if (err) {
            console.error("Error obteniendo el gemelo digital:", err.message);
            return res.status(500).json({ error: "No se pudo obtener la información del gemelo digital." });
        }

        const twinPatch = {
            properties: {
                desired: {
                    frequency: frequency // Establecemos la nueva frecuencia
                }
            }
        };

        // Actualizamos el gemelo digital con la nueva propiedad deseada
        twin.update(twinPatch, (err) => {
            if (err) {
                console.error("Error actualizando el gemelo digital:", err.message);
                return res.status(500).json({ error: "No se pudo actualizar la propiedad deseada." });
            }

            res.json({
                message: `Frecuencia actualizada a ${frequency}ms para el dispositivo ${deviceId}.`
            });
        });
    });
});

// 📌 Editar un dispositivo en Azure IoT Hub
app.put('/devices/:id', (req, res) => {
    const deviceId = req.params.id;
    const { name, status, tags } = req.body;

    registry.getTwin(deviceId, (err, twin) => {
        if (err) {
            console.error(`Error obteniendo twin: ${err.message}`);
            return res.status(404).send("Dispositivo no encontrado.");
        }

        // 💡 Aseguramos que los datos no sean null/undefined
        const twinPatch = {
            tags: tags ? tags : twin.tags, // Actualizar etiquetas en el IoT Hub
            properties: {
                desired: {
                    name: name || twin.properties.desired.name,
                    status: status || twin.properties.desired.status
                }
            }
        };

        twin.update(twinPatch, (err) => {
            if (err) {
                console.error(`Error actualizando dispositivo: ${err.message}`);
                return res.status(500).send("Error al actualizar el dispositivo.");
            }

            res.json({ message: "Dispositivo actualizado correctamente.", updatedData: twinPatch });
        });
    });
});

// 📌 Eliminar un dispositivo de Azure IoT Hub
app.delete('/devices/:id', (req, res) => {
    const deviceId = req.params.id;

    registry.delete(deviceId, (err) => {
        if (err) {
            console.error(`Error eliminando dispositivo: ${err.message}`);
            return res.status(500).send("Error al eliminar el dispositivo.");
        }

        res.json({ message: "Dispositivo eliminado correctamente." });
    });
});

// 🔹 Simulación de telemetría (D2C)
const deviceConnections = {
    device1: "HostName=MIW-WEB-IOT-HUB.azure-devices.net;DeviceId=1;SharedAccessKey=IisZ1xUj6Ohen1fpDKf6WhiiLVFNF8nPaOkn6WJJfgs=",
    device2: "HostName=MIW-WEB-IOT-HUB.azure-devices.net;DeviceId=2;SharedAccessKey=9ekMcs9wLIwK+y5eS7LJtf9Fp0xm9Jqxnn2vHaKj0yQ=",
    device3: "HostName=MIW-WEB-IOT-HUB.azure-devices.net;DeviceId=IoT-device-1;SharedAccessKey=TzGiNBj15U/AbgiLBdeXyC8VPb7ZZT/aCI/lcof3WD4="
};

const deviceFrequencies = {
    device1: 5000, // Frecuencia inicial (en milisegundos)
    device2: 5000,
    device3: 5000
};

const simulateTelemetry = (deviceId, connectionString) => {
    const client = Client.fromConnectionString(connectionString, Mqtt);
    let intervalId;

    const sendTelemetry = () => {
        const data = {
            temperature: (20 + Math.random() * 10).toFixed(2),
            humidity: (40 + Math.random() * 20).toFixed(2),
            precipitation: (Math.random() * 5).toFixed(2),
            windSpeed: (5 + Math.random() * 10).toFixed(2)
        };
        const message = new Message(JSON.stringify(data));

        client.sendEvent(message, (err) => {
            if (err) {
                console.error(`Error enviando telemetría desde ${deviceId}:`, err.message);
            } else {
                console.log(`Telemetría enviada desde ${deviceId}:`, data);
            }
        });
    };

    const setIntervalFrequency = () => {
        clearInterval(intervalId); // Limpiar el intervalo anterior
        const frequency = deviceFrequencies[deviceId] || 5000; // Usar frecuencia predeterminada si no está definida
        intervalId = setInterval(sendTelemetry, frequency); // Establecer nuevo intervalo
    };

    setIntervalFrequency();

    return {
        setFrequency: (newFrequency) => {
            deviceFrequencies[deviceId] = newFrequency;
            setIntervalFrequency(); // Actualizar el intervalo
        }
    };
};

const deviceSimulations = {};
Object.entries(deviceConnections).forEach(([deviceId, connString]) => {
    deviceSimulations[deviceId] = simulateTelemetry(deviceId, connString);
});

// 📌 Enviar comando a un dispositivo (C2D) mediante URL
app.post('/send-command/:deviceId', (req, res) => {
    const { deviceId } = req.params;
    const { command, value } = req.body;

    if (!command) {
        return res.status(400).json({ error: 'Se debe especificar un comando en el body.' });
    }

    const deviceConnectionString = deviceConnections[deviceId];

    if (!deviceConnectionString) {
        return res.status(404).json({ error: 'Dispositivo no encontrado.' });
    }

    const client = Client.fromConnectionString(deviceConnectionString, Mqtt);

    if (command === 'setFrequency') {
        if (!value || isNaN(value) || value <= 0) {
            return res.status(400).json({ error: 'Se debe proporcionar un valor válido para la frecuencia (en milisegundos).' });
        }

        // Actualizar la frecuencia en la simulación de telemetría
        if (deviceSimulations[deviceId]) {
            deviceSimulations[deviceId].setFrequency(value);
            return res.json({ message: `Comando "setFrequency" enviado al dispositivo ${deviceId} con nueva frecuencia ${value}ms` });
        } else {
            return res.status(500).json({ error: 'No se pudo actualizar la frecuencia del dispositivo.' });
        }
    }

    res.status(400).json({ error: `Comando "${command}" no reconocido.` });
});

// 🚀 Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
