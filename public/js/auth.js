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

    // Input fields (Changed email to username)
    const firstNameInput = document.getElementById('firstName');
    const lastNameInput = document.getElementById('lastName');
    const usernameInput = document.getElementById('username'); // Uses username
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');

    // Error message paragraphs (Changed errorEmail to errorUsername)
    const errorGeneral = document.getElementById('error-general');
    const errorUsername = document.getElementById('error-username'); // Uses username error element
    const errorPassword = document.getElementById('error-password');
    const errorConfirmPassword = document.getElementById('error-confirmPassword');

    // --- State Variables ---
    let isSignUp = false; // Start in Sign In mode
    // let loading = false; // Loading state less relevant for instant hardcoded check

    let formData = {
        firstName: '',
        lastName: '',
        username: '', // Uses username
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
            submitButton.disabled = false; // Ensure button is enabled in sign-up mode initially
        } else {
            formTitle.textContent = 'Sign In';
            signupFields.classList.add('hidden');
            confirmPasswordField.classList.add('hidden');
            submitButton.textContent = 'Sign In';
            togglePrompt.textContent = "Don't have an account?";
            toggleButton.textContent = 'Sign Up';
            submitButton.disabled = false; // Ensure button is enabled
        }
        clearErrors();
        clearForm();
        formData = { firstName: '', lastName: '', username: '', password: '', confirmPassword: '' }; // Reset with username
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
    authForm.addEventListener('submit', (e) => { // Removed 'async' as fetch is removed
        e.preventDefault(); // Prevent default page reload

        if (!validateForm()) {
            return; // Stop submission if validation fails
        }

        // --- Hardcoded Logic ---
        if (isSignUp) {
            // Handle Sign Up attempt (Temporary: Show message)
            showError(errorGeneral, 'Sign up is temporarily disabled.');
            console.log('Sign up attempt blocked (hardcoded).');

        } else {
            // Handle Sign In attempt (Temporary: Hardcoded check)
            if (formData.username === 'guard' && formData.password === 'password123') {
                // Login successful
                clearErrors();
                console.log('Hardcoded login successful!');

                // --- >>> CHANGE: Redirect to student-auth.html <<< ---
                window.location.href = 'student-auth.html';

            } else {
                // Login failed
                showError(errorGeneral, 'Invalid username or password.');
                console.log('Hardcoded login failed!');
            }
        }
        // --- End of Hardcoded Logic ---

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

        // Username Check (Changed from Email)
        if (!formData.username) { // Check if username is empty
            showError(errorUsername, 'Please enter a username.'); // Use errorUsername
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
             if (!formData.username) { // Also check username on signup
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
        errorUsername.textContent = ''; // Uses username error element
        errorPassword.textContent = '';
        errorConfirmPassword.textContent = '';
    }

     function clearForm() {
        authForm.reset(); // Resets form fields to default values
    }

}); // End DOMContentLoaded