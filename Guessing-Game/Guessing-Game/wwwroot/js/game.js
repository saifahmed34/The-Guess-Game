document.addEventListener('DOMContentLoaded', () => {
    // Configuration
    const API_BASE = 'api/game';
    const POLL_INTERVAL = 2000; 

    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const gameId = urlParams.get('gameId');
    const playerId = urlParams.get('playerId');
    const playerName = urlParams.get('playerName') || 'Player';

    // Validate required parameters
    if (!gameId || !playerId) {
        alert('Missing game ID or player ID. Please join the game properly.');
        window.location.href = 'index.html';
        return;
    }

    // DOM elements
    const partyCodeEl = document.getElementById('partyCode');
    const statusEl = document.getElementById('status');
    const chatBox = document.getElementById('chatBox');
    const questionInput = document.getElementById('inputQuestion');
    const answerInput = document.getElementById('inputAnswer');
    const guessInput = document.getElementById('inputGuess');
    const askBtn = document.getElementById('askBtn');
    const answerBtn = document.getElementById('answerBtn');
    const guessBtn = document.getElementById('guessBtn');
    const errorMsg = document.getElementById('errorMsg');

    // State
    let gameOver = false;
    let waitingForAnswer = false;
    let currentQuestion = null;
    let processedTurns = new Set();

    // Initialize UI
    partyCodeEl.textContent = gameId;
    addSystemMessage(`Welcome, ${playerName}! Game code: ${gameId}`);

    // Helper functions
    function addMessage(text, type = 'system', playerName = '') {
        const messageEl = document.createElement('div');
        messageEl.className = `message ${type}-message`;

        const timestamp = new Date().toLocaleTimeString();

        if (playerName && (type === 'player' || type === 'opponent')) {
            messageEl.textContent = `[${timestamp}] ${playerName}: ${text}`;
        } else if (type === 'question') {
            messageEl.textContent = `[${timestamp}] ${text}`;
        } else if (type === 'answer') {
            messageEl.textContent = `[${timestamp}] ${text}`;
        } else if (type === 'guess') {
            messageEl.textContent = `[${timestamp}] ${text}`;
        } else {
            messageEl.textContent = `[${timestamp}] ${text}`;
        }

        chatBox.appendChild(messageEl);
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    function addSystemMessage(text) {
        addMessage(text, 'system');
    }

    function updateStatus(text) {
        statusEl.textContent = text;
    }

    // function showAnswerInput(show = true) {
    //     answerInput.style.display = show ? 'block' : 'none';
    //     answerBtn.style.display = show ? 'block' : 'none';
    //     waitingForAnswer = show;

    //     if (show) {
    //         answerInput.focus();
    //     }
    // }

    async function handleApiError(response) {
        try {
            const error = await response.json();
            return error.message || error.title || 'An error occurred';
        } catch {
            return await response.text() || 'An error occurred';
        }
    }

    // Polling function - Get game state and show all turns to both players
    async function pollUpdates() {
        if (gameOver) return;

        try {
            const response = await fetch(`${API_BASE}/${gameId}`);

            if (!response.ok) {
                const error = await handleApiError(response);
                addSystemMessage(`Error: ${error}`);
                return;
            }

            const gameData = await response.json();

            // Process ALL turns and show new ones to both players
            if (gameData.turns && gameData.turns.length > 0) {
                // Sort turns by creation time or ID to maintain order
                const sortedTurns = gameData.turns.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));

                sortedTurns.forEach(turn => {
                    // Skip if we've already processed this turn
                    if (processedTurns.has(turn.id)) {
                        return;
                    }

                    // Mark as processed
                    processedTurns.add(turn.id);

                    // Get player names
                    const askerName = gameData.players.find(p => p.id === turn.askingPlayerId)?.name || 'Player';
                    const answererName = turn.answeringPlayerId ?
                        gameData.players.find(p => p.id === turn.answeringPlayerId)?.name || 'Player' : null;

                    if (turn.question === "(guess)") {
                        // This is a guess - show to both players
                        addMessage(`🎯 ${askerName} guessed: ${turn.guess}`, 'guess');

                        if (turn.isGuessCorrect) {
                            addSystemMessage(`🎉 Correct! ${askerName} wins!`);
                            gameOver = true;
                            updateStatus('Game Over!');
                        } else {
                            addSystemMessage(`❌ Wrong guess by ${askerName}. Game continues...`);
                        }
                    } else {
                        // This is a question - show to both players
                        addMessage(`❓ ${askerName} asked: ${turn.question}`, 'question');

                        if (turn.isAnswered && turn.answer) {
                            // Show the answer to both players
                            addMessage(`💬 ${answererName} answered: ${turn.answer}`, 'answer');
                            showAnswerInput(false);
                            updateStatus('Continue asking questions or make a guess!');
                        } else {
                            // Question is unanswered
                            if (turn.askingPlayerId !== playerId) {
                                // This player needs to answer
                                showAnswerInput(true);
                                updateStatus('Your turn to answer the question!');
                                currentQuestion = turn;
                            } else {
                                // This player asked the question, waiting for answer
                                updateStatus('Waiting for answer...');
                            }
                        }
                    }
                });
            }

            // Check if game is completed
            if (gameData.isCompleted && !gameOver) {
                gameOver = true;
                const winner = gameData.players.find(p => p.id === gameData.winnerPlayerId);
                updateStatus(`🎉 ${winner?.name || 'Someone'} won!`);
                addSystemMessage(`Game Over! ${winner?.name || 'Someone'} guessed correctly!`);
            }

        } catch (error) {
            console.error('Polling error:', error);
            addSystemMessage('Connection error - trying again...');
        }

        // Schedule next poll if game is still active
        if (!gameOver) {
            setTimeout(pollUpdates, POLL_INTERVAL);
        }
    }

    // Start polling
    pollUpdates();

    // Ask question
    async function askQuestion() {
        const question = questionInput.value.trim();

        if (!question) {
            errorMsg.textContent = 'Please enter a question';
            return;
        }

        if (waitingForAnswer) {
            errorMsg.textContent = 'Please answer the current question first';
            return;
        }

        errorMsg.textContent = '';

        try {
            const requestBody = {
                gameId: gameId,
                askingPlayerId: playerId,
                playerName: playerName,
                question: question
            };

            const response = await fetch(`${API_BASE}/question`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Question API Error:', errorText);
                try {
                    const errorJson = JSON.parse(errorText);
                    if (errorJson.errors) {
                        const validationErrors = Object.values(errorJson.errors).flat();
                        errorMsg.textContent = validationErrors.join(', ');
                    } else {
                        errorMsg.textContent = errorJson.title || errorJson.message || 'Failed to send question';
                    }
                } catch {
                    errorMsg.textContent = errorText || 'Failed to send question';
                }
                return;
            }

            questionInput.value = '';
            updateStatus('Question sent! Waiting for answer...');
        } catch (error) {
            errorMsg.textContent = 'Failed to send question';
            console.error('Ask question error:', error);
        }
    }

    // Answer question
    async function answerQuestion() {
        const answer = answerInput.value.trim().toLowerCase();

        if (!answer) {
            errorMsg.textContent = 'Please enter an answer';
            return;
        }

        if (answer !== 'yes' && answer !== 'no') {
            errorMsg.textContent = 'Please answer with "yes" or "no"';
            return;
        }

        if (!currentQuestion || !currentQuestion.id) {
            errorMsg.textContent = 'No question to answer';
            return;
        }

        errorMsg.textContent = '';

        try {
            const requestBody = {
                turnId: currentQuestion.id,
                answeringPlayerId: playerId,
                answer: answer
            };

            const response = await fetch(`${API_BASE}/answer`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Answer API Error:', errorText);
                try {
                    const errorJson = JSON.parse(errorText);
                    if (errorJson.errors) {
                        const validationErrors = Object.values(errorJson.errors).flat();
                        errorMsg.textContent = validationErrors.join(', ');
                    } else {
                        errorMsg.textContent = errorJson.title || errorJson.message || 'Failed to send answer';
                    }
                } catch {
                    errorMsg.textContent = errorText || 'Failed to send answer';
                }
                return;
            }

            answerInput.value = '';
            showAnswerInput(false);
            updateStatus('Answer sent! Continue the game...');
            currentQuestion = null;
        } catch (error) {
            errorMsg.textContent = 'Failed to send answer';
            console.error('Answer error:', error);
        }
    }

    // Make guess
  async function makeGuess() {
    const guess = guessInput.value.trim();

    if (!guess) {
        errorMsg.textContent = 'Please enter a guess';
        return;
    }

    errorMsg.textContent = '';

    try {
        const url = `${API_BASE}/guess?gameId=${gameId}&playerId=${playerId}&guess=${encodeURIComponent(guess)}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            errorMsg.textContent = await handleApiError(response);
            return;
        }

        const data = await response.json();

        if (data.isGuessCorrect || data.gameCompleted) {
            // ✅ Immediate feedback for the guesser
            addMessage(`🎯 ${playerName} guessed: "${guess}" — ✅ Correct!`, 'guess');
            addSystemMessage(`🎉 You guessed it! You win!`);
            updateStatus('Game Over!');
            gameOver = true;
        } else {
            addMessage(`🎯 ${playerName} guessed: "${guess}" — ❌ Wrong`, 'guess');
            addSystemMessage(`Wrong guess. Try again!`);
        }

        guessInput.value = '';
    } catch (error) {
        errorMsg.textContent = 'Failed to submit guess';
        console.error('Guess error:', error);
    }
}


    // Event listeners
    askBtn.addEventListener('click', askQuestion);
    answerBtn.addEventListener('click', answerQuestion);
    guessBtn.addEventListener('click', makeGuess);

    questionInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') askQuestion();
    });

    answerInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') answerQuestion();
    });

    guessInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') makeGuess();
    });

    // Initial status
    updateStatus('Ready to play! Ask questions or make guesses.');
});