document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("consultarBtn").addEventListener("click", function () {
        const deviceId = document.getElementById("deviceId").value.trim();

        if (!deviceId) {
            alert("Por favor, ingresa un ID de dispositivo.");
            return;
        }

        fetch(`/device/${deviceId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error("Dispositivo no encontrado o error en el servidor.");
                }
                return response.json();
            })
            .then(data => {
                document.getElementById("device-id").textContent = data.deviceId || "N/A";
                document.getElementById("device-status").textContent = data.status || "N/A";
                document.getElementById("device-properties").textContent = JSON.stringify(data.properties, null, 2);
                document.getElementById("device-configurations").textContent = JSON.stringify(data.configurations, null, 2);
            })
            .catch(error => {
                console.error("Error consultando dispositivo:", error);
                document.getElementById("resultado").innerHTML = `<p style="color: red;">Error: ${error.message}</p>`;
            });
    });
});
