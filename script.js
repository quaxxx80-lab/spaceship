document.addEventListener('DOMContentLoaded', () => {
    const spaceshipHitbox = document.getElementById('spaceship-hitbox');
    const dialogBox = document.getElementById('dialog-box');
    const dialogText = document.getElementById('dialog-text');
    const dialogClose = document.getElementById('dialog-close');

    // Minigame elements
    const minigameOverlay = document.getElementById('minigame-overlay');
    const waveCanvas = document.getElementById('wave-canvas');
    const waveCtx = waveCanvas.getContext('2d');
    const timeBar = document.getElementById('time-bar');
    const mathProblemText = document.getElementById('math-problem');
    const mathAnswerInput = document.getElementById('math-answer');
    const questStatus = document.getElementById('quest-status');
    const stardateDisplay = document.getElementById('stardate-display');
    const timeRemainingLabel = document.getElementById('time-remaining-label');
    const backgroundImage = document.getElementById('background-image');
    const infoBox = document.getElementById('info-box');
    const transitionOverlay = document.getElementById('transition-overlay');

    // Typewriter effect state
    let typeWriterTimeout;

    // Minigame state
    let currentAnswer = 0;
    let questionsSolved = 0;
    const requiredQuestions = 5;
    let timerInterval;
    let timeRemaining = 60; // 60 seconds

    // Wave animation state
    let wavePhase = 0;
    let animationFrameId;

    function resizeCanvas() {
        waveCanvas.width = minigameOverlay.clientWidth;
        waveCanvas.height = minigameOverlay.clientHeight;
    }

    // Initial resize but hide initially
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    spaceshipHitbox.addEventListener('click', () => {
        showDialog("wir müssen den Scanner kalibrieren, bevor wir fortfahren können");
    });

    dialogClose.addEventListener('click', () => {
        hideDialog();
        startMinigame();
    });

    function showDialog(text) {
        // Clear any ongoing typing
        clearTimeout(typeWriterTimeout);
        dialogText.textContent = '';
        dialogBox.classList.remove('hidden');

        // Typewriter effect
        let i = 0;
        function typeWriter() {
            if (i < text.length) {
                dialogText.textContent += text.charAt(i);
                i++;
                typeWriterTimeout = setTimeout(typeWriter, 30); // Speed of typing
            }
        }
        typeWriter();
    }

    function hideDialog() {
        dialogBox.classList.add('hidden');
        clearTimeout(typeWriterTimeout);
    }

    // Minigame functions
    function startMinigame() {
        minigameOverlay.classList.remove('hidden');
        resizeCanvas();
        questionsSolved = 0;
        timeRemaining = 60;
        timeBar.style.width = '100%';
        timeBar.style.background = 'linear-gradient(90deg, #56b4ff, #f9d06a)';
        mathAnswerInput.value = '';
        mathAnswerInput.disabled = false;
        questStatus.textContent = `Abgeschlossen: ${questionsSolved} / ${requiredQuestions}`;
        questStatus.className = '';
        timeRemainingLabel.textContent = `T-${timeRemaining}s`;

        const generatedStardate = (4828.9 + Math.random() * 60).toFixed(1);
        stardateDisplay.textContent = `STARDATE ${generatedStardate}`;

        generateQuestion();

        clearInterval(timerInterval);
        timerInterval = setInterval(updateTimer, 1000);

        cancelAnimationFrame(animationFrameId);
        drawWaves();

        setTimeout(() => mathAnswerInput.focus(), 100);
    }

    function generateQuestion() {
        // Small multiplication table (2 to 10 for both numbers)
        const num1 = Math.floor(Math.random() * 9) + 2;
        const num2 = Math.floor(Math.random() * 9) + 2;
        currentAnswer = num1 * num2;
        mathProblemText.textContent = `${num1} × ${num2}`;
    }

    function updateTimer() {
        timeRemaining--;
        const percentage = (timeRemaining / 60) * 100;
        timeBar.style.width = `${percentage}%`;
        timeRemainingLabel.textContent = `T-${Math.max(timeRemaining, 0)}s`;

        if (timeRemaining <= 15) {
            timeBar.style.background = '#ff8a5f';
        }

        if (timeRemaining <= 0) {
            clearInterval(timerInterval);
            cancelAnimationFrame(animationFrameId);
            endMinigame(false);
        }
    }

    function drawWaves() {
        wavePhase += 0.04;

        waveCtx.clearRect(0, 0, waveCanvas.width, waveCanvas.height);

        const centerY = waveCanvas.height / 2;
        const amplitude = 40;
        const frequency = 0.03;

        // Sync level from 0 to 1 based on completions
        const syncLevel = questionsSolved / requiredQuestions;

        const isCompleted = syncLevel >= 1;
        const targetColor = isCompleted ? '#79f6ad' : 'rgba(109, 191, 255, 0.75)';
        const currentColor = isCompleted ? '#79f6ad' : 'rgba(255, 150, 95, 0.75)';

        // As sync level increases, the phase offset between the two waves shrinks to 0.
        // E.g. 0 solved -> pi offset. 5 solved -> 0 offset.
        const phaseOffset = (1 - syncLevel) * Math.PI;

        waveCtx.lineWidth = 4;
        waveCtx.lineCap = 'round';
        waveCtx.lineJoin = 'round';

        // Draw Target Wave
        waveCtx.beginPath();
        waveCtx.moveTo(0, centerY);
        for (let x = 0; x <= waveCanvas.width; x += 5) {
            const y = centerY + Math.sin(x * frequency + wavePhase) * amplitude;
            waveCtx.lineTo(x, y);
        }
        waveCtx.strokeStyle = targetColor;
        // Small glow for target wave
        waveCtx.shadowBlur = 20;
        waveCtx.shadowColor = targetColor;
        waveCtx.stroke();

        // Draw Current Wave (only draw second wave if not perfectly synced, to avoid artifacting, though perfect overlay is fine too)
        if (!isCompleted) {
            waveCtx.beginPath();
            waveCtx.moveTo(0, centerY);
            for (let x = 0; x <= waveCanvas.width; x += 5) {
                const y = centerY + Math.sin(x * frequency + wavePhase + phaseOffset) * amplitude;
                waveCtx.lineTo(x, y);
            }
            waveCtx.strokeStyle = currentColor;
            // Small glow for current wave
            waveCtx.shadowBlur = 20;
            waveCtx.shadowColor = currentColor;
            waveCtx.stroke();
        }

        // Reset shadow for text overlays if any (though we are drawing strictly to waveCanvas)
        waveCtx.shadowBlur = 0;

        animationFrameId = requestAnimationFrame(drawWaves);
    }

    mathAnswerInput.addEventListener('input', (e) => {
        const value = parseInt(e.target.value, 10);
        if (value === currentAnswer) {
            questionsSolved++;
            questStatus.textContent = `Abgeschlossen: ${questionsSolved} / ${requiredQuestions}`;
            mathAnswerInput.value = '';

            if (questionsSolved >= requiredQuestions) {
                clearInterval(timerInterval);
                endMinigame(true);
            } else {
                generateQuestion();
            }
        }
    });

    function endMinigame(success) {
        mathAnswerInput.disabled = true;
        if (success) {
            mathProblemText.textContent = "SYNCHRONISIERT";
            questStatus.textContent = "Scanner erfolgreich kalibriert! Initialisiere Tracking...";
            questStatus.classList.add('success-text');
            setTimeout(() => {
                minigameOverlay.classList.add('hidden');
                cancelAnimationFrame(animationFrameId);

                // Trigger time-skip transition
                transitionOverlay.classList.add('flash');

                setTimeout(() => {
                    // Change background and remove hitbox at the peak of the black screen
                    backgroundImage.src = 'background.jpg';
                    spaceshipHitbox.style.display = 'none';
                    infoBox.classList.add('hidden');

                    // Fade out transition overlay
                    transitionOverlay.classList.remove('flash');
                }, 4000); // Wait 4 seconds for the story text to be read

            }, 2000); // Small wait before kicking off transition
        } else {
            mathProblemText.textContent = "FEHLGESCHLAGEN";
            questStatus.textContent = "Zeit abgelaufen. System wird neu gestartet...";
            questStatus.classList.add('fail-text');
            setTimeout(() => {
                startMinigame(); // Automatically restart
            }, 3000);
        }
    }
});
