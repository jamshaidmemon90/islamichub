document.addEventListener('DOMContentLoaded', () => {
    const calendarDays = document.getElementById('calendar-days');
    const calendarTitle = document.getElementById('calendar-title');
    const prevBtn = document.getElementById('prev-month');
    const nextBtn = document.getElementById('next-month');

    if (!calendarDays) return;

    let currentDate = new Date();
    let currentMonth = currentDate.getMonth() + 1; // 1-12
    let currentYear = currentDate.getFullYear();

    function loadCalendar(month, year) {
        calendarDays.innerHTML = '<div style="grid-column: 1 / -1; padding: 2rem;">Loading...</div>';
        try {
            const daysInMonth = new Date(year, month, 0).getDate();
            const daysData = [];
            const offset = parseInt(localStorage.getItem('hijri_offset') || '-1');

            for (let d = 1; d <= daysInMonth; d++) {
                const gregDate = new Date(year, month - 1, d);
                const hijriDate = new Date(gregDate);
                hijriDate.setDate(hijriDate.getDate() + offset);

                const formatter = new Intl.DateTimeFormat('en-US-u-ca-islamic', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                });
                
                let details = { day: d.toString(), month: 'Islamic', year: '1448' };
                try {
                    const parts = formatter.formatToParts(hijriDate);
                    parts.forEach(part => {
                        if (part.type !== 'literal') {
                            details[part.type] = part.value;
                        }
                    });
                } catch (e) {
                    console.error('Failed to parse date parts:', e);
                }

                daysData.push({
                    gregorian: { day: d.toString() },
                    hijri: {
                        day: details.day,
                        month: { en: details.month },
                        year: details.year
                    }
                });
            }

            renderCalendar(daysData, month, year);
        } catch (error) {
            calendarDays.innerHTML = '<div style="grid-column: 1 / -1; padding: 2rem; color: red;">Failed to generate calendar.</div>';
            console.error(error);
        }
    }

    // Reactive reload on offset change
    window.addEventListener('hijriOffsetChanged', () => {
        loadCalendar(currentMonth, currentYear);
    });

    function renderCalendar(daysData, month, year) {
        calendarDays.innerHTML = '';
        
        // Find the day of the week the month starts on
        const firstDayObj = new Date(year, month - 1, 1);
        const startDay = firstDayObj.getDay(); // 0 (Sun) to 6 (Sat)
        
        const monthName = firstDayObj.toLocaleString('default', { month: 'long' });
        
        // Find Hijri Month name (usually spans two, we take the one from middle of the month)
        let hijriMonthName = "";
        let hijriYear = "";
        if (daysData.length > 15) {
            hijriMonthName = daysData[15].hijri.month.en;
            hijriYear = daysData[15].hijri.year;
        }

        calendarTitle.innerHTML = `${monthName} ${year} <br><span style="font-size: 1.2rem; color: var(--text-secondary);">${hijriMonthName} ${hijriYear} AH</span>`;

        // Add empty cells for days before start of month
        for (let i = 0; i < startDay; i++) {
            const emptyCell = document.createElement('div');
            emptyCell.style.padding = '10px';
            calendarDays.appendChild(emptyCell);
        }

        const today = new Date();
        const isCurrentMonth = today.getMonth() + 1 === month && today.getFullYear() === year;

        // Add days
        daysData.forEach(day => {
            const cell = document.createElement('div');
            cell.style.cssText = `
                padding: 10px;
                border: 1px solid var(--border-color);
                border-radius: 4px;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                min-height: 80px;
                background: var(--bg-color);
            `;

            const isToday = isCurrentMonth && parseInt(day.gregorian.day) === today.getDate();
            if (isToday) {
                cell.style.border = '2px solid var(--primary-color)';
                cell.style.backgroundColor = 'var(--primary-color)';
                cell.style.color = 'white';
            }

            cell.innerHTML = `
                <div style="font-size: 1.2rem; font-weight: bold; ${isToday ? 'color: white;' : 'color: var(--text-color);'}">${day.gregorian.day}</div>
                <div style="font-size: 0.9rem; ${isToday ? 'color: rgba(255,255,255,0.9);' : 'color: var(--primary-color);'} font-weight: 500;">${day.hijri.day}</div>
                <div style="font-size: 0.75rem; ${isToday ? 'color: rgba(255,255,255,0.7);' : 'color: var(--text-secondary);'}">${day.hijri.month.en.substring(0, 3)}</div>
            `;
            calendarDays.appendChild(cell);
        });
    }

    prevBtn.addEventListener('click', () => {
        currentMonth--;
        if (currentMonth < 1) {
            currentMonth = 12;
            currentYear--;
        }
        loadCalendar(currentMonth, currentYear);
    });

    nextBtn.addEventListener('click', () => {
        currentMonth++;
        if (currentMonth > 12) {
            currentMonth = 1;
            currentYear++;
        }
        loadCalendar(currentMonth, currentYear);
    });

    // Initial load
    loadCalendar(currentMonth, currentYear);
});
