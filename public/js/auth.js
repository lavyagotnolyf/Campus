document.addEventListener('DOMContentLoaded', () => {
    // --- Get Element References ---
    const formContainer = document.getElementById('form-container');
    const formTitle = document.getElementById('form-title');
    const authForm = document.getElementById('auth-form');
    const signupFields = document.getElementById('signup-fields');
    const confirmPasswordField = document.getElementById('confirm-password-field');
    const submitButton = document.getElementById('submit-button');
    const togglePrompt = document.getElementById('toggle-prompt');
    const toggleButton = document.getElementById('toggle-button');

    // Input fields
    const firstNameInput = document.getElementById('firstName');
    const lastNameInput = document.getElementById('lastName');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');

    // Error message paragraphs
    const errorGeneral = document.getElementById('error-general');
    const errorUsername = document.getElementById('error-username');
    const errorPassword = document.getElementById('error-password');
    const errorConfirmPassword = document.getElementById('error-confirmPassword');

    // --- State Variables ---
    let isSignUp = false; // Start in Sign In mode
    let loading = false;

    let formData = {
        firstName: '',
        lastName: '',
        username: '',
        password: '',
        confirmPassword: ''
    };

    // --- Initial UI Setup ---
    function updateUIForMode() {
        if (isSignUp) {
            formTitle.textContent = 'Sign Up';
            signupFields.classList.remove('hidden');
            confirmPasswordField.classList.remove('hidden');
            submitButton.textContent = 'Sign Up';
            togglePrompt.textContent = 'Already have an account?';
            toggleButton.textContent = 'Sign In';
            submitButton.disabled = false;
        } else {
            formTitle.textContent = 'Sign In';
            signupFields.classList.add('hidden');
            confirmPasswordField.classList.add('hidden');
            submitButton.textContent = 'Sign In';
            togglePrompt.textContent = "Don't have an account?";
            toggleButton.textContent = 'Sign Up';
            submitButton.disabled = false;
        }
        clearErrors();
        clearForm();
        formData = { firstName: '', lastName: '', username: '', password: '', confirmPassword: '' };
    }

    updateUIForMode(); // Set initial state (Sign In)

    // --- Event Handlers ---

    // Handle input changes to update formData
    authForm.addEventListener('input', (e) => {
        if (e.target.name) {
            formData[e.target.name] = e.target.value;
        }
    });

    // Handle form submission
    authForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // Prevent default page reload

        if (!validateForm()) {
            return; // Stop submission if validation fails
        }

        submitButton.disabled = true; // Disable button during submission
        loading = true;
        clearErrors();

        const endpoint = isSignUp ? 'http://localhost:5000/auth/signup' : 'http://localhost:5000/auth/login';
        const method = 'POST';

        try {
            const response = await fetch(endpoint, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                // Successful sign-up or sign-in
                console.log('Success:', data);
                if (isSignUp) {
                    showError(errorGeneral, 'Sign up successful! You can now sign in.');
                    // Optionally, automatically switch to the sign-in form
                    setTimeout(() => {
                        isSignUp = false;
                        updateUIForMode();
                    }, 1500);
                } else {
                    // --- >>> CHANGE: Redirect to index.html on successful login <<< ---
                    window.location.href = 'index.html';
                }
            } else {
                // Error during sign-up or sign-in
                console.error('Error:', data);
                if (data.errors) {
                    // Handle specific errors from the backend
                    if (data.errors.username) {
                        showError(errorUsername, data.errors.username);
                    }
                    if (data.errors.password) {
                        showError(errorPassword, data.errors.password);
                    }
                    if (data.errors.confirmPassword) {
                        showError(errorConfirmPassword, data.errors.confirmPassword);
                    }
                    if (data.errors.general) {
                        showError(errorGeneral, data.errors.general);
                    }
                } else if (data.message) {
                    showError(errorGeneral, data.message);
                } else {
                    showError(errorGeneral, 'An unexpected error occurred.');
                }
            }
        } catch (error) {
            console.error('Fetch error:', error);
            showError(errorGeneral, 'Failed to connect to the server.');
        } finally {
            submitButton.disabled = false; // Re-enable button
            loading = false;
        }
    }); // End of submit handler

    // Handle toggle button click
    toggleButton.addEventListener('click', () => {
        isSignUp = !isSignUp; // Flip the mode
        updateUIForMode();
    });

    // --- Helper Functions ---

    function validateForm() {
        clearErrors();
        let isValid = true;

        // Username Check
        if (!formData.username) {
            showError(errorUsername, 'Please enter a username.');
            isValid = false;
        }

        // Password Length
        if (formData.password.length < 8) {
            showError(errorPassword, 'Password must be at least 8 characters long.');
            isValid = false;
        }

        // Sign Up Specific Validations
        if (isSignUp) {
            if (!formData.firstName) {
                 showError(errorGeneral, 'First name is required.');
                isValid = false;
            }
             if (!formData.lastName) {
                 showError(errorGeneral, 'Last name is required.');
                isValid = false;
            }
             if (!formData.username) {
                showError(errorUsername, 'Please enter a username.');
                isValid = false;
            }
            if (formData.password !== formData.confirmPassword) {
                showError(errorConfirmPassword, 'Passwords do not match.');
                isValid = false;
            }
        }

        return isValid;
    }

    function showError(element, message) {
        if (element) {
            element.textContent = message;
        }
    }

    function clearErrors() {
        errorGeneral.textContent = '';
        errorUsername.textContent = '';
        errorPassword.textContent = '';
        errorConfirmPassword.textContent = '';
    }

     function clearForm() {
        authForm.reset(); // Resets form fields to default values
    }

}); // End DOMContentLoaded