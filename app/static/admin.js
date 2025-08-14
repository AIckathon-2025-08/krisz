document.addEventListener('DOMContentLoaded', () => {
    const setupForm = document.getElementById('setup-form');
    const revealForm = document.getElementById('reveal-form');
    const statusMessage = document.getElementById('status-message');
    const fileInput = document.getElementById('admin-image');
    const fileNameSpan = document.getElementById('file-name');

    setupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(setupForm);

        const response = await fetch('/api/admin/setup', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();
        if (data.success) {
            statusMessage.textContent = 'New game started successfully!';
            statusMessage.style.color = 'green';
            
            // Update reveal form options with the submitted statements
            const statement1 = document.getElementById('statement-1').value;
            const statement2 = document.getElementById('statement-2').value;
            const statement3 = document.getElementById('statement-3').value;
            
            const option1 = document.querySelector('#lie-select option[value="1"]');
            const option2 = document.querySelector('#lie-select option[value="2"]');
            const option3 = document.querySelector('#lie-select option[value="3"]');
            
            option1.textContent = statement1;
            option2.textContent = statement2;
            option3.textContent = statement3;
        } else {
            statusMessage.textContent = 'Failed to start new game: ' + data.message;
            statusMessage.style.color = 'red';
        }
    });

    revealForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const lieId = document.getElementById('lie-select').value;

        if (!lieId) {
            statusMessage.textContent = 'Please choose the lie.';
            statusMessage.style.color = 'red';
            return;
        }

        const response = await fetch('/api/admin/reveal', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ lie_id: parseInt(lieId) })
        });

        const data = await response.json();
        if (data.success) {
            statusMessage.textContent = 'Lie has been revealed to all players!';
            statusMessage.style.color = 'green';
        } else {
            statusMessage.textContent = 'Failed to reveal lie.';
            statusMessage.style.color = 'red';
        }
    });

    fileInput.addEventListener('change', () => {
        if (fileInput.files.length > 0) {
            fileNameSpan.textContent = fileInput.files[0].name;
            fileNameSpan.classList.remove('placeholder-text');
        } else {
            fileNameSpan.textContent = 'Player\'s picture';
            fileNameSpan.classList.add('placeholder-text');
        }
    });
});
