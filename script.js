document.getElementById('emailForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const email = document.getElementById('emailInput').value;
    const responseMessage = document.getElementById('responseMessage');

    try {
        const response = await fetch('/api/save-email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email }),
        });

        if (response.ok) {
            responseMessage.textContent = 'Bedankt! Uw e-mailadres is opgeslagen.';
            responseMessage.style.color = 'green';
        } else {
            throw new Error('Er is iets misgegaan.');
        }
    } catch (error) {
        responseMessage.textContent = 'Fout bij het opslaan van uw e-mailadres. Probeer opnieuw.';
        responseMessage.style.color = 'red';
    }

    document.getElementById('emailInput').value = '';
});
