document.addEventListener('DOMContentLoaded', () => {
    let hadithData = [];
    let currentCollectionId = null;

    // User display preferences for translations
    let showArabic = true;
    let showUrdu = true;
    let showEnglish = true;
    let autoTranslateUrdu = true;

    // Cache for translated hadiths to avoid redundant API calls
    const translationCache = new Map();

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

    async function translateText(text) {
        if (!text) return '';
        const trimmed = text.trim();
        if (translationCache.has(trimmed)) {
            return translationCache.get(trimmed);
        }

        try {
            const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=ur&dt=t&q=${encodeURIComponent(trimmed)}`;
            const response = await fetch(url);
            if (!response.ok) throw new Error('Translation request failed');
            const data = await response.json();
            if (data && data[0]) {
                const translated = data[0].map(s => s[0]).join('');
                translationCache.set(trimmed, translated);
                return translated;
            }
            return '';
        } catch (error) {
            console.error('Translation error:', error);
            throw error;
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
            // Fetch Arabic, Urdu, and English texts simultaneously for Group A
            Promise.all([
                fetch(`https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/ara-${id}.min.json`).then(r => r.json()),
                fetch(`https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/urd-${id}.min.json`).then(r => r.json()),
                fetch(`https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/eng-${id}.min.json`).then(r => r.json()).catch(() => null)
            ])
            .then(([araData, urdData, engData]) => {
                currentBookHadiths = [];
                const urdHadiths = urdData.hadiths;
                const araHadiths = araData.hadiths;
                const engHadiths = engData ? engData.hadiths : [];
                
                // Merge them by index (assuming they align, which they do in this API)
                for(let i = 0; i < urdHadiths.length; i++) {
                    currentBookHadiths.push({
                        number: urdHadiths[i].hadithnumber,
                        reference: urdHadiths[i].reference ? `Book ${urdHadiths[i].reference.book}, Hadith ${urdHadiths[i].reference.hadith}` : `Hadith ${urdHadiths[i].hadithnumber}`,
                        text_ar: araHadiths[i] ? araHadiths[i].text : '',
                        text_ur: urdHadiths[i].text,
                        text_en: engHadiths[i] ? engHadiths[i].text : '',
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

    function renderHadithCardHtml(hadith) {
        let gradeHtml = '';
        if (hadith.grades && hadith.grades.length > 0) {
            gradeHtml = `<span style="background: var(--primary-color); color: white; padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.8rem; margin-left: 0.5rem;">${hadith.grades[0].grade}</span>`;
        }
        
        const urduVal = hadith.text_ur || '';
        const engVal = hadith.text_en || '';
        const arVal = hadith.text_ar || '';
        const isGroupA = ['bukhari', 'muslim', 'tirmidhi', 'abudawud', 'nasai', 'ibnmajah', 'malik'].includes(currentCollectionId);
        const showTranslateBtn = !urduVal && engVal && !isGroupA;

        return `
            <div class="hadith-card" data-id="${hadith.number}">
                <div class="hadith-meta">
                    <span>${hadith.reference} ${gradeHtml}</span>
                </div>
                <div class="arabic-text" style="${showArabic ? 'display: block;' : 'display: none;'} font-size: 1.5rem; text-align: right;">${arVal}</div>
                
                <div class="hadith-text urdu-text" style="${(showUrdu && urduVal) ? 'display: block;' : 'display: none;'}">
                    ${urduVal}
                </div>

                ${engVal ? `
                <div class="hadith-text english-text" style="${showEnglish ? 'display: block;' : 'display: none;'} font-size: 1.1rem; text-align: left; direction: ltr; margin-top: 1rem; color: var(--text-color);">
                    ${hadith.narrator_en ? `<p style="margin-bottom: 0.5rem;"><strong>${hadith.narrator_en}</strong></p>` : ''}
                    <p style="line-height: 1.6;">${engVal}</p>
                </div>
                ` : ''}

                ${showTranslateBtn ? `
                <div class="translate-action-container" style="${(showUrdu && !autoTranslateUrdu) ? 'display: flex;' : 'display: none;'}">
                    <button class="translate-btn">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px; vertical-align: middle;"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                        Translate to Urdu (ترجمہ کریں)
                    </button>
                </div>
                ` : ''}
            </div>
        `;
    }

    function bindCardEvents(container) {
        const cards = container.querySelectorAll('.hadith-card');
        cards.forEach(card => {
            const translateBtn = card.querySelector('.translate-btn');
            if (translateBtn && !translateBtn.dataset.listenerBound) {
                translateBtn.dataset.listenerBound = 'true';
                translateBtn.addEventListener('click', async () => {
                    const urduContainer = card.querySelector('.urdu-text');
                    const englishContainer = card.querySelector('.english-text p:last-child');
                    const translateBtnContainer = card.querySelector('.translate-action-container');
                    
                    if (urduContainer && englishContainer) {
                        translateBtn.disabled = true;
                        translateBtn.innerHTML = `<span class="btn-spinner"></span> Translating...`;
                        
                        try {
                            const translated = await translateText(englishContainer.innerText);
                            const hadithId = card.dataset.id;
                            const hadithObj = currentBookHadiths.find(h => String(h.number) === String(hadithId));
                            if (hadithObj) {
                                hadithObj.text_ur = translated;
                            }
                            
                            urduContainer.innerHTML = translated;
                            urduContainer.style.display = showUrdu ? 'block' : 'none';
                            if (translateBtnContainer) translateBtnContainer.style.display = 'none';
                        } catch (err) {
                            console.error(err);
                            translateBtn.disabled = false;
                            translateBtn.innerHTML = `Retry Translation`;
                        }
                    }
                });
            }
        });
    }

    async function triggerAutoTranslations() {
        if (!autoTranslateUrdu || !showUrdu) return;

        const cards = document.querySelectorAll('.hadith-card');
        for (const card of cards) {
            const urduContainer = card.querySelector('.urdu-text');
            const englishContainer = card.querySelector('.english-text p:last-child');
            const translateBtnContainer = card.querySelector('.translate-action-container');
            const translateBtn = card.querySelector('.translate-btn');
            
            if (urduContainer && urduContainer.innerHTML.trim() === '' && englishContainer) {
                const englishText = englishContainer.innerText;
                if (!englishText) continue;

                if (translateBtn) {
                    translateBtn.disabled = true;
                    translateBtn.innerHTML = `<span class="btn-spinner"></span> Translating...`;
                }

                try {
                    const translated = await translateText(englishText);
                    const hadithId = card.dataset.id;
                    const hadithObj = currentBookHadiths.find(h => String(h.number) === String(hadithId));
                    if (hadithObj) {
                        hadithObj.text_ur = translated;
                    }

                    urduContainer.innerHTML = translated;
                    urduContainer.style.display = showUrdu ? 'block' : 'none';
                    if (translateBtnContainer) translateBtnContainer.style.display = 'none';
                } catch (err) {
                    console.error("Auto-translation failed for Hadith", err);
                    if (translateBtn) {
                        translateBtn.disabled = false;
                        translateBtn.innerHTML = `Retry Translation`;
                    }
                }
            }
        }
    }

    function applyDisplaySettings() {
        const arabicTexts = document.querySelectorAll('.hadith-card .arabic-text');
        const urduTexts = document.querySelectorAll('.hadith-card .urdu-text');
        const englishTexts = document.querySelectorAll('.hadith-card .english-text');
        const translateBtns = document.querySelectorAll('.hadith-card .translate-action-container');

        arabicTexts.forEach(el => el.style.display = showArabic ? 'block' : 'none');
        
        urduTexts.forEach(el => {
            const hasContent = el.innerHTML.trim() !== '';
            el.style.display = (showUrdu && hasContent) ? 'block' : 'none';
        });

        englishTexts.forEach(el => el.style.display = showEnglish ? 'block' : 'none');

        translateBtns.forEach(el => {
            const card = el.closest('.hadith-card');
            const hasUrdu = card.querySelector('.urdu-text').innerHTML.trim() !== '';
            el.style.display = (showUrdu && !hasUrdu && !autoTranslateUrdu) ? 'flex' : 'none';
        });
    }

    function renderReaderSkeleton(collection, isGroupA) {
        const settingsHtml = `
            <div class="reader-settings-panel">
                <div class="reader-settings-title">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--primary-color); vertical-align: middle; margin-right: 4px;"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                    <span>Display Options (نمائش کے اختیارات)</span>
                </div>
                <div class="reader-settings-controls">
                    <label class="settings-label">
                        <input type="checkbox" id="toggle-arabic" class="settings-checkbox" ${showArabic ? 'checked' : ''}>
                        <span>Arabic (عربی)</span>
                    </label>
                    <label class="settings-label">
                        <input type="checkbox" id="toggle-urdu" class="settings-checkbox" ${showUrdu ? 'checked' : ''}>
                        <span>Urdu (اردو)</span>
                    </label>
                    <label class="settings-label">
                        <input type="checkbox" id="toggle-english" class="settings-checkbox" ${showEnglish ? 'checked' : ''}>
                        <span>English</span>
                    </label>
                    ${!isGroupA ? `
                    <label class="settings-label" style="border-left: 1px solid var(--border-color); padding-left: 1rem; margin-left: 0.5rem;">
                        <input type="checkbox" id="toggle-autotranslate" class="settings-checkbox" ${autoTranslateUrdu ? 'checked' : ''}>
                        <span style="color: var(--accent-color); font-weight: 600;">Auto-Translate to Urdu (خودکار اردو ترجمہ)</span>
                    </label>
                    ` : ''}
                </div>
            </div>
        `;

        let noticeHtml = '';
        if (!isGroupA) {
            noticeHtml = `
                <div style="background-color: rgba(201, 156, 51, 0.08); border-left: 4px solid var(--accent-color); padding: 0.75rem 1rem; border-radius: 4px; margin-bottom: 1.5rem; font-size: 0.85rem; color: var(--text-secondary); display: flex; align-items: center; gap: 8px;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: var(--accent-color); flex-shrink: 0;"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                    <span><strong>Urdu Translation Notice:</strong> This collection does not have an official Urdu database. Urdu translation is generated automatically using Google Translate. (عربی سے اردو ترجمہ خودکار طریقے سے گوگل ٹرانسلیٹ کے ذریعے کیا جا raha hai)</span>
                </div>
            `;
        }

        hadithReader.innerHTML = `
            <h2 style="color: var(--primary-color); margin-bottom: 0.5rem;">${collection.name} (${collection.name_ar})</h2>
            <p style="margin-bottom: 1.5rem; color: var(--text-secondary);">Total Hadiths: ${currentBookHadiths.length}</p>
            ${noticeHtml}
            ${settingsHtml}
            <div id="hadith-list-container"></div>
            <div class="text-center" style="margin-top: 2rem;">
                <button id="load-more-btn" class="btn btn-primary" style="padding: 0.75rem 2rem;">Load More</button>
            </div>
        `;

        document.getElementById('toggle-arabic').addEventListener('change', (e) => {
            showArabic = e.target.checked;
            applyDisplaySettings();
        });
        document.getElementById('toggle-urdu').addEventListener('change', (e) => {
            showUrdu = e.target.checked;
            applyDisplaySettings();
            if (showUrdu && autoTranslateUrdu) {
                triggerAutoTranslations();
            }
        });
        document.getElementById('toggle-english').addEventListener('change', (e) => {
            showEnglish = e.target.checked;
            applyDisplaySettings();
        });
        
        const autoTranslateEl = document.getElementById('toggle-autotranslate');
        if (autoTranslateEl) {
            autoTranslateEl.addEventListener('change', (e) => {
                autoTranslateUrdu = e.target.checked;
                if (autoTranslateUrdu) {
                    showUrdu = true;
                    const urduCheckbox = document.getElementById('toggle-urdu');
                    if (urduCheckbox) urduCheckbox.checked = true;
                }
                applyDisplaySettings();
                if (autoTranslateUrdu) {
                    triggerAutoTranslations();
                }
            });
        }

        document.getElementById('load-more-btn').addEventListener('click', loadMoreHadiths);
    }

    function displayHadithCollection() {
        const collection = hadithData.find(c => c.id === currentCollectionId);
        if (!collection) return;

        currentPage = 0;
        
        const isGroupA = ['bukhari', 'muslim', 'tirmidhi', 'abudawud', 'nasai', 'ibnmajah', 'malik'].includes(currentCollectionId);
        
        if (isGroupA) {
            showUrdu = true;
            showEnglish = false;
        } else {
            showEnglish = true;
            showUrdu = true;
        }

        renderReaderSkeleton(collection, isGroupA);
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
            html += renderHadithCardHtml(hadith);
        });

        container.insertAdjacentHTML('beforeend', html);

        bindCardEvents(container);
        applyDisplaySettings();
        
        if (autoTranslateUrdu) {
            triggerAutoTranslations();
        }

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
        const matchesToShow = filtered.slice(0, 200);

        matchesToShow.forEach(hadith => {
            html += renderHadithCardHtml(hadith);
        });

        container.innerHTML = html;

        bindCardEvents(container);
        applyDisplaySettings();
        
        if (autoTranslateUrdu) {
            triggerAutoTranslations();
        }

        if (filtered.length > 200) {
            container.insertAdjacentHTML('beforeend', `<p style="color: var(--text-secondary); text-align: center; margin-top: 2rem;">Showing first 200 matches. Please refine your search term for more specific results.</p>`);
        }
    });
});
