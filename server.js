'use strict';
const express = require('express');
const bodyParser = require('body-parser');
const { exec } = require('child_process');

const app = express();
const PORT = 8080;

app.use(bodyParser.json());
app.use(express.static(__dirname)); // Para servir archivos HTML y CSS

app.post('/register-device', (req, res) => {
    const { deviceId, name, ipAddress, latitude, longitude } = req.body;

    if (!deviceId || !name || !ipAddress || !latitude || !longitude) {
        return res.status(400).send("Faltan datos del dispositivo.");
    }

    // Ejecutar el script con los datos
    exec(`node D2C-messajes.js "${deviceId}" "${name}" "${ipAddress}" "${latitude}" "${longitude}"`, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error ejecutando el script: ${stderr}`);
            return res.status(500).send("Error al registrar el dispositivo.");
        }
        res.send(stdout);
    });
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
