document.addEventListener('DOMContentLoaded', () => {
    let hadithData = [];
    let currentCollectionId = null;

    const collectionList = document.getElementById('collection-list');
    const hadithReader = document.getElementById('hadith-reader');
    const searchInput = document.getElementById('hadith-search');

    if (typeof hadithJSON !== 'undefined') {
        hadithData = hadithJSON.collections;
        renderCollectionList();
        if (hadithData.length > 0) {
            loadCollection(hadithData[0].id);
        }
    } else {
        console.error('Error loading Hadith data: hadithJSON not found');
        collectionList.innerHTML = '<p style="padding: 1rem; color: red;">Failed to load data.</p>';
    }

    function renderCollectionList() {
        collectionList.innerHTML = '';
        hadithData.forEach(collection => {
            const div = document.createElement('div');
            div.className = `collection-item ${collection.id === currentCollectionId ? 'active' : ''}`;
            div.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <h3>${collection.name}</h3>
                        <p>${collection.author}</p>
                    </div>
                    <div class="arabic-text" style="font-size: 1.2rem; padding: 0;">${collection.name_ar}</div>
                </div>
            `;
            div.addEventListener('click', () => {
                document.querySelectorAll('.collection-item').forEach(el => el.classList.remove('active'));
                div.classList.add('active');
                loadCollection(collection.id);
            });
            collectionList.appendChild(div);
        });
    }

    let currentBookHadiths = [];
    let currentPage = 0;
    const ITEMS_PER_PAGE = 50;

    function loadCollection(id) {
        currentCollectionId = id;
        const collection = hadithData.find(c => c.id === id);
        if (!collection) return;

        // Ensure supported book id for the API
        const apiId = id === 'riyad' ? null : (id === 'ahmad' ? null : id);

        hadithReader.innerHTML = `
            <h2 style="color: var(--primary-color); margin-bottom: 2rem;">${collection.name} (${collection.name_ar})</h2>
            <div class="loader-container">
                <div class="loader"></div>
                <p style="margin-left:1rem;">Downloading complete database (this may take a moment)...</p>
            </div>
        `;

        if (!apiId) {
            hadithReader.innerHTML = `
                <h2 style="color: var(--primary-color); margin-bottom: 2rem;">${collection.name} (${collection.name_ar})</h2>
                <div class="text-center mt-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--text-secondary); margin-bottom: 1rem;"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                    <h3 style="color: var(--text-secondary);">Database coming soon</h3>
                    <p style="color: var(--text-secondary); max-width: 400px; margin: 1rem auto;">Full texts for this specific collection are not available in the public API yet. They will be added manually in a future update.</p>
                </div>
            `;
            return;
        }

        // Fetch Arabic and Urdu texts simultaneously
        Promise.all([
            fetch(`https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/ara-${apiId}.min.json`).then(r => r.json()),
            fetch(`https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/urd-${apiId}.min.json`).then(r => r.json())
        ])
        .then(([araData, urdData]) => {
            currentBookHadiths = [];
            const urdHadiths = urdData.hadiths;
            const araHadiths = araData.hadiths;
            
            // Merge them by index (assuming they align, which they do in this API)
            for(let i = 0; i < urdHadiths.length; i++) {
                currentBookHadiths.push({
                    number: urdHadiths[i].hadithnumber,
                    reference: urdHadiths[i].reference ? `Book ${urdHadiths[i].reference.book}, Hadith ${urdHadiths[i].reference.hadith}` : `Hadith ${urdHadiths[i].hadithnumber}`,
                    text_ar: araHadiths[i] ? araHadiths[i].text : '',
                    text_ur: urdHadiths[i].text,
                    grades: urdHadiths[i].grades || []
                });
            }
            
            currentPage = 0;
            
            hadithReader.innerHTML = `
                <h2 style="color: var(--primary-color); margin-bottom: 1rem;">${collection.name} (${collection.name_ar})</h2>
                <p style="margin-bottom: 2rem; color: var(--text-secondary);">Total Hadiths: ${currentBookHadiths.length}</p>
                <div id="hadith-list-container"></div>
                <div class="text-center" style="margin-top: 2rem;">
                    <button id="load-more-btn" class="btn btn-primary" style="padding: 0.75rem 2rem;">Load More</button>
                </div>
            `;
            
            document.getElementById('load-more-btn').addEventListener('click', loadMoreHadiths);
            loadMoreHadiths();
        })
        .catch(err => {
            console.error("Failed to load hadith API data", err);
            hadithReader.innerHTML = `
                <h2 style="color: var(--primary-color); margin-bottom: 2rem;">${collection.name} (${collection.name_ar})</h2>
                <p style="color:red; text-align:center;">Failed to download Hadith database. Please check your internet connection.</p>
            `;
        });
    }

    function loadMoreHadiths() {
        const container = document.getElementById('hadith-list-container');
        const loadBtn = document.getElementById('load-more-btn');
        if (!container) return;

        const start = currentPage * ITEMS_PER_PAGE;
        const end = start + ITEMS_PER_PAGE;
        const pageHadiths = currentBookHadiths.slice(start, end);

        let html = '';
        pageHadiths.forEach(hadith => {
            let gradeHtml = '';
            if (hadith.grades && hadith.grades.length > 0) {
                gradeHtml = `<span style="background: var(--primary-color); color: white; padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.8rem; margin-left: 0.5rem;">${hadith.grades[0].grade}</span>`;
            }
            
            html += `
                <div class="hadith-card">
                    <div class="hadith-meta">
                        <span>${hadith.reference} ${gradeHtml}</span>
                    </div>
                    <div class="arabic-text" style="font-size: 1.5rem; text-align: right;">${hadith.text_ar}</div>
                    <div class="hadith-text urdu-text" style="font-size: 1.3rem; text-align: right; direction: rtl; margin-top: 1rem; color: var(--text-color);">${hadith.text_ur}</div>
                </div>
            `;
        });

        container.insertAdjacentHTML('beforeend', html);
        currentPage++;

        if (end >= currentBookHadiths.length) {
            loadBtn.style.display = 'none';
        }
    }

    // Basic search functionality
    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        if (!term) {
            loadCollection(currentCollectionId); // reset
            return;
        }

        // Search across all collections and hadiths
        let searchResultsHtml = `<h2>Search Results for "${term}"</h2>`;
        let found = false;

        hadithData.forEach(collection => {
            collection.chapters.forEach(chapter => {
                chapter.hadiths.forEach(hadith => {
                    if (hadith.text_en.toLowerCase().includes(term) || hadith.narrator.toLowerCase().includes(term)) {
                        found = true;
                        searchResultsHtml += `
                            <div class="hadith-card">
                                <div class="hadith-meta">
                                    <span>${collection.name} - ${hadith.reference}</span>
                                </div>
                                <div class="arabic-text" style="font-size: 1.25rem;">${hadith.text_ar}</div>
                                <div class="hadith-text">${hadith.text_en}</div>
                            </div>
                        `;
                    }
                });
            });
        });

        if (!found) {
            searchResultsHtml += `<p>No hadiths found matching your search.</p>`;
        }

        hadithReader.innerHTML = searchResultsHtml;
    });
});
