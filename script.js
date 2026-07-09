// Initialize map centered on Nigeria
const map = L.map('map').setView([9.082, 8.6753], 6);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

let planeMarkers = {};

async function fetchFlights() {
    const statusEl = document.getElementById('status');
    statusEl.textContent = "🔄 Fetching live flights...";

    try {
        const url = "https://opensky-network.org/api/states/all?lamin=4&lomin=2.5&lamax=14&lomax=15";
        
        const response = await fetch(url);
        const data = await response.json();

        // Clear old markers
        Object.values(planeMarkers).forEach(m => map.removeLayer(m));
        planeMarkers = {};

        let count = 0;

        if (data.states && data.states.length > 0) {
            data.states.forEach(plane => {
                const callsign = (plane[1] || "Unknown").trim();
                const lat = plane[6];
                const lon = plane[5];
                const altitude = plane[13] !== null ? Math.round(plane[13]) + " ft" : "N/A";
                const speed = plane[9] !== null ? Math.round(plane[9] * 3.6) + " km/h" : "N/A";

                if (lat && lon) {
                    const marker = L.marker([lat, lon], {
                        icon: L.divIcon({ 
                            className: 'plane', 
                            html: '✈️', 
                            iconSize: [30, 30] 
                        })
                    }).addTo(map);

                    marker.bindPopup(`
                        <b>${callsign}</b><br>
                        Altitude: ${altitude}<br>
                        Speed: ${speed}
                    `);

                    planeMarkers[callsign] = marker;
                    count++;
                }
            });

            statusEl.innerHTML = `🟢 <strong>${count} flights</strong> tracked`;
        } else {
            statusEl.textContent = "No flights detected at the moment";
        }

    } catch (err) {
        console.error(err);
        statusEl.textContent = "❌ Error loading data";
    }
}

// Initial fetch + auto refresh
fetchFlights();
setInterval(fetchFlights, 12000);
