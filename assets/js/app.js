// Core App Initialization
document.addEventListener('DOMContentLoaded', () => {
    // Populate Dashboard if there's history or favorites
    const dashboardSection = document.getElementById('studentDashboard');
    const dashboardContent = document.getElementById('dashboardContent');

    if (dashboardSection && dashboardContent) {
        const recent = StorageApp.getRecent();
        const favorites = StorageApp.getFavorites();

        if (recent.length > 0 || favorites.length > 0) {
            dashboardSection.style.display = 'block';
            let html = '';

            // Just show top 3 recent for now
            recent.slice(0, 3).forEach(item => {
                html += `
                    <a href="${CONFIG.getUrl(item.url)}" class="card">
                        <div class="card-icon">${item.icon && item.icon.includes('fa-') ? `<i class="${item.icon}"></i>` : (item.icon || '<i class="fa-solid fa-thumbtack"></i>')}</div>
                        <h3 class="card-title">${item.title}</h3>
                        <p class="card-desc">آخر استخدام</p>
                    </a>
                `;
            });
            dashboardContent.innerHTML = html;
        }
    }
});

// Helper for fetching JSON data securely
async function fetchAppJSON(path) {
    try {
        const url = CONFIG.getUrl(path);
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    } catch (e) {
        console.error("Error fetching JSON from " + path, e);
        return null;
    }
}
