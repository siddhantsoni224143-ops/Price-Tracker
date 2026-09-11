console.log("Price Scout: Initializing...");

function getProductTitle() {
    const selectors = window.location.hostname.includes("amazon")
        ? ["#productTitle", ".a-size-extra-large", "h1#title"]
        : [".VU-Z7G", "h1", "span.B_NuE_"];
    for (const selector of selectors) {
        const el = document.querySelector(selector);
        if (el?.innerText?.trim()) return el.innerText.trim();
    }
    return null;
}

function makeEl(tag, text, className) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (text != null) el.textContent = text;
    return el;
}

function injectFloatingButton() {
    const title = getProductTitle();
    if (!title || document.getElementById("price-scout-fab")) return;

    const fab = document.createElement("div");
    fab.id = "price-scout-fab";
    fab.appendChild(makeEl("div", "S", "fab-icon"));
    const content = makeEl("div", null, "fab-content");
    content.appendChild(makeEl("div", "Compare Prices", "fab-label"));
    content.appendChild(makeEl("div", title.substring(0, 30) + "...", "fab-product"));
    fab.appendChild(content);
    document.body.appendChild(fab);
    fab.addEventListener("click", () => showOverlay(title));
}

function showOverlay(query) {
    let overlay = document.getElementById("price-scout-overlay");
    if (!overlay) {
        overlay = document.createElement("div");
        overlay.id = "price-scout-overlay";
        const panel = makeEl("div", null, "scout-side-panel");
        const header = makeEl("header", null, "");
        header.appendChild(makeEl("div", "Price Scout Intel", "scout-logo"));
        const close = makeEl("button", "×", "scout-close");
        header.appendChild(close);
        panel.appendChild(header);
        panel.appendChild(makeEl("div", null, "scout-results-list"));
        overlay.appendChild(panel);
        document.body.appendChild(overlay);
        close.onclick = () => overlay.classList.remove("open");
    }

    overlay.classList.add("open");
    const list = overlay.querySelector(".scout-results-list");
    list.textContent = "Fetching deals...";

    chrome.runtime.sendMessage({ type: "SEARCH", query }, response => {
        if (!response || response.error || !Array.isArray(response.results) || response.results.length === 0) {
            list.textContent = response?.error || "No other deals found. Try a more specific search.";
            return;
        }
        renderResults(response.results, list);
    });
}

function renderResults(results, container) {
    container.replaceChildren();
    [...results].sort((a, b) => a.price - b.price).forEach(item => {
        const div = makeEl("div", null, "scout-item");
        const main = makeEl("div", null, "item-main");
        main.appendChild(makeEl("span", item.platform || "Unknown", "item-store"));
        main.appendChild(makeEl("span", "₹" + Number(item.price).toLocaleString("en-IN"), "item-price"));
        div.appendChild(main);
        div.appendChild(makeEl("div", item.name || "Unnamed product", "item-name"));
        const link = makeEl("a", "View Deal", "item-link");
        try {
            const url = new URL(item.url);
            if (["https:", "http:"].includes(url.protocol)) {
                link.href = url.href;
                link.target = "_blank";
                link.rel = "noopener noreferrer";
                div.appendChild(link);
            }
        } catch (_) {}
        container.appendChild(div);
    });
}

setInterval(injectFloatingButton, 2000);
injectFloatingButton();
