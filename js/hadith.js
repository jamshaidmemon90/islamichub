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

    function getGroupBUrl(id) {
        const root = 'https://raw.githubusercontent.com/AhmedBaset/hadith-json/main/db/by_book';
        switch (id) {
            case 'ahmad':
                return `${root}/the_9_books/ahmed.json`;
            case 'darimi':
                return `${root}/the_9_books/darimi.json`;
            case 'riyad':
                return `${root}/other_books/riyad_assalihin.json`;
            case 'aladab_almufrad':
                return `${root}/other_books/aladab_almufrad.json`;
            case 'bulugh_almaram':
                return `${root}/other_books/bulugh_almaram.json`;
            case 'mishkat_almasabih':
                return `${root}/other_books/mishkat_almasabih.json`;
            case 'shamail_muhammadiyah':
                return `${root}/other_books/shamail_muhammadiyah.json`;
            default:
                return null;
        }
    }

    function loadCollection(id) {
        currentCollectionId = id;
        const collection = hadithData.find(c => c.id === id);
        if (!collection) return;

        const groupABooks = ['bukhari', 'muslim', 'tirmidhi', 'abudawud', 'nasai', 'ibnmajah', 'malik'];
        const groupCBooks = ['nawawi', 'qudsi', 'dehlawi'];

        hadithReader.innerHTML = `
            <h2 style="color: var(--primary-color); margin-bottom: 2rem;">${collection.name} (${collection.name_ar})</h2>
            <div class="loader-container">
                <div class="loader"></div>
                <p style="margin-left:1rem;">Downloading complete database (this may take a moment)...</p>
            </div>
        `;

        if (groupABooks.includes(id)) {
            // Fetch Arabic and Urdu texts simultaneously for Group A
            Promise.all([
                fetch(`https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/ara-${id}.min.json`).then(r => r.json()),
                fetch(`https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/urd-${id}.min.json`).then(r => r.json())
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
                
                displayHadithCollection();
            })
            .catch(err => {
                console.error("Failed to load hadith API data for Group A", err);
                hadithReader.innerHTML = `
                    <h2 style="color: var(--primary-color); margin-bottom: 2rem;">${collection.name} (${collection.name_ar})</h2>
                    <p style="color:red; text-align:center;">Failed to download Hadith database. Please check your internet connection.</p>
                `;
            });
        } else if (groupCBooks.includes(id)) {
            // Fetch Arabic and English texts simultaneously for Group C
            Promise.all([
                fetch(`https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/ara-${id}.min.json`).then(r => r.json()),
                fetch(`https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/eng-${id}.min.json`).then(r => r.json())
            ])
            .then(([araData, engData]) => {
                currentBookHadiths = [];
                const engHadiths = engData.hadiths;
                const araHadiths = araData.hadiths;
                
                // Merge them by index (assuming they align)
                for(let i = 0; i < engHadiths.length; i++) {
                    currentBookHadiths.push({
                        number: engHadiths[i].hadithnumber,
                        reference: engHadiths[i].reference ? `Book ${engHadiths[i].reference.book}, Hadith ${engHadiths[i].reference.hadith}` : `Hadith ${engHadiths[i].hadithnumber}`,
                        text_ar: araHadiths[i] ? araHadiths[i].text : '',
                        text_ur: '', // No Urdu translation available in this API
                        text_en: engHadiths[i].text,
                        grades: engHadiths[i].grades || []
                    });
                }
                
                displayHadithCollection();
            })
            .catch(err => {
                console.error("Failed to load hadith API data for Group C", err);
                hadithReader.innerHTML = `
                    <h2 style="color: var(--primary-color); margin-bottom: 2rem;">${collection.name} (${collection.name_ar})</h2>
                    <p style="color:red; text-align:center;">Failed to download Hadith database. Please check your internet connection.</p>
                `;
            });
        } else {
            // Fetch Arabic and English texts for Group B
            const url = getGroupBUrl(id);
            if (!url) {
                hadithReader.innerHTML = `
                    <h2 style="color: var(--primary-color); margin-bottom: 2rem;">${collection.name} (${collection.name_ar})</h2>
                    <div class="text-center mt-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--text-secondary); margin-bottom: 1rem;"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                        <h3 style="color: var(--text-secondary);">Database coming soon</h3>
                        <p style="color: var(--text-secondary); max-width: 400px; margin: 1rem auto;">Full texts for this specific collection are not available yet.</p>
                    </div>
                `;
                return;
            }

            fetch(url)
            .then(r => r.json())
            .then(data => {
                currentBookHadiths = [];
                const hadithsList = data.hadiths || [];
                
                hadithsList.forEach(hadith => {
                    currentBookHadiths.push({
                        number: hadith.idInBook,
                        reference: `Hadith ${hadith.idInBook}`,
                        text_ar: hadith.arabic || '',
                        text_ur: '', // Group B books do not have Urdu translations in this API
                        text_en: hadith.english ? (hadith.english.text || '') : '',
                        narrator_en: hadith.english ? (hadith.english.narrator || '') : '',
                        grades: []
                    });
                });

                displayHadithCollection();
            })
            .catch(err => {
                console.error("Failed to load hadith API data for Group B", err);
                hadithReader.innerHTML = `
                    <h2 style="color: var(--primary-color); margin-bottom: 2rem;">${collection.name} (${collection.name_ar})</h2>
                    <p style="color:red; text-align:center;">Failed to download Hadith database. Please check your internet connection.</p>
                `;
            });
        }
    }

    function displayHadithCollection() {
        const collection = hadithData.find(c => c.id === currentCollectionId);
        if (!collection) return;

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
            
            let textHtml = '';
            if (hadith.text_ur) {
                textHtml = `<div class="hadith-text urdu-text" style="font-size: 1.3rem; text-align: right; direction: rtl; margin-top: 1rem; color: var(--text-color);">${hadith.text_ur}</div>`;
            } else if (hadith.text_en) {
                textHtml = `
                    <div class="hadith-text english-text" style="font-size: 1.1rem; text-align: left; direction: ltr; margin-top: 1rem; color: var(--text-color);">
                        ${hadith.narrator_en ? `<p style="margin-bottom: 0.5rem;"><strong>${hadith.narrator_en}</strong></p>` : ''}
                        <p style="line-height: 1.6;">${hadith.text_en}</p>
                    </div>
                `;
            }
            
            html += `
                <div class="hadith-card">
                    <div class="hadith-meta">
                        <span>${hadith.reference} ${gradeHtml}</span>
                    </div>
                    <div class="arabic-text" style="font-size: 1.5rem; text-align: right;">${hadith.text_ar}</div>
                    ${textHtml}
                </div>
            `;
        });

        container.insertAdjacentHTML('beforeend', html);
        currentPage++;

        if (end >= currentBookHadiths.length) {
            loadBtn.style.display = 'none';
        }
    }

    // Local search functionality for the currently loaded collection
    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase().trim();
        if (!term) {
            displayHadithCollection(); // reset
            return;
        }

        const filtered = currentBookHadiths.filter(hadith => {
            const inAr = hadith.text_ar ? hadith.text_ar.toLowerCase().includes(term) : false;
            const inUr = hadith.text_ur ? hadith.text_ur.toLowerCase().includes(term) : false;
            const inEn = hadith.text_en ? hadith.text_en.toLowerCase().includes(term) : false;
            const inNarrator = hadith.narrator_en ? hadith.narrator_en.toLowerCase().includes(term) : false;
            const inRef = hadith.reference ? hadith.reference.toLowerCase().includes(term) : false;
            return inAr || inUr || inEn || inNarrator || inRef;
        });

        const collection = hadithData.find(c => c.id === currentCollectionId);
        const bookName = collection ? collection.name : '';

        let searchResultsHtml = `
            <h2 style="color: var(--primary-color); margin-bottom: 1rem;">Search Results in ${bookName}</h2>
            <p style="margin-bottom: 2rem; color: var(--text-secondary);">Found ${filtered.length} matches for "${term}"</p>
            <div id="hadith-list-container"></div>
        `;

        hadithReader.innerHTML = searchResultsHtml;
        const container = document.getElementById('hadith-list-container');

        if (filtered.length === 0) {
            container.innerHTML = `<p style="color: var(--text-secondary); text-align: center; margin-top: 2rem;">No hadiths found matching your search.</p>`;
            return;
        }

        let html = '';
        const matchesToShow = filtered.slice(0, 200); // Prevents DOM freeze on high match counts

        matchesToShow.forEach(hadith => {
            let gradeHtml = '';
            if (hadith.grades && hadith.grades.length > 0) {
                gradeHtml = `<span style="background: var(--primary-color); color: white; padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.8rem; margin-left: 0.5rem;">${hadith.grades[0].grade}</span>`;
            }
            
            let textHtml = '';
            if (hadith.text_ur) {
                textHtml = `<div class="hadith-text urdu-text" style="font-size: 1.3rem; text-align: right; direction: rtl; margin-top: 1rem; color: var(--text-color);">${hadith.text_ur}</div>`;
            } else if (hadith.text_en) {
                textHtml = `
                    <div class="hadith-text english-text" style="font-size: 1.1rem; text-align: left; direction: ltr; margin-top: 1rem; color: var(--text-color);">
                        ${hadith.narrator_en ? `<p style="margin-bottom: 0.5rem;"><strong>${hadith.narrator_en}</strong></p>` : ''}
                        <p style="line-height: 1.6;">${hadith.text_en}</p>
                    </div>
                `;
            }
            
            html += `
                <div class="hadith-card">
                    <div class="hadith-meta">
                        <span>${hadith.reference} ${gradeHtml}</span>
                    </div>
                    <div class="arabic-text" style="font-size: 1.5rem; text-align: right;">${hadith.text_ar}</div>
                    ${textHtml}
                </div>
            `;
        });

        container.innerHTML = html;

        if (filtered.length > 200) {
            container.insertAdjacentHTML('beforeend', `<p style="color: var(--text-secondary); text-align: center; margin-top: 2rem;">Showing first 200 matches. Please refine your search term for more specific results.</p>`);
        }
    });
});
