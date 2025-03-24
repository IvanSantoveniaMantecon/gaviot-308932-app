'use strict';
const express = require('express');
const bodyParser = require('body-parser');
const iothub = require('azure-iothub');

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
app.get('/devices/:id', (req, res) => {
    const deviceId = req.params.id;

    registry.get(deviceId, (err, deviceInfo) => {
        if (err) {
            console.error(`Error obteniendo dispositivo: ${err.message}`);
            return res.status(404).send("Dispositivo no encontrado.");
        }

        const device = {
            deviceId: deviceInfo.deviceId,
            name: deviceInfo.deviceId, // No hay campo "name", usamos el ID
            status: deviceInfo.connectionState || "Desconocido",
            tags: deviceInfo.tags || ""
        };

        res.json(device);
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

// 🚀 Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
