// Basic Centralized Search (Mocked for Phase 1)
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('mainSearch');
    const searchResults = document.getElementById('searchResults');

    if (searchInput && searchResults) {
        searchInput.addEventListener('input', (e) => {
            const val = e.target.value.trim().toLowerCase();
            if (val.length < 2) {
                searchResults.style.display = 'none';
                return;
            }

            // Simulated search. Real implementation would search loaded JSONs
            searchResults.style.display = 'block';
            searchResults.innerHTML = `
                <div class="search-result-item" style="padding: 10px; border-bottom: 1px solid #ccc; background: white;">
                    <a href="${CONFIG.getUrl('tools/average-calculator.html')}">حاسبة المعدل (نتيجة بحث لـ ${val})</a>
                </div>
            `;
        });

        // Hide results when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.search-box')) {
                searchResults.style.display = 'none';
            }
        });
    }
});
