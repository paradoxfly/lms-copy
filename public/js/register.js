console.log('register.js loaded');

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded');
    
    const signupForm = document.getElementById('signup-form');
    const errorContainer = document.getElementById('error-container');
    const usernameInput = document.getElementById('username');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirm-password');
    const firstnameInput = document.getElementById('first_name');
    const lastnameInput = document.getElementById('last_name');

    console.log('Form elements:', {
        form: !!signupForm,
        errorContainer: !!errorContainer,
        username: !!usernameInput,
        email: !!emailInput,
        password: !!passwordInput,
        confirmPassword: !!confirmPasswordInput,
        firstname: !!firstnameInput,
        lastname: !!lastnameInput
    });

    // Function to find error message element
    function findErrorMessage(input) {
        // First try to find error message in the form group
        const formGroup = input.closest('.form-group');
        if (formGroup) {
            return formGroup.querySelector('.error-message');
        }
        return null;
    }

    // Function to show error for an input
    function showInputError(input, message) {
        const formGroup = input.closest('.form-group');
        if (formGroup) {
            formGroup.classList.add('error');
            const errorMessage = findErrorMessage(input);
            if (errorMessage) {
                errorMessage.textContent = message;
                errorMessage.style.display = 'block';
            }
        }
    }

    // Function to clear error for an input
    function clearInputError(input) {
        const formGroup = input.closest('.form-group');
        if (formGroup) {
            formGroup.classList.remove('error');
            const errorMessage = findErrorMessage(input);
            if (errorMessage) {
                errorMessage.style.display = 'none';
            }
        }
    }

    // Function to validate password match
    function validatePasswordMatch() {
        console.log('Validating password match');
        if (passwordInput.value && confirmPasswordInput.value && passwordInput.value !== confirmPasswordInput.value) {
            console.log('Passwords do not match');
            showInputError(confirmPasswordInput, 'Passwords do not match');
            return false;
        }
        return true;
    }

    // Function to validate required fields
    function validateRequiredFields() {
        console.log('Validating required fields');
        let isValid = true;
        const requiredFields = [
            { input: firstnameInput, name: 'First Name', message: 'Please enter your first name' },
            { input: lastnameInput, name: 'Last Name', message: 'Please enter your last name' },
            { input: usernameInput, name: 'Username', message: 'Please choose a username' },
            { input: emailInput, name: 'Email', message: 'Please enter your email address' },
            { input: passwordInput, name: 'Password', message: 'Please create a password' },
            { input: confirmPasswordInput, name: 'Confirm Password', message: 'Please confirm your password' }
        ];

        requiredFields.forEach(field => {
            if (!field.input.value.trim()) {
                console.log(`${field.name} is empty`);
                showInputError(field.input, field.message);
                isValid = false;
            }
        });

        return isValid;
    }

    // Add input event listeners to clear error states
    [firstnameInput, lastnameInput, usernameInput, emailInput, passwordInput, confirmPasswordInput].forEach(input => {
        if (input) {
            input.addEventListener('input', () => {
                console.log(`${input.id} input changed`);
                clearInputError(input);
                
                // Only validate password match if both password fields have values
                if ((input === passwordInput || input === confirmPasswordInput) &&
                    passwordInput.value && confirmPasswordInput.value) {
                    validatePasswordMatch();
                }
            });
        }
    });

    if (signupForm) {
        console.log('Adding form submit listener');
        signupForm.addEventListener('submit', async function(e) {
            console.log('Form submitted');
            e.preventDefault();
            
            // Clear previous errors
            errorContainer.innerHTML = '';
            [firstnameInput, lastnameInput, usernameInput, emailInput, passwordInput, confirmPasswordInput].forEach(input => {
                if (input) {
                    clearInputError(input);
                }
            });

            // Validate required fields
            if (!validateRequiredFields()) {
                console.log('Required fields validation failed');
                return;
            }

            // Validate password match
            if (!validatePasswordMatch()) {
                console.log('Password match validation failed');
                return;
            }

            const formData = new FormData(signupForm);
            const data = Object.fromEntries(formData.entries());

            // Remove confirm-password from data before sending
            delete data['confirm-password'];

            try {
                console.log('Sending registration request');
                const response = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });

                const result = await response.json();
                console.log('Registration response:', result);

                if (!response.ok) {
                    // Handle specific error cases
                    if (result.field === 'username') {
                        showInputError(usernameInput, 'Username already exists. Please choose a different username.');
                    } else if (result.field === 'email') {
                        showInputError(emailInput, 'Email already exists. Please use a different email address.');
                    } else if (result.details) {
                        // Handle validation errors
                        result.details.forEach(error => {
                            const input = document.getElementById(error.field);
                            if (input) {
                                showInputError(input, error.message);
                            }
                        });
                    } else {
                        const errorDiv = document.createElement('div');
                        errorDiv.className = 'error-message';
                        errorDiv.textContent = result.error || 'Registration failed. Please try again.';
                        errorContainer.appendChild(errorDiv);
                    }
                    return;
                }

                // Show success popup
                const successPopup = document.getElementById('success-popup');
                if (successPopup) {
                    successPopup.style.display = 'block';
                }

            } catch (error) {
                console.error('Error:', error);
                const errorDiv = document.createElement('div');
                errorDiv.className = 'error-message';
                errorDiv.textContent = 'An unexpected error occurred. Please try again.';
                errorContainer.appendChild(errorDiv);
            }
        });
    }

    // Handle success popup close button
    const closePopupBtn = document.getElementById('close-popup');
    if (closePopupBtn) {
        closePopupBtn.addEventListener('click', () => {
            const successPopup = document.getElementById('success-popup');
            if (successPopup) {
                successPopup.style.display = 'none';
            }
        });
    }
}); 