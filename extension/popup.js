document.addEventListener('DOMContentLoaded', function() {
    const searchBtn = document.getElementById('searchBtn');
    const searchInput = document.getElementById('searchInput');
    const loadingDiv = document.getElementById('loading');
    const resultsContainer = document.getElementById('resultsContainer');
    const resultsBody = document.getElementById('resultsBody');
    const errorDiv = document.getElementById('error');
    const sortSelect = document.getElementById('sortSelect');
    const filterInput = document.getElementById('filterInput');
    const resultCount = document.getElementById('resultCount');
    let cachedResults = [];

    function applySortAndFilter() {
        const sortBy = sortSelect.value;
        const filterText = filterInput.value.toLowerCase().trim();
        let visible = cachedResults.filter(p => !filterText ||
            String(p.name || '').toLowerCase().includes(filterText) ||
            String(p.platform || '').toLowerCase().includes(filterText) ||
            String(p.price).includes(filterText));
        const cheapestPrice = visible.length ? Math.min(...visible.map(p => Number(p.price))) : Infinity;
        visible.sort((a, b) => sortBy === 'cheapest' ? a.price - b.price : sortBy === 'priciest' ? b.price - a.price :
            sortBy === 'platform-az' ? String(a.platform).localeCompare(String(b.platform)) : String(b.platform).localeCompare(String(a.platform)));
        renderResults(visible, cheapestPrice);
    }

    function renderResults(results, cheapestPrice) {
        resultsBody.replaceChildren();
        if (!results.length) { resultCount.textContent = 'No results match your filter.'; return; }
        resultCount.textContent = `Showing ${results.length} result${results.length !== 1 ? 's' : ''}`;
        results.forEach(product => {
            const tr = document.createElement('tr');
            const tdPlatform = document.createElement('td');
            const badge = document.createElement('span');
            badge.className = 'platform-badge ' + (String(product.platform).toLowerCase() === 'amazon' ? 'platform-amazon' : 'platform-flipkart');
            badge.textContent = product.platform || 'Unknown';
            tdPlatform.appendChild(badge);
            if (Number(product.price) === cheapestPrice) {
                const best = document.createElement('span'); best.className = 'best-deal-badge'; best.textContent = 'Best Deal'; tdPlatform.appendChild(best);
            }
            const tdName = document.createElement('td');
            const name = String(product.name || 'Unnamed product');
            tdName.textContent = name.length > 35 ? name.substring(0, 35) + '...' : name;
            tdName.title = name;
            const tdPrice = document.createElement('td');
            tdPrice.className = Number(product.price) === cheapestPrice ? 'price-cheapest' : 'price-text';
            tdPrice.textContent = '₹' + Number(product.price).toLocaleString('en-IN');
            const tdLink = document.createElement('td');
            try {
                const url = new URL(product.url);
                if (['http:', 'https:'].includes(url.protocol)) {
                    const link = document.createElement('a'); link.href = url.href; link.target = '_blank'; link.rel = 'noopener noreferrer'; link.className = 'buy-btn'; link.textContent = 'View'; tdLink.appendChild(link);
                }
            } catch (_) {}
            tr.append(tdPlatform, tdName, tdPrice, tdLink);
            resultsBody.appendChild(tr);
        });
    }

    searchInput.addEventListener('keypress', e => { if (e.key === 'Enter') searchBtn.click(); });
    sortSelect.addEventListener('change', () => { if (cachedResults.length) applySortAndFilter(); });
    filterInput.addEventListener('input', () => { if (cachedResults.length) applySortAndFilter(); });

    searchBtn.addEventListener('click', function() {
        const query = searchInput.value.trim();
        if (!query) return;
        errorDiv.classList.add('hidden'); resultsContainer.classList.add('hidden'); loadingDiv.classList.remove('hidden');
        resultsBody.replaceChildren(); filterInput.value = ''; sortSelect.value = 'cheapest'; cachedResults = []; resultCount.textContent = ''; searchBtn.disabled = true;
        chrome.runtime.sendMessage({ type: 'SEARCH', query }, function(response) {
            loadingDiv.classList.add('hidden'); searchBtn.disabled = false;
            if (chrome.runtime.lastError || !response || response.error) {
                errorDiv.textContent = response?.error || 'Failed to connect to the Price Scout Java Engine.'; errorDiv.classList.remove('hidden'); return;
            }
            if (Array.isArray(response.results) && response.results.length) { cachedResults = response.results; applySortAndFilter(); resultsContainer.classList.remove('hidden'); }
            else { errorDiv.textContent = 'No valid deals found for this product.'; errorDiv.classList.remove('hidden'); }
        });
    });
});
