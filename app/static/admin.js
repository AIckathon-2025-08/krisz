document.addEventListener('DOMContentLoaded', () => {
    const setupForm = document.getElementById('setup-form');
    const revealForm = document.getElementById('reveal-form');
    const setupStatusMessage = document.getElementById('setup-status-message');
    const revealStatusMessage = document.getElementById('reveal-status-message');

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

    setupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(setupForm);
        const response = await fetch('/api/admin/setup', {
            method: 'POST',
            body: formData,
        });
        const data = await response.json();

        if (data.success) {
            setupStatusMessage.textContent = 'New game started successfully!';
            setupStatusMessage.style.color = '#2ecc71';
            // Form is not cleared to retain the statements for the reveal dropdown
            revealStatusMessage.textContent = ''; // Clear other message
            // Update the reveal form dropdown with the new statements
            const statements = [
                formData.get('statement-1'),
                formData.get('statement-2'),
                formData.get('statement-3')
            ];
            const lieSelect = document.getElementById('lie-select');
            lieSelect.innerHTML = '<option value="">-- Choose the lie --</option>';
            statements.forEach((statement, index) => {
                const option = document.createElement('option');
                option.value = index + 1;
                option.textContent = statement;
                lieSelect.appendChild(option);
            });

        } else {
            setupStatusMessage.textContent = data.message || 'Failed to start new game.';
            setupStatusMessage.style.color = '#e74c3c';
        }
    });

    revealForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const lieId = document.getElementById('lie-select').value;

        const response = await fetch('/api/admin/reveal', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ lie_id: parseInt(lieId) }),
        });
        const data = await response.json();

        if (data.success) {
            revealStatusMessage.textContent = 'Lie has been revealed to all players!';
            revealStatusMessage.style.color = '#2ecc71';
        } else {
            revealStatusMessage.textContent = data.message || 'Failed to reveal lie.';
            revealStatusMessage.style.color = '#e74c3c';
        }
        setupStatusMessage.textContent = ''; // Clear other message
    });
});
