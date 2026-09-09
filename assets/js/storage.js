// LocalStorage Wrapper for Favorites & Recent History
const StorageApp = {
    FAV_KEY: 'student_dz_favorites',
    RECENT_KEY: 'student_dz_recent',

    getFavorites: function() {
        return JSON.parse(localStorage.getItem(this.FAV_KEY) || '[]');
    },

    addFavorite: function(item) {
        // item = { id, title, url, icon, type }
        let favs = this.getFavorites();
        if (!favs.find(f => f.id === item.id)) {
            favs.push(item);
            localStorage.setItem(this.FAV_KEY, JSON.stringify(favs));
        }
    },

    removeFavorite: function(id) {
        let favs = this.getFavorites();
        favs = favs.filter(f => f.id !== id);
        localStorage.setItem(this.FAV_KEY, JSON.stringify(favs));
    },

    getRecent: function() {
        return JSON.parse(localStorage.getItem(this.RECENT_KEY) || '[]');
    },

    addRecent: function(item) {
        let recent = this.getRecent();
        // Remove if exists to move to top
        recent = recent.filter(r => r.id !== item.id);
        recent.unshift(item);
        // Keep only last 10
        if (recent.length > 10) recent.pop();
        localStorage.setItem(this.RECENT_KEY, JSON.stringify(recent));
    },

    clearRecent: function() {
        localStorage.setItem(this.RECENT_KEY, '[]');
    }
};
