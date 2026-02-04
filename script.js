// PAYUNGDEV Interactive Profile Script
document.addEventListener('DOMContentLoaded', function () {
    // Set current year in footer
    document.getElementById('current-year').textContent = new Date().getFullYear();

    // Theme Toggle
    const themeToggle = document.querySelector('.theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', function () {
            document.body.classList.toggle('dark-theme');
            const icon = this.querySelector('i');
            if (document.body.classList.contains('dark-theme')) {
                icon.classList.remove('fa-moon');
                icon.classList.add('fa-sun');
                localStorage.setItem('theme', 'dark');
            } else {
                icon.classList.remove('fa-sun');
                icon.classList.add('fa-moon');
                localStorage.setItem('theme', 'light');
            }
        });

        // Load saved theme
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-theme');
            themeToggle.querySelector('i').classList.remove('fa-moon');
            themeToggle.querySelector('i').classList.add('fa-sun');
        }
    }

    // Animate elements on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function (entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.animated-card').forEach(card => {
        observer.observe(card);
    });

    // Initialize GitHub stats (simulated - in real use, fetch from GitHub API)
    simulateGitHubStats();

    // Initialize game if on game page
    if (document.querySelector('.game-container')) {
        initializeGame();
    }

    // Profile image click effect
    const profilePic = document.getElementById('profile-pic');
    if (profilePic) {
        profilePic.addEventListener('click', function () {
            this.style.transform = 'scale(1.1)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 300);
        });
    }
});

// GitHub Stats Simulation
function simulateGitHubStats() {
    const repoCount = document.getElementById('repo-count');
    const starCount = document.getElementById('star-count');
    const followerCount = document.getElementById('follower-count');
    const joinDate = document.getElementById('join-date');

    if (repoCount) {
        // Simulate counting animation
        animateValue(repoCount, 0, 24, 1000);
        animateValue(starCount, 0, 56, 1200);
        animateValue(followerCount, 0, 18, 800);

        if (joinDate) {
            joinDate.textContent = '2020';
        }
    }
}

