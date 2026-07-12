document.addEventListener('DOMContentLoaded', () => {
    const locateBtn = document.getElementById('locate-btn');
    const locationStatus = document.getElementById('location-status');
    const cityNameEl = document.getElementById('city-name');
    const currentDateEl = document.getElementById('current-date');
    const qiblaNeedle = document.getElementById('qibla-needle');
    const qiblaAngleText = document.getElementById('qibla-angle-text');

    // Display current date
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    currentDateEl.textContent = new Date().toLocaleDateString('en-US', options);

    locateBtn.addEventListener('click', () => {
        if (!navigator.geolocation) {
            locationStatus.textContent = "Geolocation is not supported by your browser.";
            return;
        }

        locationStatus.textContent = "Locating...";
        
        navigator.geolocation.getCurrentPosition(
            position => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                locationStatus.textContent = "Location found. Fetching prayer times...";
                fetchPrayerTimes(lat, lon);
                fetchQibla(lat, lon);
            },
            error => {
                locationStatus.textContent = "Unable to retrieve your location. Showing offline placeholder.";
                showOfflinePlaceholder();
            }
        );
    });

    function fetchPrayerTimes(lat, lon) {
        // Using Aladhan API
        const date = new Date();
        const apiStr = `https://api.aladhan.com/v1/timings/${date.getDate()}-${date.getMonth()+1}-${date.getFullYear()}?latitude=${lat}&longitude=${lon}&method=2`;

        fetch(apiStr)
            .then(res => res.json())
            .then(data => {
                if (data.code === 200) {
                    const timings = data.data.timings;
                    
                    document.getElementById('time-fajr').textContent = timings.Fajr;
                    document.getElementById('time-sunrise').textContent = timings.Sunrise;
                    document.getElementById('time-dhuhr').textContent = timings.Dhuhr;
                    document.getElementById('time-asr').textContent = timings.Asr;
                    document.getElementById('time-maghrib').textContent = timings.Maghrib;
                    document.getElementById('time-isha').textContent = timings.Isha;

                    cityNameEl.textContent = data.data.meta.timezone; // Simple location display
                    locationStatus.textContent = "Updated successfully.";
                    
                    highlightCurrentPrayer(timings);
                }
            })
            .catch(err => {
                locationStatus.textContent = "Error fetching online data. Showing offline placeholder.";
                showOfflinePlaceholder();
            });
    }

    function fetchQibla(lat, lon) {
        fetch(`https://api.aladhan.com/v1/qibla/${lat}/${lon}`)
            .then(res => res.json())
            .then(data => {
                if (data.code === 200) {
                    const angle = data.data.direction;
                    qiblaAngleText.textContent = `Angle: ${angle.toFixed(1)}° from North`;
                    qiblaNeedle.style.transform = `rotate(${angle}deg)`;
                }
            })
            .catch(err => {
                console.error("Qibla error", err);
            });
    }

    function showOfflinePlaceholder() {
        document.getElementById('time-fajr').textContent = "05:30";
        document.getElementById('time-sunrise').textContent = "06:45";
        document.getElementById('time-dhuhr').textContent = "12:15";
        document.getElementById('time-asr').textContent = "15:30";
        document.getElementById('time-maghrib').textContent = "18:00";
        document.getElementById('time-isha').textContent = "19:30";
        cityNameEl.textContent = "Offline Mode (Estimates)";
    }

    function highlightCurrentPrayer(timings) {
        // Advanced logic to highlight the next prayer can be added here
    }
});
