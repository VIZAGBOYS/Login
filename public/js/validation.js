document.addEventListener("DOMContentLoaded", function () {
  const email = document.getElementById('email');
  const password = document.getElementById('password');
  const emailError = document.getElementById('emailError');
  const passwordError = document.getElementById('passwordError');
  const userNotFoundError = document.getElementById('userNotFoundError');

  // Listen to the password input field to prevent entering password without email
  password.addEventListener('focus', function (event) {
    // If email field is empty, prevent entering password
    if (!email.value.trim()) {
      passwordError.classList.remove('d-none'); // Show the message to enter email first
      event.preventDefault();
      email.focus(); // Focus back on the email field
    } else {
      passwordError.classList.add('d-none'); // Hide the error if email is entered
    }
  });

  // Listen for form submission to handle validation
  document.getElementById('loginForm').addEventListener('submit', function (event) {
    event.preventDefault(); // Prevent form submission for validation

    // Reset errors
    emailError.classList.add('d-none');
    passwordError.classList.add('d-none');
    userNotFoundError.classList.add('d-none');

    // Check if the email is empty first
    if (!email.value.trim()) {
      emailError.classList.remove('d-none');
      email.focus();
      return;
    }

    // Check if the email format is valid (any domain)
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailPattern.test(email.value.trim())) {
      emailError.classList.remove('d-none');
      email.focus();
      return;
    }

    // Check if password is empty
    if (!password.value.trim()) {
      passwordError.classList.remove('d-none');
      password.focus();
      return;
    }

    // Mock AJAX call to check user existence
    const userExists = false;  // Simulating a non-existing user
    if (!userExists) {
      userNotFoundError.classList.remove('d-none');
      return;
    }

    // If validation passes, submit the form
    this.submit();
  });
});
