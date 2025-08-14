document.addEventListener('DOMContentLoaded', () => {
    const waitingContainer = document.getElementById('waiting-container');
    const voteContainer = document.getElementById('vote-container');
    const resultContainer = document.getElementById('result-container');
    const playerName = document.getElementById('player-name');
    const playerImage = document.getElementById('player-image');
    const voteForm = document.getElementById('vote-form');
    const resultsList = document.getElementById('results-list');
    const voteStatusMessage = document.getElementById('vote-status-message'); // New element for status message
    let userVote = null;
    let lieId = null;

    fetchGameData();

    async function fetchGameData() {
        const response = await fetch('/api/game');
        const data = await response.json();

        if (data.player_name) {
            waitingContainer.style.display = 'none';
            voteContainer.style.display = 'block';
            playerName.textContent = data.player_name;
            if (data.player_image_url && data.player_image_url !== 'None') {
                playerImage.src = data.player_image_url;
                playerImage.classList.remove('profile-image-placeholder');
                playerImage.alt = "Player's picture";
            } else {
                playerImage.src = '';
                playerImage.classList.add('profile-image-placeholder');
                playerImage.alt = "Player's picture";
            }
            data.statements.forEach((statement, index) => {
                const label = document.getElementById(`label${index + 1}`);
                label.textContent = statement;
            });
            if (data.lie_revealed) {
                voteContainer.style.display = 'none';
                resultContainer.style.display = 'block';
                fetchResults();
            }
        } else {
            waitingContainer.style.display = 'block';
            voteContainer.style.display = 'none';
        }
    }

    voteForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const selectedLie = document.querySelector('input[name="lie_choice"]:checked');
        if (!selectedLie) {
            // No pop-up, just a simple message on the page.
            if (voteStatusMessage) {
                voteStatusMessage.textContent = 'Please select a statement.';
            }
            return;
        }

        userVote = selectedLie.value;
        const response = await fetch('/api/vote', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'guest', vote_id: parseInt(userVote) })
        });
        const data = await response.json();

        if (data.success) {
            // Display success message and hide the form
            voteStatusMessage.textContent = 'Your vote has been submitted';
            voteStatusMessage.style.color = '#2ecc71'; // Green color for success
            voteForm.style.display = 'none';
        } else {
            // Display error message
            voteStatusMessage.textContent = 'Failed to submit vote.';
            voteStatusMessage.style.color = '#e74c3c'; // Red color for error
        }
    });

    async function fetchResults() {
        const response = await fetch('/api/results');
        const data = await response.json();

        resultsList.innerHTML = '';
        for (const [voteId, count] of Object.entries(data.results)) {
            const statementText = document.getElementById(`label${voteId}`).textContent;
            const li = document.createElement('li');
            li.textContent = `Statement ${voteId}: "${statementText}"`;
            if (data.lie_id && parseInt(voteId) === data.lie_id) {
                li.classList.add('correct-statement');
            }
            const voteCountSpan = document.createElement('span');
            voteCountSpan.textContent = `${count} votes`;
            li.appendChild(voteCountSpan);
            resultsList.appendChild(li);
        }
    }

    setInterval(fetchGameData, 5000);
});
