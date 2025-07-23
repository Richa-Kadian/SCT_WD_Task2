// DOM Elements
        const minutesEl = document.getElementById('minutes');
        const secondsEl = document.getElementById('seconds');
        const millisecondsEl = document.getElementById('milliseconds');
        const totalTimeEl = document.getElementById('totalTime');
        const avgLapTimeEl = document.getElementById('avgLapTime');
        const startPauseBtn = document.getElementById('startPauseBtn');
        const lapBtn = document.getElementById('lapBtn');
        const resetBtn = document.getElementById('resetBtn');
        const saveBtn = document.getElementById('saveBtn');
        const exportBtn = document.getElementById('exportBtn');
        const lapList = document.getElementById('lapList');
        const themeToggle = document.querySelector('.theme-toggle');
        const displayArea = document.querySelector('.display-area');

        // State Variables
        let startTime = 0;
        let elapsedTime = 0;
        let interval = null;
        let isRunning = false;
        let lapTimes = [];
        let lastLapTime = 0;

        // Format Time
        function formatTime(time) {
            return time < 10 ? `0${time}` : time;
        }

        // Update Display
        function updateDisplay() {
            elapsedTime = Date.now() - startTime;
            const minutes = Math.floor(elapsedTime / 60000);
            const seconds = Math.floor((elapsedTime % 60000) / 1000);
            const milliseconds = Math.floor((elapsedTime % 1000) / 10);
            minutesEl.textContent = formatTime(minutes);
            secondsEl.textContent = formatTime(seconds);
            millisecondsEl.textContent = formatTime(milliseconds);
            totalTimeEl.textContent = `Total: ${formatTime(minutes)}:${formatTime(seconds)}:${formatTime(milliseconds)}`;
            if (lapTimes.length > 0) {
                const avgTime = lapTimes.reduce((sum, lap) => sum + lap.time, 0) / lapTimes.length;
                const avgMin = Math.floor(avgTime / 60000);
                const avgSec = Math.floor((avgTime % 60000) / 1000);
                const avgMs = Math.floor((avgTime % 1000) / 10);
                avgLapTimeEl.textContent = `Avg Lap: ${formatTime(avgMin)}:${formatTime(avgSec)}:${formatTime(avgMs)}`;
            }
        }

        // Start/Pause
        function toggleTimer() {
            if (!isRunning) {
                startTime = Date.now() - elapsedTime;
                interval = setInterval(updateDisplay, 10);
                isRunning = true;
                startPauseBtn.innerHTML = '<i class="fas fa-pause"></i> Pause';
                lapBtn.disabled = false;
                saveBtn.style.display = 'none';
                exportBtn.style.display = 'none';
                displayArea.classList.add('running');
            } else {
                clearInterval(interval);
                isRunning = false;
                startPauseBtn.innerHTML = '<i class="fas fa-play"></i> Start';
                if (lapTimes.length > 0) {
                    saveBtn.style.display = 'inline-flex';
                    exportBtn.style.display = 'inline-flex';
                }
                displayArea.classList.remove('running');
            }
        }

        // Record Lap
        function recordLap() {
            if (!isRunning) return;
            const currentTime = elapsedTime;
            const diff = lastLapTime === 0 ? currentTime : currentTime - lastLapTime;
            lastLapTime = currentTime;
            const min = Math.floor(currentTime / 60000);
            const sec = Math.floor((currentTime % 60000) / 1000);
            const ms = Math.floor((currentTime % 1000) / 10);
            const diffMin = Math.floor(Math.abs(diff) / 60000);
            const diffSec = Math.floor((Math.abs(diff) % 60000) / 1000);
            const diffMs = Math.floor((Math.abs(diff) % 1000) / 10);
            lapTimes.push({
                time: currentTime,
                display: `${formatTime(min)}:${formatTime(sec)}:${formatTime(ms)}`,
                diff: diff < 0 ? `-${formatTime(diffMin)}:${formatTime(diffSec)}:${formatTime(diffMs)}` : `+${formatTime(diffMin)}:${formatTime(diffSec)}:${formatTime(diffMs)}`,
                isPositive: diff >= 0
            });
            updateLapList();
            playSound();
        }

        // Update Lap List
        function updateLapList() {
            lapList.innerHTML = '';
            if (lapTimes.length === 0) {
                lapList.innerHTML = '<div class="no-laps">Record laps to see details</div>';
                return;
            }
            lapTimes.slice().reverse().forEach((lap, index) => {
                const div = document.createElement('div');
                div.className = 'lap-item';
                div.innerHTML = `
                    <span class="lap-number">Lap ${index + 1}</span>
                    <span class="lap-time">${lap.display}</span>
                    <span class="lap-difference ${lap.isPositive ? 'positive' : 'negative'}">${lap.diff}</span>
                `;
                lapList.appendChild(div);
                div.scrollIntoView({ behavior: 'smooth', block: 'end' });
            });
        }

        // Reset Timer
        function resetTimer() {
            clearInterval(interval);
            isRunning = false;
            elapsedTime = 0;
            startTime = 0;
            lastLapTime = 0;
            lapTimes = [];
            minutesEl.textContent = '00';
            secondsEl.textContent = '00';
            millisecondsEl.textContent = '00';
            totalTimeEl.textContent = 'Total: 00:00:00';
            avgLapTimeEl.textContent = 'Avg Lap: --:--:--';
            startPauseBtn.innerHTML = '<i class="fas fa-play"></i> Start';
            lapBtn.disabled = true;
            saveBtn.style.display = 'none';
            exportBtn.style.display = 'none';
            updateLapList();
            displayArea.classList.remove('running');
        }

        // Play Sound Effect
        function playSound() {
            const audio = new Audio('data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhAAADDEAAAAAAAABAAZGF0YQAAAAA=');
            audio.play().catch(() => console.log('Audio play blocked'));
        }

        // Save Session
        function saveSession() {
            if (lapTimes.length > 0) {
                const session = {
                    date: new Date().toLocaleString(),
                    elapsed: elapsedTime,
                    laps: lapTimes
                };
                localStorage.setItem('tempusProSession', JSON.stringify(session));
                alert('Session saved to local storage!');
            } else {
                alert('No laps to save.');
            }
        }

        // Export Laps
        function exportLaps() {
            if (lapTimes.length > 0) {
                let text = `Tempus Pro Timer Export - ${new Date().toLocaleString()}\n\nLap | Time | Difference\n`;
                lapTimes.slice().reverse().forEach((lap, index) => {
                    text += `${index + 1} | ${lap.display} | ${lap.diff}\n`;
                });
                const blob = new Blob([text], { type: 'text/plain' });
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = `tempus_pro_laps_${new Date().toISOString().slice(0, 10)}.txt`;
                link.click();
            } else {
                alert('No laps to export.');
            }
        }

        // Toggle Theme
        function toggleTheme() {
            document.body.classList.toggle('light-theme');
            localStorage.setItem('tempusTheme', document.body.classList.contains('light-theme') ? 'light' : 'dark');
        }

        // Load Saved State
        document.addEventListener('DOMContentLoaded', () => {
            const savedTheme = localStorage.getItem('tempusTheme');
            if (savedTheme === 'light') document.body.classList.add('light-theme');
            const savedSession = localStorage.getItem('tempusProSession');
            if (savedSession) {
                const session = JSON.parse(savedSession);
                elapsedTime = session.elapsed;
                lapTimes = session.laps;
                startTime = Date.now() - elapsedTime;
                updateDisplay();
                updateLapList();
                if (lapTimes.length > 0) {
                    saveBtn.style.display = 'inline-flex';
                    exportBtn.style.display = 'inline-flex';
                }
            }
        });

        // Event Listeners
        startPauseBtn.addEventListener('click', toggleTimer);
        lapBtn.addEventListener('click', recordLap);
        resetBtn.addEventListener('click', resetTimer);
        saveBtn.addEventListener('click', saveSession);
        exportBtn.addEventListener('click', exportLaps);
        themeToggle.addEventListener('click', toggleTheme);

        // Initialize
        resetTimer();
