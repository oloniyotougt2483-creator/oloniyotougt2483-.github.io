// Initialize map centered on Nigeria
const map = L.map('map').setView([9.082, 8.6753], 6);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

let planeMarkers = {};

// OpenSky doesn't send CORS headers for browser requests from github.io,
// so we route through a public CORS proxy. Two options in case one is down.
function buildProxiedUrl(targetUrl) {
    return "https://corsproxy.io/?url=" + encodeURIComponent(targetUrl);
}

function buildFallbackUrl(targetUrl) {
    return "https://api.allorigins.win/raw?url=" + encodeURIComponent(targetUrl);
}

async function fetchFlights() {
    const statusEl = document.getElementById('status');
    statusEl.textContent = "⏳ Fetching live flights...";

    // Bounding box roughly covering Nigeria (lat 4-14N, lon 2.5-15E)
    const openSkyUrl = "https://opensky-network.org/api/states/all?lamin=4&lomin=2.5&lamax=14&lomax=15";

    let data;

    try {
        const response = await fetch(buildProxiedUrl(openSkyUrl));
        if (!response.ok) throw new Error("Primary proxy returned " + response.status);
        data = await response.json();
    } catch (primaryErr) {
        console.warn("Primary CORS proxy failed, trying fallback:", primaryErr);
        try {
            const response2 = await fetch(buildFallbackUrl(openSkyUrl));
            if (!response2.ok) throw new Error("Fallback proxy returned " + response2.status);
            data = await response2.json();
        } catch (fallbackErr) {
            console.error("Both proxies failed:",