function animateValue(element, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const value = Math.floor(progress * (end - start) + start);
        element.textContent = value + (element.id === 'star-count' ? '+' : '');
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

// Game Logic
function initializeGame() {
    // Game state
    let gameState = {
        targetNumber: 0,
        attempts: 10,
        score: 0,
        level: 1,
        minRange: 1,
        maxRange: 100,
        difficulty: 'easy',
        gameActive: true,
        guessHistory: []
    };

    // DOM Elements
    const guessInput = document.getElementById('guess-input');
    const guessBtn = document.getElementById('guess-btn');
    const newGameBtn = document.getElementById('new-game-btn');
    const resetBtn = document.getElementById('reset-btn');
    const hintBtn = document.getElementById('hint-btn');
    const soundToggle = document.getElementById('sound-toggle');
    const difficultyBtns = document.querySelectorAll('.difficulty-btn');
    const numberGrid = document.querySelector('.number-grid');
    const guessHistory = document.getElementById('guess-history');
    const feedbackText = document.getElementById('feedback-text');
    const resultModal = document.getElementById('result-modal');
    const modalClose = document.querySelector('.modal-close');
    const modalNext = document.getElementById('modal-next');
    const modalRestart = document.getElementById('modal-restart');

    // Initialize number pad
    createNumberPad();

    // Initialize game
    newGame();

    // Event Listeners
    guessBtn.addEventListener('click', handleGuess);
    guessInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') handleGuess();
    });

    newGameBtn.addEventListener('click', newGame);
    resetBtn.addEventListener('click', resetLevel);
    hintBtn.addEventListener('click', giveHint);

    soundToggle.addEventListener('click', function () {
        const icon = this.querySelector('i');
        if (this.classList.contains('muted')) {
            this.classList.remove('muted');
            icon.classList.remove('fa-volume-mute');
            icon.classList.add('fa-volume-up');
            this.innerHTML = '<i class="fas fa-volume-up"></i> Suara: ON';
        } else {
            this.classList.add('muted');
            icon.classList.remove('fa-volume-up');
            icon.classList.add('fa-volume-mute');
            this.innerHTML = '<i class="fas fa-volume-mute"></i> Suara: OFF';
        }
    });

    difficultyBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            difficultyBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            gameState.difficulty = this.dataset.level;
            updateDifficulty();
            newGame();
        });
    });

    modalClose.addEventListener('click', () => {
        resultModal.classList.remove('show');
    });

    modalNext.addEventListener('click', nextLevel);
    modalRestart.addEventListener('click', newGame);

    // Close modal when clicking outside
    resultModal.addEventListener('click', function (e) {
        if (e.target === this) {
            this.classList.remove('show');
        }
    });

    // Functions
    function createNumberPad() {
        if (!numberGrid) return;

        // Create number buttons 0-9
        for (let i = 0; i <= 9; i++) {
            const btn = document.createElement('button');
            btn.className = 'number-btn';
            btn.textContent = i;
            btn.dataset.number = i;
            btn.addEventListener('click', function () {
                if (!gameState.gameActive) return;
                guessInput.value += this.dataset.number;
                guessInput.focus();
                playSound('click');
            });
            numberGrid.appendChild(btn);
        }

        // Add clear button
        const clearBtn = document.createElement('button');
        clearBtn.className = 'number-btn';
        clearBtn.innerHTML = '<i class="fas fa-backspace"></i>';
        clearBtn.addEventListener('click', function () {
            if (!gameState.gameActive) return;
            guessInput.value = guessInput.value.slice(0, -1);
            guessInput.focus();
            playSound('click');
        });
        numberGrid.appendChild(clearBtn);
    }

    function newGame() {
        // Reset game state based on difficulty
        updateDifficulty();

        gameState.targetNumber = generateRandomNumber(gameState.minRange, gameState.maxRange);
        gameState.attempts = getMaxAttempts();
        gameState.gameActive = true;
        gameState.guessHistory = [];

        // Reset UI
        guessInput.value = '';
        guessInput.disabled = false;
        guessBtn.disabled = false;

        // Clear history
        guessHistory.innerHTML = `
            <div class="empty-history">
                <i class="fas fa-clock"></i>
                <p>Belum ada tebakan</p>
            </div>
        `;

        // Update displays
        updateDisplays();
        updateVisualization();

        // Set feedback
        setFeedback(`Tebak angka antara ${gameState.minRange} dan ${gameState.maxRange}. Anda memiliki ${gameState.attempts} kesempatan.`);

        // Close modal if open
        resultModal.classList.remove('show');

        playSound('new-game');
    }

    function resetLevel() {
        gameState.attempts = getMaxAttempts();
        gameState.guessHistory = [];
        gameState.gameActive = true;
        guessInput.disabled = false;
        guessBtn.disabled = false;

        guessHistory.innerHTML = `
            <div class="empty-history">
                <i class="fas fa-clock"></i>
                <p>Belum ada tebakan</p>
            </div>
        `;

        updateDisplays();
        setFeedback(`Level direset! Tebak angka antara ${gameState.minRange} dan ${gameState.maxRange}.`);

        playSound('reset');
    }

    function updateDifficulty() {
        switch (gameState.difficulty) {
            case 'easy':
                gameState.minRange = 1;
                gameState.maxRange = 50;
                break;
            case 'medium':
                gameState.minRange = 1;
                gameState.maxRange = 100;
                break;
            case 'hard':
                gameState.minRange = 1;
                gameState.maxRange = 200;
                break;
        }

        // Update range display
        const rangeDisplay = document.getElementById('range-display');
        if (rangeDisplay) {
            rangeDisplay.textContent = `${gameState.minRange} - ${gameState.maxRange}`;
        }

        // Update visualization
        updateVisualization();
    }

    function getMaxAttempts() {
        switch (gameState.difficulty) {
            case 'easy': return 10;
            case 'medium': return 8;
            case 'hard': return 6;
            default: return 8;
        }
    }

    function generateRandomNumber(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function handleGuess() {
        if (!gameState.gameActive) return;

        const guess = parseInt(guessInput.value);

        // Validate input
        if (isNaN(guess)) {
            setFeedback('Silakan masukkan angka yang valid!', 'error');
            shakeElement(guessInput);
            return;
        }

        if (guess < gameState.minRange || guess > gameState.maxRange) {
            setFeedback(`Angka harus antara ${gameState.minRange} dan ${gameState.maxRange}!`, 'error');
            shakeElement(guessInput);
            return;
        }

        // Process guess
        gameState.attempts--;
        gameState.guessHistory.push({
            guess: guess,
            time: new Date().toLocaleTimeString()
        });

        // Check guess
        if (guess === gameState.targetNumber) {
            handleWin();
            return;
        }

        // Update range based on guess
        if (guess < gameState.targetNumber) {
            gameState.minRange = Math.max(gameState.minRange, guess + 1);
            setFeedback(`Terlalu rendah! Coba angka yang lebih tinggi. (${gameState.minRange} - ${gameState.maxRange})`, 'low');
        } else {
            gameState.maxRange = Math.min(gameState.maxRange, guess - 1);
            setFeedback(`Terlalu tinggi! Coba angka yang lebih rendah. (${gameState.minRange} - ${gameState.maxRange})`, 'high');
        }

        // Add to history
        addToHistory(guess, guess < gameState.targetNumber ? 'low' : 'high');

        // Update visualization
        updateVisualization();

        // Check if lost
        if (gameState.attempts <= 0) {
            handleLoss();
            return;
        }

        // Clear input
        guessInput.value = '';
        guessInput.focus();

        // Update displays
        updateDisplays();

        // Play sound
        playSound('guess');
    }

    function handleWin() {
        gameState.gameActive = false;
        gameState.score += gameState.attempts * gameState.level * 10;

        // Add to history
        addToHistory(gameState.targetNumber, 'correct');

        // Update UI
        updateDisplays();
        setFeedback(`🎉 TEPAT! Angka rahasianya adalah ${gameState.targetNumber}. Skor Anda bertambah!`, 'correct');

        // Show win modal
        showResultModal(true);

        // Update achievements
        updateAchievements();

        // Play win sound
        playSound('win');

        // Disable input
        guessInput.disabled = true;
        guessBtn.disabled = true;
    }

    function handleLoss() {
        gameState.gameActive = false;

        setFeedback(`😞 GAME OVER! Angka rahasianya adalah ${gameState.targetNumber}. Coba lagi!`, 'error');

        // Show loss modal
        showResultModal(false);

        // Play loss sound
        playSound('lose');

        // Disable input
        guessInput.disabled = true;
        guessBtn.disabled = true;
    }

    function showResultModal(isWin) {
        const modal = document.getElementById('result-modal');
        const modalTitle = document.getElementById('modal-title');
        const modalIcon = document.getElementById('modal-icon');
        const modalMessage = document.getElementById('modal-message');
        const modalLevel = document.getElementById('modal-level');
        const modalScore = document.getElementById('modal-score');
        const modalAttempts = document.getElementById('modal-attempts');
        const modalNext = document.getElementById('modal-next');

        if (isWin) {
            modalTitle.textContent = 'Selamat! 🎉';
            modalIcon.innerHTML = '<i class="fas fa-trophy"></i>';
            modalMessage.textContent = `Anda berhasil menebak angka ${gameState.targetNumber} dengan benar!`;
            modalNext.style.display = 'inline-block';
        } else {
            modalTitle.textContent = 'Coba Lagi! 💪';
            modalIcon.innerHTML = '<i class="fas fa-redo"></i>';
            modalMessage.textContent = `Angka rahasianya adalah ${gameState.targetNumber}. Coba lagi di level ${gameState.level}!`;
            modalNext.style.display = 'none';
        }

        modalLevel.textContent = gameState.level;
        modalScore.textContent = gameState.score;
        modalAttempts.textContent = gameState.attempts;

        modal.classList.add('show');
    }

    function nextLevel() {
        if (gameState.level < 5) {
            gameState.level++;

            // Increase difficulty slightly
            switch (gameState.difficulty) {
                case 'easy':
                    gameState.maxRange += 20;
                    break;
                case 'medium':
                    gameState.maxRange += 30;
                    break;
                case 'hard':
                    gameState.maxRange += 50;
                    break;
            }

            // Start new game at next level
            newGame();
            setFeedback(`Level ${gameState.level}! Rentang angka sekarang lebih luas.`, 'info');
        } else {
            // Game completed
            setFeedback('🎊 SELAMAT! Anda telah menyelesaikan semua level!', 'correct');
            showCompletionModal();
        }

        resultModal.classList.remove('show');
    }

    function showCompletionModal() {
        // Show special completion modal
        const modal = document.getElementById('result-modal');
        const modalTitle = document.getElementById('modal-title');
        const modalIcon = document.getElementById('modal-icon');
        const modalMessage = document.getElementById('modal-message');
        const modalNext = document.getElementById('modal-next');

        modalTitle.textContent = 'MASTER! 👑';
        modalIcon.innerHTML = '<i class="fas fa-crown"></i>';
        modalMessage.textContent = `Anda telah menyelesaikan semua 5 level dengan total skor ${gameState.score}!`;
        modalNext.textContent = 'Main Lagi';
        modalNext.style.display = 'inline-block';

        modal.classList.add('show');

        // Update achievements
        const achievements = document.querySelectorAll('.achievement-item');
        achievements.forEach(achievement => {
            achievement.classList.add('unlocked');
        });

        playSound('win');
    }

    function giveHint() {
        if (!gameState.gameActive) return;

        // Calculate hint
        let hint = '';
        const rangeSize = gameState.maxRange - gameState.minRange;

        if (rangeSize <= 10) {
            hint = `Angkanya sangat dekat dengan ${Math.floor((gameState.minRange + gameState.maxRange) / 2)}`;
        } else if (rangeSize <= 30) {
            const quarter = Math.floor(rangeSize / 4);
            hint = `Angkanya berada di antara ${gameState.minRange + quarter} dan ${gameState.maxRange - quarter}`;
        } else {
            hint = `Angkanya berada di pertengahan ${gameState.minRange} dan ${gameState.maxRange}`;
        }

        setFeedback(`💡 Petunjuk: ${hint}`, 'hint');
        playSound('hint');
    }

    function addToHistory(guess, type) {
        if (!guessHistory) return;

        // Remove empty state if present
        const emptyState = guessHistory.querySelector('.empty-history');
        if (emptyState) {
            emptyState.remove();
        }

        const historyItem = document.createElement('div');
        historyItem.className = `history-item ${type}`;

        let icon = '';
        switch (type) {
            case 'low': icon = '⬇️'; break;
            case 'high': icon = '⬆️'; break;
            case 'correct': icon = '✅'; break;
        }

        historyItem.innerHTML = `
            <div class="history-guess">
                <span class="history-icon">${icon}</span>
                <span class="history-number">${guess}</span>
            </div>
            <div class="history-info">
                <span class="history-time">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                <span class="history-attempt">#${gameState.guessHistory.length}</span>
            </div>
        `;

        guessHistory.prepend(historyItem);
    }

    function setFeedback(message, type = 'info') {
        if (!feedbackText) return;

        feedbackText.innerHTML = `<p>${message}</p>`;

        // Add type-based styling
        feedbackText.className = 'feedback-message';
        if (type) {
            feedbackText.classList.add(type);
        }
    }

    function updateDisplays() {
        // Update level display
        const levelDisplay = document.getElementById('current-level');
        if (levelDisplay) levelDisplay.textContent = gameState.level;

        // Update score display
        const scoreDisplay = document.getElementById('current-score');
        if (scoreDisplay) scoreDisplay.textContent = gameState.score;

        // Update attempts display
        const attemptsDisplay = document.getElementById('attempts-left');
        if (attemptsDisplay) attemptsDisplay.textContent = gameState.attempts;

        // Update target number (shows ? during game)
        const targetDisplay = document.querySelector('.target-number');
        if (targetDisplay) {
            targetDisplay.textContent = gameState.gameActive ? '?' : gameState.targetNumber;
        }

        // Update progress bar
        const progressBar = document.getElementById('level-progress');
        if (progressBar) {
            const progress = ((gameState.level - 1) / 5) * 100;
            progressBar.style.width = `${progress}%`;
        }

        // Update level indicators
        const levelIndicators = document.querySelectorAll('.level-indicator');
        levelIndicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index < gameState.level);
        });
    }

    function updateVisualization() {
        // Update range min/max
        const rangeMin = document.getElementById('range-min');
        const rangeMax = document.getElementById('range-max');
        const rangeFill = document.getElementById('range-fill');
        const guessMarker = document.getElementById('guess-marker');
        const targetMarker = document.getElementById('target-marker');

        if (rangeMin) rangeMin.textContent = gameState.minRange;
        if (rangeMax) rangeMax.textContent = gameState.maxRange;

        if (rangeFill) {
            const totalRange = gameState.maxRange - gameState.minRange;
            const fillPercent = 100 - (totalRange / 100) * 100;
            rangeFill.style.width = `${Math.max(5, fillPercent)}%`;
        }

        // Position markers
        if (targetMarker && gameState.gameActive) {
            const targetPercent = ((gameState.targetNumber - 1) / (gameState.maxRange - 1)) * 100;
            targetMarker.style.left = `${targetPercent}%`;
        }

        // Update guess marker if there's a last guess
        if (guessMarker && gameState.guessHistory.length > 0) {
            const lastGuess = gameState.guessHistory[gameState.guessHistory.length - 1].guess;
            const guessPercent = ((lastGuess - 1) / (gameState.maxRange - 1)) * 100;
            guessMarker.style.left = `${guessPercent}%`;
            guessMarker.style.display = 'block';
        } else if (guessMarker) {
            guessMarker.style.display = 'none';
        }
    }

    function updateAchievements() {
        const achievements = document.querySelectorAll('.achievement-item');

        if (gameState.level >= 1) {
            achievements[0].classList.add('unlocked');
        }
        if (gameState.level >= 3) {
            achievements[1].classList.add('unlocked');
        }
        if (gameState.level >= 5) {
            achievements[2].classList.add('unlocked');
        }
    }

    function playSound(type) {
        if (soundToggle.classList.contains('muted')) return;

        // In a real implementation, you would play actual audio files
        // This is a simulation with console logging
        const sounds = {
            'click': 'Click sound',
            'guess': 'Guess sound',
            'win': 'Win sound',
            'lose': 'Lose sound',
            'hint': 'Hint sound',
            'new-game': 'New game sound',
            'reset': 'Reset sound'
        };

        console.log(`Playing: ${sounds[type] || 'Default sound'}`);

        // Visual feedback for sound
        if (type === 'win') {
            confettiEffect();
        }
    }

    function confettiEffect() {
        // Simple confetti effect
        const colors = ['#3498db', '#2ecc71', '#e74c3c', '#f1c40f', '#9b59b6'];

        for (let i = 0; i < 50; i++) {
            const confetti = document.createElement('div');
            confetti.style.position = 'fixed';
            confetti.style.width = '10px';
            confetti.style.height = '10px';
            confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.borderRadius = '50%';
            confetti.style.top = '0';
            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.zIndex = '9999';
            confetti.style.pointerEvents = 'none';

            document.body.appendChild(confetti);

            // Animate
            const animation = confetti.animate([
                { transform: 'translateY(0) rotate(0deg)', opacity: 1 },
                { transform: `translateY(${window.innerHeight}px) rotate(${Math.random() * 360}deg)`, opacity: 0 }
            ], {
                duration: 1000 + Math.random() * 1000,
                easing: 'cubic-bezier(0.215, 0.61, 0.355, 1)'
            });

            animation.onfinish = () => confetti.remove();
        }
    }

    function shakeElement(element) {
        element.classList.add('shake');
        setTimeout(() => {
            element.classList.remove('shake');
        }, 500);
    }

    // Add CSS for shake animation
    const style = document.createElement('style');
    style.textContent = `
        .shake {
            animation: shake 0.5s ease-in-out;
        }
        
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
        }
        
        .feedback-message.low { border-left: 4px solid #3498db; }
        .feedback-message.high { border-left: 4px solid #e74c3c; }
        .feedback-message.correct { border-left: 4px solid #2ecc71; }
        .feedback-message.error { border-left: 4px solid #e74c3c; }
        .feedback-message.hint { border-left: 4px solid #f1c40f; }
    `;
    document.head.appendChild(style);
}