document.addEventListener('DOMContentLoaded', () => {
    const waitingContainer = document.getElementById('waiting-container');
    const voteContainer = document.getElementById('vote-container');
    const resultContainer = document.getElementById('result-container');
    const finalResultsContainer = document.getElementById('final-results-container');
    const playerName = document.getElementById('player-name');
    const playerImage = document.getElementById('player-image');
    const voteForm = document.getElementById('vote-form');
    const resultsList = document.getElementById('results-list');
    const finalResultsList = document.getElementById('final-results-list');
    const voteStatusMessage = document.getElementById('vote-status-message');

    // Check local storage for a submitted vote
    let hasVoted = localStorage.getItem('hasVoted') === 'true';

    fetchGameData();

    // Check game state every 2 seconds
    setInterval(() => {
        fetchGameData();
        fetchResults();
    }, 2000);

    async function fetchGameData() {
        const response = await fetch('/api/game');
        const data = await response.json();

        if (data.player_name) {
            waitingContainer.style.display = 'none';
            playerName.textContent = data.player_name;
            playerImage.src = data.player_image_url || '';
            playerImage.alt = "Player's picture";

            if (data.player_image_url && data.player_image_url !== 'None') {
                playerImage.src = data.player_image_url;
                playerImage.classList.remove('profile-image-placeholder');
            } else {
                playerImage.src = '';
                playerImage.classList.add('profile-image-placeholder');
            }

            data.statements.forEach((statement, index) => {
                const label = document.getElementById(`label${index + 1}`);
                label.textContent = statement;
            });

            if (data.lie_revealed) {
                voteContainer.style.display = 'none';
                resultContainer.style.display = 'none';
                finalResultsContainer.style.display = 'block';
                fetchResults();
            } else {
                if (hasVoted) {
                    voteContainer.style.display = 'none';
                    resultContainer.style.display = 'block';
                } else {
                    voteContainer.style.display = 'block';
                    resultContainer.style.display = 'none';
                }
                finalResultsContainer.style.display = 'none';
            }
        } else {
            waitingContainer.style.display = 'block';
            voteContainer.style.display = 'none';
            resultContainer.style.display = 'none';
            finalResultsContainer.style.display = 'none';
            hasVoted = false; // Reset vote status for a new game
            localStorage.removeItem('hasVoted');
        }
    }

    voteForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const selectedLie = document.querySelector('input[name="lie_choice"]:checked');
        if (!selectedLie) {
            if (voteStatusMessage) {
                voteStatusMessage.textContent = 'Please select a statement.';
            }
            return;
        }

        const voteId = Date.now().toString(36) + Math.random().toString(36).substr(2);

        const response = await fetch('/api/vote', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: voteId, vote_id: parseInt(selectedLie.value) })
        });
        const data = await response.json();

        if (data.success) {
            voteStatusMessage.textContent = 'Your vote has been saved.';
            voteStatusMessage.style.color = '#2ecc71';

            // Set vote status to true in local storage
            localStorage.setItem('hasVoted', 'true');
            hasVoted = true;

            setTimeout(() => {
                voteContainer.style.display = 'none';
                resultContainer.style.display = 'block';
            }, 2000);
        } else {
            voteStatusMessage.textContent = 'Failed to submit vote.';
            voteStatusMessage.style.color = '#e74c3c';
        }
    });

    async function fetchResults() {
        const response = await fetch('/api/results');
        const data = await response.json();
        const totalVotes = Object.values(data.results).reduce((a, b) => a + b, 0);
        const lieId = data.lie_id;

        const targetList = lieId ? finalResultsList : resultsList;
        targetList.innerHTML = '';

        for (const [voteId, count] of Object.entries(data.results)) {
            const statementText = document.getElementById(`label${voteId}`).textContent;
            const percentage = totalVotes > 0 ? ((count / totalVotes) * 100).toFixed(0) : 0;
            const li = document.createElement('li');

            const statementDiv = document.createElement('div');
            statementDiv.textContent = `${statementText}`;

            const voteBarContainer = document.createElement('div');
            voteBarContainer.classList.add('vote-bar-container');

            const voteBar = document.createElement('div');
            voteBar.classList.add('vote-bar');
            voteBar.style.width = `${percentage}%`;

            const barText = document.createElement('div');
            barText.classList.add('vote-bar-text');
            barText.textContent = `${percentage}% (${count} votes)`;

            voteBarContainer.appendChild(voteBar);
            voteBarContainer.appendChild(barText);

            li.appendChild(statementDiv);
            li.appendChild(voteBarContainer);

            if (lieId && parseInt(voteId) === lieId) {
                li.classList.add('lie-statement');
            }

            targetList.appendChild(li);
        }
    }

    // New code to handle the file input label
    const fileInput = document.getElementById('admin-image');
    const fileNameSpan = document.getElementById('file-name');

    if (fileInput) {
        fileInput.addEventListener('change', () => {
            if (fileInput.files.length > 0) {
                fileNameSpan.textContent = fileInput.files[0].name;
                fileNameSpan.classList.remove('placeholder-text');
            } else {
                fileNameSpan.textContent = 'Player\'s picture';
                fileNameSpan.classList.add('placeholder-text');
            }
        });
    }
});
