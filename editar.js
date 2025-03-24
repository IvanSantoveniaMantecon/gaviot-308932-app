document.addEventListener("DOMContentLoaded", function () {
    const urlParams = new URLSearchParams(window.location.search);
    const deviceId = urlParams.get("id");

    if (deviceId) {
        fetch(`/devices/${deviceId}`)
            .then(response => response.json())
            .then(device => {
                document.getElementById("deviceId").value = device.deviceId;
                document.getElementById("name").value = device.name;
                document.getElementById("status").value = device.status;
                document.getElementById("tags").value = device.tags;
            })
            .catch(error => console.error("Error cargando dispositivo:", error));
    }

    document.getElementById("edit-device-form").addEventListener("submit", function (e) {
        e.preventDefault();
        
        const updatedDevice = {
            name: document.getElementById("name").value,
            status: document.getElementById("status").value,
            tags: document.getElementById("tags").value
        };

        fetch(`/devices/${deviceId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedDevice)
        })
        .then(response => response.json())
        .then(() => {
            alert("Dispositivo actualizado");
            window.location.href = "gestion.html";
        })
        .catch(error => console.error("Error actualizando dispositivo:", error));
    });
});
