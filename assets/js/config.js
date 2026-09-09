// Configuration for Student DZ
const CONFIG = {
    // Base path for GitHub Pages deployment.
    // Set to "/student-dz" for production on GitHub Pages, or "" for local development if served from root.
    BASE_PATH: "/student-dz",

    // API/Data paths
    API: {
        UNIVERSITIES: "/data/universities.json",
        RESIDENCES: "/data/residences.json",
        PLATFORMS: "/data/platforms.json",
        SETTINGS: "/data/settings.json",
        FEEDBACK_SETTINGS: "/data/feedback-settings.json"
    },

    // Get a URL ensuring BASE_PATH is prefixed
    getUrl: function(path) {
        if (!path) return this.BASE_PATH + "/";
        if (path.startsWith('http')) return path; // External links

        // Remove leading slash from path to prevent double slashes
        const cleanPath = path.startsWith('/') ? path.substring(1) : path;
        return `${this.BASE_PATH}/${cleanPath}`;
    }
};

// Export if using modules, otherwise it's global
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
