document.addEventListener('DOMContentLoaded', () => {
    let reciters = [];
    let surahs = [];
    let currentReciterId = null;

    const recitersList = document.getElementById('reciters-list');
    const surahSelect = document.getElementById('surah-select');
    const audioElement = document.getElementById('quran-audio');
    const reciterNameEl = document.getElementById('current-reciter-name');
    const reciterStyleEl = document.getElementById('current-reciter-style');

    if (typeof audioJSON !== 'undefined' && typeof quranJSON !== 'undefined') {
        reciters = audioJSON.reciters;
        surahs = quranJSON.surahs; // Using the full 114 Surahs list from quran.js
        renderReciters();
        populateSurahs();
        if (reciters.length > 0) {
            loadReciter(reciters[0].id);
        }
    } else {
        console.error('Error loading audio data: audioJSON not found');
        recitersList.innerHTML = '<p style="padding: 1rem; color: red;">Failed to load data.</p>';
    }

    function renderReciters() {
        recitersList.innerHTML = '';
        reciters.forEach(reciter => {
            const div = document.createElement('div');
            div.className = `reciter-item ${reciter.id === currentReciterId ? 'active' : ''}`;
            div.innerHTML = `
                <div style="font-weight: 600;">${reciter.name}</div>
                <div style="font-size: 0.85rem; color: var(--text-secondary);">${reciter.style}</div>
            `;
            div.addEventListener('click', () => {
                document.querySelectorAll('.reciter-item').forEach(el => el.classList.remove('active'));
                div.classList.add('active');
                loadReciter(reciter.id);
            });
            recitersList.appendChild(div);
        });
    }

    function populateSurahs() {
        surahSelect.innerHTML = '';
        surahs.forEach(surah => {
            const option = document.createElement('option');
            option.value = surah.id;
            option.textContent = `${surah.id}. ${surah.name_en} - ${surah.name_ar}`;
            surahSelect.appendChild(option);
        });
    }

    function loadReciter(id) {
        currentReciterId = id;
        const reciter = reciters.find(r => r.id === id);
        if (!reciter) return;

        reciterNameEl.textContent = reciter.name;
        reciterStyleEl.textContent = reciter.style;
        updateAudioSource();
    }

    surahSelect.addEventListener('change', () => {
        updateAudioSource();
    });

    function updateAudioSource() {
        if (!currentReciterId) return;
        const surahId = surahSelect.value;
        
        // Pad the surah id to 3 digits (e.g., 1 -> 001, 114 -> 114)
        const paddedId = surahId.toString().padStart(3, '0');
        
        // currentReciterId is now the full base URL ending in a slash
        const audioUrl = `${currentReciterId}${paddedId}.mp3`;
        
        audioElement.src = audioUrl;
        audioElement.load();
        
        // Auto play on change
        audioElement.play().catch(e => console.log("Autoplay prevented", e));
        
        // Handle playback errors (like missing local files or unavailable APIs)
        audioElement.onerror = function() {
            if (currentReciterId.includes("munim_tukhi")) {
                alert("Masla (Problem): Sheikh Munim Al-Tukhi ki audio public online servers par available nahi hai. \n\nIsay chalane ke liye aapko unki MP3 files manually download karke 'audio/munim_tukhi/' folder men rakhni hongi.");
            } else {
                alert("Audio stream unavailable at the moment. Please try another reciter or check your internet connection.");
            }
        };
    }
});
