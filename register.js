// Handle Registration Form Submission
document.getElementById('registerForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const username = document.getElementById('registerUsername').value;
    const password = document.getElementById('registerPassword').value;

    const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
    });

    const data = await response.json();
    const messageDiv = document.getElementById('registerMessage');

    if (data.message) {
        messageDiv.textContent = 'Registration successful! Redirecting to login...';
        messageDiv.style.color = 'green';
        document.getElementById('registerForm').reset();
        
        // Redirect to login page after 2 seconds
        setTimeout(() => {
            window.location.href = 'home.html';
        }, 2000);
    } else {
        messageDiv.textContent = 'Registration failed: ' + data.error;
        messageDiv.style.color = 'red';
    }
});
