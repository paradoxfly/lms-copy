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
        const username = formData.get('username');
        const password = formData.get('password');
  
        // Reset error messages
        document.querySelectorAll('.error-message').forEach(error => {
          error.style.display = 'none';
        });
  
        // Show loading state
        submitButton.disabled = true;
        submitButton.classList.add('loading');
  
        try {
          const response = await fetch('/auth/admin-login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              username,
              password
            }),
            redirect: 'follow'
          });
  
          // If the response redirects, follow it
          if (response.redirected) {
            window.location.href = response.url;
            return;
          }
  
          // Handle non-redirect responses (errors)
          const data = await response.json();
          
          if (!response.ok) {
            const errorMessage = data.error || 'Invalid username or password';
            const usernameInput = document.getElementById('username');
            const errorSpan = usernameInput.nextElementSibling;
            errorSpan.textContent = errorMessage;
            errorSpan.style.display = 'block';
          }
        } catch (error) {
          console.error('Error:', error);
          const usernameInput = document.getElementById('username');
          const errorSpan = usernameInput.nextElementSibling;
          errorSpan.textContent = 'An error occurred. Please try again.';
          errorSpan.style.display = 'block';
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
      if (message.includes('password')) return 'password';
      return 'username'; // Default to username field
    }
  
    const closePopupButton = document.getElementById("close-popup-login");
    if (closePopupButton) {
      closePopupButton.addEventListener("click", function () {
        document.getElementById("success-popup-login").style.display = "none";
      });
    }
  });
  