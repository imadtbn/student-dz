// Maps Module using Leaflet (Lazy Loaded)
let mapInstance = null;

async function initMap(containerId, centerLat = 36.7538, centerLng = 3.0588, zoom = 11) {
    if (typeof L === 'undefined') {
        // Load Leaflet CSS
        const css = document.createElement('link');
        css.rel = 'stylesheet';
        css.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(css);

        // Load Leaflet JS
        await new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    const container = document.getElementById(containerId);
    if(!container) return;

    mapInstance = L.map(containerId).setView([centerLat, centerLng], zoom);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mapInstance);

    return mapInstance;
}

function addMarker(lat, lng, title, popupContent) {
    if(!mapInstance) return;
    const marker = L.marker([lat, lng]).addTo(mapInstance);
    if(popupContent) {
        marker.bindPopup(`<b>${title}</b><br>${popupContent}`);
    } else {
        marker.bindPopup(title);
    }
    return marker;
}
