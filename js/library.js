document.addEventListener('DOMContentLoaded', () => {
    const duasContainer = document.getElementById('duas-container');
    const namesContainer = document.getElementById('names-container');

    if (typeof libraryJSON !== 'undefined') {
        if (duasContainer && libraryJSON.daily_duas) {
            renderDuas(libraryJSON.daily_duas);
        }
        if (namesContainer && libraryJSON.names_of_allah) {
            renderNames(libraryJSON.names_of_allah);
        }
    } else {
        console.error("Error loading library data: libraryJSON not found");
        if(duasContainer) duasContainer.innerHTML = '<p style="color:red;">Error loading data.</p>';
        if(namesContainer) namesContainer.innerHTML = '<p style="color:red;">Error loading data.</p>';
    }

    function renderDuas(duas) {
        duasContainer.innerHTML = '';
        duas.forEach(dua => {
            const card = document.createElement('div');
            card.className = 'card mb-1';
            card.innerHTML = `
                <h3 style="color: var(--primary-color); margin-bottom: 1rem;">${dua.title}</h3>
                <div class="arabic-text" style="font-size: 1.5rem;">${dua.text_ar}</div>
                <div class="urdu-text" style="font-size: 1.3rem; text-align: right; direction: rtl; margin-top: 1rem; color: var(--text-color);">${dua.translation_ur || ''}</div>
                <p style="margin-top: 1rem; font-size: 1.1rem; color: var(--text-secondary);">${dua.translation_en}</p>
                <p style="margin-top: 0.5rem; font-size: 0.85rem; color: var(--text-secondary);">Reference: ${dua.reference}</p>
            `;
            duasContainer.appendChild(card);
        });
    }

    function renderNames(names) {
        namesContainer.innerHTML = '';
        names.forEach(name => {
            const card = document.createElement('div');
            card.className = 'name-card';
            card.innerHTML = `
                <div style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 0.5rem;">${name.id}</div>
                <div class="arabic-text" style="font-size: 2rem; color: var(--primary-color); margin-bottom: 1rem;">${name.name_ar}</div>
                <div style="font-weight: 600; font-size: 1.2rem;">${name.name_en}</div>
                <div style="color: var(--text-secondary); margin-top: 0.5rem;">${name.meaning_en}</div>
            `;
            namesContainer.appendChild(card);
        });
    }
});
