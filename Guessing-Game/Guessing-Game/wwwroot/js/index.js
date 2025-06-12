const apiBase = 'api/game';

const playerNameInput = document.getElementById('playerName');
const secretWordInput = document.getElementById('secretWord');
const joinGameIdInput = document.getElementById('joinGameId');
const messageDiv = document.getElementById('message');

function showMessage(msg, isError = true) {
    messageDiv.style.color = isError ? 'red' : 'green';
    messageDiv.textContent = msg;
}

document.getElementById('btnCreate').onclick = async () => {
    const name = playerNameInput.value.trim();
    const secret = secretWordInput.value.trim();

    if (!name || !secret) {
        showMessage('Please enter your name and secret word to create a game.');
        return;
    }

    showMessage('');

    try {
        const res = await fetch(`${apiBase}/create-and-join`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ PlayerName: name, SecretWord: secret }),
        });

        if (!res.ok) {
            const err = await res.json();
            showMessage(err.title || 'Failed to create game.');
            return;
        }

        const data = await res.json();

        // Redirect to game page with gameId and playerId in URL params
        window.location.href = `game.html?gameId=${data.gameId}&playerId=${data.playerId}&playerName=${encodeURIComponent(name)}`;
    } catch (err) {
        showMessage('Error: ' + err.message);
    }
};

document.getElementById('btnJoin').onclick = async () => {
    const name = playerNameInput.value.trim();
    const gameId = joinGameIdInput.value.trim();
    const secret = secretWordInput.value.trim();

    if (!name || !gameId || !secret) {
        showMessage('Please enter your name and party code to join a game.');
        return;
    }

    showMessage('');

    try {
        const res = await fetch(`${apiBase}/join`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ PlayerName: name, gameId: gameId, SecretWord: secret }),
        });

        if (!res.ok) {
            const err = await res.json();
            showMessage(err.title || 'Failed to join game.');
            return;
        }

        const data = await res.json();

        // Redirect to game page with gameId and playerId in URL params
        window.location.href = `game.html?gameId=${data.gameId}&playerId=${data.playerId}&playerName=${encodeURIComponent(name)}`;
    } catch (err) {
        showMessage('Error: ' + err.message);
    }
};