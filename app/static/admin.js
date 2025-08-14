document.addEventListener('DOMContentLoaded', () => {
    const setupForm = document.getElementById('setup-form');
    const revealForm = document.getElementById('reveal-form');
    const statusMessage = document.getElementById('status-message');

    // Játék beállítása
    setupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('admin-name').value;
        const imageUrl = document.getElementById('admin-image-url').value;
        const statements = [
            document.getElementById('statement-1').value,
            document.getElementById('statement-2').value,
            document.getElementById('statement-3').value
        ];

        const response = await fetch('/api/admin/setup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, image_url: imageUrl, statements })
        });

        const data = await response.json();
        if (data.success) {
            statusMessage.textContent = 'New game started successfully!';
            statusMessage.style.color = 'green';
        } else {
            statusMessage.textContent = 'Failed to start new game.';
            statusMessage.style.color = 'red';
        }
    });

    // Hazugság felfedése
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
});
