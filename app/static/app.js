document.addEventListener('DOMContentLoaded', () => {
    const loginContainer = document.getElementById('login-container');
    const voteContainer = document.getElementById('vote-container');
    const resultContainer = document.getElementById('result-container');
    const usernameInput = document.getElementById('username-input');
    const loginBtn = document.getElementById('login-btn');
    const candidateName = document.getElementById('candidate-name');
    const candidateImage = document.getElementById('candidate-image');
    const voteForm = document.getElementById('vote-form');
    const resultsList = document.getElementById('results-list');
    const correctAnswerSection = document.getElementById('correct-answer');
    const lieTextSpan = document.getElementById('lie-text');
    const yourResultSpan = document.getElementById('your-result');

    let username = null;
    let userVote = null;
    let lieId = null;

    // Bejelentkezés eseménykezelő
    loginBtn.addEventListener('click', () => {
        username = usernameInput.value.trim();
        if (username) {
            loginContainer.style.display = 'none';
            voteContainer.style.display = 'block';
            fetchGameData();
        } else {
            alert('Please enter a username.');
        }
    });

    // Játék adatainak lekérése
    async function fetchGameData() {
        const response = await fetch('/api/game');
        const data = await response.json();

        candidateName.textContent = data.candidate_name;
        candidateImage.src = data.candidate_image_url;

        data.statements.forEach((statement, index) => {
            const label = document.getElementById(`label${index + 1}`);
            label.textContent = statement;
        });

        if (data.lie_revealed) {
            // Ha már felfedték a hazugságot, ne lehessen szavazni, és mutassuk az eredményt
            voteContainer.style.display = 'none';
            resultContainer.style.display = 'block';
            fetchResults();
        }
    }

    // Szavazat leadása
    voteForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const selectedLie = document.querySelector('input[name="lie_choice"]:checked');
        if (!selectedLie) {
            alert('Please select a statement.');
            return;
        }

        userVote = selectedLie.value;

        const response = await fetch('/api/vote', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: username, vote_id: parseInt(userVote) })
        });
        const data = await response.json();

        if (data.success) {
            alert('Your vote has been submitted!');
            voteForm.style.display = 'none'; // Rejtsd el a szavazás űrlapot a szavazás után
        } else {
            alert('Failed to submit vote.');
        }
    });

    // Eredmények frissítése
    async function fetchResults() {
        const response = await fetch('/api/results');
        const data = await response.json();

        resultsList.innerHTML = ''; // Töröljük a korábbi eredményeket

        // Szavazatok száma
        for (const [voteId, count] of Object.entries(data.results)) {
            const statementText = document.getElementById(`label${voteId}`).textContent;
            const li = document.createElement('li');
            li.textContent = `Statement ${voteId} ("${statementText}"): ${count} votes`;
            resultsList.appendChild(li);
        }

        // A helyes válasz és a felhasználó eredményének megjelenítése
        if (data.lie_id) {
            correctAnswerSection.style.display = 'block';
            lieTextSpan.textContent = document.getElementById(`label${data.lie_id}`).textContent;

            if (userVote) {
                if (parseInt(userVote) === data.lie_id) {
                    yourResultSpan.textContent = 'You chose the correct answer! 🎉';
                    yourResultSpan.classList.add('correct');
                    yourResultSpan.classList.remove('incorrect');
                } else {
                    yourResultSpan.textContent = 'You chose the wrong answer. 😞';
                    yourResultSpan.classList.add('incorrect');
                    yourResultSpan.classList.remove('correct');
                }
            }
        }
    }

    // Eredmények frissítése 5 másodpercenként
    setInterval(fetchResults, 5000);
});
