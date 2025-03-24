document.addEventListener("DOMContentLoaded", function () {
    fetch('/devices')
        .then(response => response.json())
        .then(data => {
            const tableBody = document.querySelector("#device-table tbody");
            tableBody.innerHTML = ""; 
            data.forEach(device => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${device.deviceId}</td>
                    <td>${device.name}</td>
                    <td>${device.status}</td>
                    <td>${device.tags}</td>
                    <td>
                        <button onclick="editDevice('${device.deviceId}')">Editar</button>
                        <button onclick="deleteDevice('${device.deviceId}')">Eliminar</button>
                    </td>
                `;
                tableBody.appendChild(row);
            });
        })
        .catch(error => console.error("Error cargando dispositivos:", error));
});

function editDevice(deviceId) {
    window.location.href = `editar.html?id=${deviceId}`;
}

function deleteDevice(deviceId) {
    if (confirm("¿Seguro que quieres eliminar este dispositivo?")) {
        fetch(`/devices/${deviceId}`, { method: "DELETE" })
            .then(response => response.json())
            .then(() => location.reload())
            .catch(error => console.error("Error eliminando dispositivo:", error));
    }
}
