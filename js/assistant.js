document.addEventListener('DOMContentLoaded', () => {
    const chatBox = document.getElementById('chat-box');
    const chatInput = document.getElementById('chat-input');
    const chatSubmit = document.getElementById('chat-submit');

    // Pre-defined knowledge base for the offline Assistant
    const knowledgeBase = [
        {
            keywords: ["zakat", "nisab", "charity", "poor due"],
            answer: "Zakat is one of the Five Pillars of Islam. It is an obligatory charitable contribution, typically 2.5% of a Muslim's total savings and wealth above a minimum amount known as Nisab. You can calculate your exact Zakat using our <a href='zakat.html'>Zakat Calculator</a>."
        },
        {
            keywords: ["prayer", "salah", "namaz", "times", "qibla"],
            answer: "Salah (prayer) is obligatory five times a day. You can find accurate prayer timings and the Qibla direction for your location on our <a href='prayer.html'>Prayer Times</a> page."
        },
        {
            keywords: ["quran", "read quran", "surah"],
            answer: "The Holy Quran is the central religious text of Islam. You can read, listen to, and study translations of all 114 Surahs on our <a href='quran.html'>Quran</a> page."
        },
        {
            keywords: ["hadith", "bukhari", "muslim", "sunnah"],
            answer: "Hadith are the recorded sayings, actions, and approvals of Prophet Muhammad (PBUH). You can explore thousands of authentic Hadiths from major books like Sahih al-Bukhari and Sahih Muslim on our <a href='hadith.html'>Hadith</a> page."
        },
        {
            keywords: ["dua", "supplication", "99 names", "asma ul husna", "daily dua"],
            answer: "Duas are supplications made to Allah. We have a comprehensive collection of Daily Duas and the 99 Names of Allah with translations and meanings. Visit our <a href='duas.html'>Islamic Library</a> to explore them."
        },
        {
            keywords: ["fasting", "ramadan", "roza", "iftar", "suhoor"],
            answer: "Fasting during the month of Ramadan is an obligation for adult Muslims. You can find the daily Duas for starting (Suhoor) and breaking (Iftar) the fast in our <a href='duas.html'>Library</a>."
        },
        {
            keywords: ["assalamualaikum", "salam", "hello", "hi"],
            answer: "Wa Alaikum Assalam! I am your Islamic Hub Assistant. How can I help you today? You can ask me about Zakat, Prayer, Quran, Hadith, or Duas."
        },
        {
            keywords: ["calendar", "hijri", "date", "islamic month", "islamic date"],
            answer: "You can view the current Hijri date and a complete interactive monthly Islamic calendar on our <a href='calendar.html'>Islamic Calendar</a> page."
        }
    ];

    chatSubmit.addEventListener('click', handleQuery);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleQuery();
    });

    function handleQuery() {
        const query = chatInput.value.trim().toLowerCase();
        if (!query) return;

        // Add User Message
        appendMessage(chatInput.value, 'user');
        chatInput.value = '';

        // Add Loading
        const loadingId = 'msg-' + Date.now();
        appendMessage('<div class="loader" style="width:20px;height:20px;border-width:2px; display:inline-block; vertical-align:middle; margin-right:8px;"></div> Thinking...', 'assistant', loadingId);

        // Process search
        setTimeout(() => {
            const response = searchKnowledgeBase(query);
            replaceMessage(loadingId, response);
        }, 800);
    }

    function searchKnowledgeBase(query) {
        // Find best match
        let bestMatch = null;
        let maxMatchCount = 0;

        for (const entry of knowledgeBase) {
            let matchCount = 0;
            for (const keyword of entry.keywords) {
                if (query.includes(keyword)) {
                    matchCount++;
                }
            }
            if (matchCount > maxMatchCount) {
                maxMatchCount = matchCount;
                bestMatch = entry;
            }
        }

        if (bestMatch) {
            return bestMatch.answer;
        } else {
            return `I'm sorry, I don't have a specific answer for "${query}". <br><br>
            My offline knowledge base focuses on guiding you through the features of Islamic Hub. For specific religious rulings (Fatwas), please consult a qualified scholar.`;
        }
    }

    function appendMessage(html, sender, id = '') {
        const div = document.createElement('div');
        div.className = `message message-${sender}`;
        if (id) div.id = id;
        div.innerHTML = html;
        chatBox.appendChild(div);
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    function replaceMessage(id, html) {
        const el = document.getElementById(id);
        if (el) {
            el.innerHTML = html;
            chatBox.scrollTop = chatBox.scrollHeight;
        }
    }
});
