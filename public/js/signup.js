// Password toggle functionality
document.querySelectorAll('.toggle-password').forEach(button => {
    button.addEventListener('click', function() {
        const input = this.previousElementSibling;
        const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
        input.setAttribute('type', type);
        
        // Toggle eye icon
        const icon = this.querySelector('i');
        icon.classList.toggle('fa-eye');
        icon.classList.toggle('fa-eye-slash');
    });
});

// Form submission
document.getElementById('signup-form').addEventListener('submit', async (event) => {
    event.preventDefault();

    const form = event.target;
    const submitButton = form.querySelector('button[type="submit"]');
    const formData = new FormData(form);

    // Get form values
    const username = formData.get('username');
    const email = formData.get('email');
    const password = formData.get('password');
    const confirmPassword = formData.get('confirm-password');

    // Reset error states
    document.querySelectorAll('.error-message').forEach(error => {
        error.style.display = 'none';
    });
    document.querySelectorAll('.form-group input').forEach(input => {
        input.classList.remove('error');
    });

    // Validation
    let hasError = false;
    
    if (!username) {
        showError('username', 'Username is required');
        hasError = true;
    }

    if (!email) {
        showError('email', 'Email is required');
        hasError = true;
    } else if (!isValidEmail(email)) {
        showError('email', 'Please enter a valid email address');
        hasError = true;
    }

    if (!password) {
        showError('password', 'Password is required');
        hasError = true;
    } else if (password.length < 8) {
        showError('password', 'Password must be at least 8 characters');
        hasError = true;
    }

    if (!confirmPassword) {
        showError('confirm-password', 'Please confirm your password');
        hasError = true;
    } else if (password !== confirmPassword) {
        showError('confirm-password', 'Passwords do not match');
        hasError = true;
    }

    if (hasError) return;

    // Show loading state
    submitButton.classList.add('loading');
    submitButton.disabled = true;

    try {
        const response = await fetch('/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username,
                email,
                password,
            }),
        });

        const result = await response.json();

        if (response.ok) {
            // Show success popup with animation
            const popup = document.getElementById('success-popup');
            popup.style.display = 'flex';
            
            // Add event listeners to popup buttons
            document.getElementById('close-popup').addEventListener('click', () => {
                popup.style.display = 'none';
                window.location.href = '/login';
            });

            // Auto-redirect after 3 seconds
            setTimeout(() => {
                window.location.href = '/login';
            }, 3000);
        } else {
            const errorMessage = result.error || result.errors?.[0]?.msg || 'Registration failed. Please try again.';
            showError(determineErrorField(errorMessage), errorMessage);
        }
    } catch (error) {
        console.error('Error:', error);
        showError('username', 'An error occurred. Please try again.');
    } finally {
        // Reset button state
        submitButton.classList.remove('loading');
        submitButton.disabled = false;
    }
});

// Helper functions
function showError(fieldId, message) {
    const input = document.getElementById(fieldId);
    const errorSpan = input.parentElement.querySelector('.error-message');
    input.classList.add('error');
    errorSpan.textContent = message;
    errorSpan.style.display = 'block';
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function determineErrorField(errorMessage) {
    const message = errorMessage.toLowerCase();
    if (message.includes('username')) return 'username';
    if (message.includes('email')) return 'email';
    if (message.includes('password')) return 'password';
    return 'username'; // Default to username field
}

// Close the success popup
document.getElementById('close-popup').addEventListener('click', () => {
  document.getElementById('success-popup').style.display = 'none';
});