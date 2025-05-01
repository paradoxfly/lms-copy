document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.getElementById("login-form");

  console.log(loginForm);

  if (loginForm) {
    loginForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      const form = event.target;
      const submitButton = form.querySelector('button[type="submit"]');
      const formData = new FormData(form);

      // Get form values
      const email = formData.get('email');
      const password = formData.get('password');

      // Reset error messages
      document.querySelectorAll('.error-message').forEach(error => {
        error.style.display = 'none';
      });

      // Reset error states
      document.querySelectorAll('.form-group').forEach(group => {
        group.classList.remove('error');
      });

      // Validate inputs
      let hasError = false;

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

      if (hasError) {
        return;
      }

      // Show loading state
      submitButton.disabled = true;
      submitButton.classList.add('loading');

      try {
        const response = await fetch('/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            password
          }),
          credentials: 'include' // Ensure cookies are sent
        });

        const data = await response.json();
        
        if (response.ok && data.success) {
          // Store user info in localStorage if needed
          if (data.user) {
            localStorage.setItem('user', JSON.stringify(data.user));
          }
          
          // Show success message
          const successPopup = document.getElementById('success-popup');
          if (successPopup) {
            successPopup.style.display = 'flex';
          }
          
          // Redirect after a short delay
          setTimeout(() => {
            window.location.href = data.redirect;
          }, 1000);
        } else {
          const errorMessage = data.error || 'Invalid email or password';
          const errorField = data.field || determineErrorField(errorMessage);
          showError(errorField, errorMessage);
        }
      } catch (error) {
        console.error('Error:', error);
        showError('email', 'An error occurred. Please try again.');
      } finally {
        // Reset button state
        submitButton.disabled = false;
        submitButton.classList.remove('loading');
      }
    });
  }

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

  function showError(fieldId, message) {
    const input = document.getElementById(fieldId);
    if (!input) return;

    const formGroup = input.closest('.form-group');
    if (!formGroup) return;

    formGroup.classList.add('error');
    const errorSpan = formGroup.querySelector('.error-message');
    if (errorSpan) {
      errorSpan.textContent = message;
      errorSpan.style.display = 'block';
    }
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function determineErrorField(errorMessage) {
    const message = errorMessage.toLowerCase();
    if (message.includes('email')) return 'email';
    if (message.includes('password')) return 'password';
    return 'email'; // Default to email field
  }

  const closePopupButton = document.getElementById("close-popup");
  if (closePopupButton) {
    closePopupButton.addEventListener("click", function () {
      const successPopup = document.getElementById("success-popup");
      if (successPopup) {
        successPopup.style.display = "none";
      }
    });
  }
});
