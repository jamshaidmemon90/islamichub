document.addEventListener('DOMContentLoaded', () => {
    let quranData = [];
    let currentSurahId = 1;

    // Elements
    const surahItemsContainer = document.getElementById('surah-items');
    const versesContainer = document.getElementById('verses-container');
    const currentSurahTitle = document.getElementById('current-surah-title');
    const bismillahHeader = document.getElementById('bismillah-header');
    
    // Controls
    const fontSizeSelect = document.getElementById('font-size');
    const translationToggle = document.getElementById('translation-toggle');
    const surahSearch = document.getElementById('surah-search');

    // Load from global variable defined in json/quran.js
    if (typeof quranJSON !== 'undefined') {
        quranData = quranJSON.surahs;
        renderSurahList(quranData);
        loadSurah(currentSurahId);
    } else {
        console.error('Error loading Quran data: quranJSON not found');
        surahItemsContainer.innerHTML = '<p style="padding: 1rem; color: red;">Failed to load Quran data.</p>';
    }

    function renderSurahList(surahs) {
        surahItemsContainer.innerHTML = '';
        surahs.forEach(surah => {
            const div = document.createElement('div');
            div.className = `surah-item ${surah.id === currentSurahId ? 'active' : ''}`;
            div.dataset.id = surah.id;
            div.innerHTML = `
                <div>
                    <div class="en-name">${surah.id}. ${surah.name_en}</div>
                    <div style="font-size: 0.85rem; color: var(--text-secondary);">${surah.revelation_type} • ${surah.total_verses} Verses</div>
                </div>
                <div class="ar-name">${surah.name_ar}</div>
            `;
            
            div.addEventListener('click', () => {
                document.querySelectorAll('.surah-item').forEach(el => el.classList.remove('active'));
                div.classList.add('active');
                loadSurah(surah.id);
            });
            
            surahItemsContainer.appendChild(div);
        });
    }

    function loadSurah(id) {
        currentSurahId = id;
        const surah = quranData.find(s => s.id === id);
        if (!surah) return;

        currentSurahTitle.textContent = `${surah.name_en} (${surah.name_ar})`;
        
        if (id !== 1 && id !== 9) {
            bismillahHeader.style.display = 'block';
        } else {
            bismillahHeader.style.display = 'none';
        }

        if (surah.verses && surah.verses.length > 0) {
            renderVerses(surah.verses);
        } else {
            // Fetch dynamically if verses are not bundled
            versesContainer.innerHTML = '<div class="loader-container"><div class="loader"></div><p style="margin-left:1rem;">Downloading Surah...</p></div>';
            
            // Using Alquran.cloud API for multi-language
            fetch(`https://api.alquran.cloud/v1/surah/${id}/editions/quran-uthmani,en.asad,ur.jalandhry,sd.amroti`)
                .then(res => res.json())
                .then(data => {
                    if (data.code === 200) {
                        const arData = data.data[0].ayahs;
                        const enData = data.data[1].ayahs;
                        const urData = data.data[2].ayahs;
                        const sdData = data.data[3].ayahs;
                        
                        const parsedVerses = [];
                        for(let i=0; i<arData.length; i++) {
                            parsedVerses.push({
                                id: arData[i].numberInSurah,
                                verse_key: `${id}:${arData[i].numberInSurah}`,
                                text_ar: arData[i].text,
                                translation_en: enData[i].text,
                                translation_ur: urData[i].text,
                                translation_sd: sdData[i].text
                            });
                        }
                        
                        // Cache it locally so we don't fetch again
                        surah.verses = parsedVerses;
                        renderVerses(surah.verses);
                    }
                })
                .catch(err => {
                    console.error("Error fetching surah:", err);
                    versesContainer.innerHTML = '<p style="color:red;text-align:center;">Failed to download Surah. Please check your internet connection.</p>';
                });
        }
    }

    function renderVerses(verses) {
        versesContainer.innerHTML = '';
        const currentFontSize = fontSizeSelect.value;
        const displayMode = translationToggle.value; // all, en, ur, sd, none

        verses.forEach(verse => {
            const verseCard = document.createElement('div');
            verseCard.className = 'verse-card';
            
            // Actions
            let html = `
                <div class="verse-actions">
                    <span style="font-size: 0.9rem; font-weight: 600; color: var(--primary-color);">${verse.verse_key}</span>
                    <button title="Bookmark" onclick="alert('Bookmark feature coming soon!')">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
                    </button>
                    <button title="Copy" onclick="navigator.clipboard.writeText('${verse.text_ar}')">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                    </button>
                </div>
                <div class="arabic-text" style="font-size: ${currentFontSize};">${verse.text_ar} ﴿${verse.id}﴾</div>
            `;

            if (displayMode !== 'none') {
                if (displayMode === 'all' || displayMode === 'en') {
                    html += `<div class="translation"><strong>English:</strong> ${verse.translation_en}</div>`;
                }
                if (displayMode === 'all' || displayMode === 'ur') {
                    html += `<div class="translation translation-ur" dir="rtl"><strong>Urdu:</strong> ${verse.translation_ur}</div>`;
                }
                if (displayMode === 'all' || displayMode === 'sd') {
                    html += `<div class="translation translation-sd" dir="rtl"><strong>Sindhi:</strong> ${verse.translation_sd}</div>`;
                }
            }
            
            verseCard.innerHTML = html;
            versesContainer.appendChild(verseCard);
        });
    }

    // Event Listeners for Controls
    fontSizeSelect.addEventListener('change', () => {
        loadSurah(currentSurahId);
    });

    translationToggle.addEventListener('change', () => {
        loadSurah(currentSurahId);
    });

    surahSearch.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const items = document.querySelectorAll('.surah-item');
        
        items.forEach(item => {
            const text = item.textContent.toLowerCase();
            if (text.includes(term)) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });
    });
});
