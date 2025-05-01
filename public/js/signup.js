// Password toggle functionality
document.querySelectorAll('.toggle-password').forEach(button => {
    button.addEventListener('click', function() {
        const input = this.parentElement.querySelector('input');
        const icon = this.querySelector('i');
        
        if (input.type === 'password') {
            input.type = 'text';
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        } else {
            input.type = 'password';
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        }
    });
});

// Form submission
document.getElementById('signup-form').addEventListener('submit', async (event) => {
    event.preventDefault();

    const form = event.target;
    const submitButton = form.querySelector('button[type="submit"]');
    const formData = new FormData(form);

    // Get form values
    const first_name = formData.get('first_name');
    const last_name = formData.get('last_name');
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
    
    if (!first_name) {
        showError('first_name', 'First name is required');
        hasError = true;
    } else if (!/^[a-zA-Z]+$/.test(first_name)) {
        showError('first_name', 'First name can only contain letters');
        hasError = true;
    }

    if (!last_name) {
        showError('last_name', 'Last name is required');
        hasError = true;
    } else if (!/^[a-zA-Z]+$/.test(last_name)) {
        showError('last_name', 'Last name can only contain letters');
        hasError = true;
    }

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
                first_name,
                last_name,
                username,
                email,
                password
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
            if (result.errors) {
                // Handle validation errors
                result.errors.forEach(error => {
                    showError(error.path, error.message);
                });
            } else {
                const errorField = result.field || 'form';
                const errorMessage = result.error || 'Registration failed. Please try again.';
                showError(errorField, errorMessage);
            }
        }
    } catch (error) {
        console.error('Error:', error);
        showError('form', 'An error occurred. Please try again.');
    } finally {
        // Reset button state
        submitButton.classList.remove('loading');
        submitButton.disabled = false;
    }
});

// Helper function to show errors
function showError(fieldId, message) {
    const field = document.getElementById(fieldId);
    if (field) {
        field.classList.add('error');
        const errorElement = field.parentElement.querySelector('.error-message');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }
    }
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Close the success popup
document.getElementById('close-popup').addEventListener('click', () => {
  document.getElementById('success-popup').style.display = 'none';
});