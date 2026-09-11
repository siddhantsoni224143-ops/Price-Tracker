const API_BASE_URL = "http://127.0.0.1:7860/api";

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type !== "SEARCH" || !message.query) return;

    const query = String(message.query).trim().slice(0, 100);
    fetch(`${API_BASE_URL}/search?q=${encodeURIComponent(query)}`)
        .then(async response => {
            const data = await response.json().catch(() => null);
            if (!response.ok) throw new Error(data?.error || `HTTP ${response.status}`);
            return data;
        })
        .then(data => sendResponse({ results: Array.isArray(data) ? data : [] }))
        .catch(error => {
            console.error("Price Scout API Error:", error);
            sendResponse({ error: "Local Price Scout engine is not running on port 7860." });
        });

    return true;
});
