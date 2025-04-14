document.addEventListener('DOMContentLoaded', () => {
    // --- State Variables ---
    let visitors = [];
    let isLoading = false;
    let nextVisitorId = 1; // Simple ID generation

    // --- Mock API ---
    const mockVisitors = [
        { id: nextVisitorId++, name: "Vidyut Jamwal", purpose: "Meeting with Prof.Nitin", contactInfo: "vidyut@email.com", checkIn: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), checkOut: null, status: 'active', hostName: '' },
        { id: nextVisitorId++, name: "Abhiuday Patil", purpose: "Campus Tour", contactInfo: "555-1234", checkIn: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), checkOut: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(), status: 'completed', hostName: '' },
        { id: nextVisitorId++, name: "Devdutt", purpose: "Library Research", contactInfo: "dev@email.com", checkIn: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), checkOut: null, status: 'active', hostName: '' },
        { id: nextVisitorId++, name: "Inder Singh", purpose: "Unauthorized Access Attempt", contactInfo: "N/A", checkIn: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), checkOut: null, status: 'blacklisted', hostName: '' },
    ];
    visitors = [...mockVisitors]; // Initialize state

    const VisitorAPI = {
        getAll: () => {
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve([...visitors]); // Return a copy
                }, 500); // Simulate network delay
            });
        },
        addVisitor: (newVisitorData) => {
            return new Promise((resolve) => {
                setTimeout(() => {
                    const visitorWithId = {
                        ...newVisitorData,
                        id: nextVisitorId++,
                        checkIn: new Date().toISOString(),
                        status: 'active',
                        checkOut: null
                    };
                    visitors.push(visitorWithId);
                    resolve(visitorWithId);
                }, 300); // Simulate network delay
            });
        },
        // Add updateVisitor, deleteVisitor etc. as needed
    };

    // --- DOM Elements ---
    const addVisitorBtn = document.getElementById('addVisitorBtn');
    const addVisitorDialog = document.getElementById('addVisitorDialog');
    const closeDialogBtn = document.getElementById('closeDialogBtn');
    const visitorForm = document.getElementById('visitorForm');
    const captureFaceBtn = document.getElementById('captureFaceBtn');
    const skipCaptureBtn = document.getElementById('skipCaptureBtn');
    const completeCaptureBtn = document.getElementById('completeCaptureBtn');
    const dialogFormContent = document.getElementById('dialogFormContent');
    const dialogFaceCaptureContent = document.getElementById('dialogFaceCaptureContent');

    const activeVisitorsCountEl = document.getElementById('activeVisitorsCount');
    const todayCheckinsCountEl = document.getElementById('todayCheckinsCount');
    const blacklistedCountEl = document.getElementById('blacklistedCount');

    const visitorTable = document.getElementById('visitorTable');
    const visitorTableBody = document.getElementById('visitorTableBody');
    const visitorTableLoader = document.getElementById('visitorTableLoader');

    // --- Utility Functions ---
    const formatDate = (date) => {
        if (!date) return "-";
        try {
             // Format: Jan 1, 2024, 10:30 AM
             return new Intl.DateTimeFormat('en-US', {
                year: 'numeric', month: 'short', day: 'numeric',
                hour: 'numeric', minute: '2-digit', hour12: true
            }).format(new Date(date));
        } catch (e) {
            return "-";
        }
    };

    const getStatusBadge = (status) => {
        status = status.toLowerCase();
        let badgeClass = 'badge-secondary'; // Default
        if (status === 'active') badgeClass = 'badge-green';
        else if (status === 'completed') badgeClass = 'badge-outline';
        else if (status === 'blacklisted') badgeClass = 'badge-destructive';

        return `<span class="badge ${badgeClass}">${status.charAt(0).toUpperCase() + status.slice(1)}</span>`;
    };

    const showLoader = (el) => {
        el.innerHTML = '<span class="loader"></span>';
    };

    const hideLoader = (el, defaultValue = '0') => {
        el.textContent = defaultValue;
    }

    // --- Rendering Functions ---
    const renderVisitorTable = (visitorData) => {
        visitorTableBody.innerHTML = ''; // Clear existing rows
        if (!visitorData || visitorData.length === 0) {
            visitorTableBody.innerHTML = `<tr><td colspan="6" class="text-center muted">No visitors found</td></tr>`;
            return;
        }

        visitorData
            .sort((a, b) => new Date(b.checkIn) - new Date(a.checkIn)) // Sort by check-in, newest first
            .forEach(visitor => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${visitor.id}</td>
                    <td>${visitor.name || '-'}</td>
                    <td>${visitor.purpose || '-'}</td>
                    <td>${formatDate(visitor.checkIn)}</td>
                    <td>${formatDate(visitor.checkOut)}</td>
                    <td>${getStatusBadge(visitor.status)}</td>
                `;
                visitorTableBody.appendChild(row);
            });
    };

    const updateStats = (visitorData) => {
        if (!visitorData) return;

        const activeVisitors = visitorData.filter(v => v.status === 'active').length;
        const today = new Date().toDateString();
        const todayCheckins = visitorData.filter(v => new Date(v.checkIn).toDateString() === today).length;
        const blacklisted = visitorData.filter(v => v.status === 'blacklisted').length;

        hideLoader(activeVisitorsCountEl, activeVisitors);
        hideLoader(todayCheckinsCountEl, todayCheckins);
        hideLoader(blacklistedCountEl, blacklisted);
    };

    const fetchAndRenderData = async () => {
        // Show loading states
        isLoading = true;
        showLoader(activeVisitorsCountEl);
        showLoader(todayCheckinsCountEl);
        showLoader(blacklistedCountEl);
        visitorTableLoader.classList.remove('hidden');
        visitorTable.classList.add('hidden');

        try {
            const data = await VisitorAPI.getAll();
            visitors = data; // Update local state
            renderVisitorTable(visitors);
            updateStats(visitors);
        } catch (error) {
            console.error("Error fetching visitors:", error);
            visitorTableBody.innerHTML = `<tr><td colspan="6" class="text-center muted">Error loading data</td></tr>`;
             // Reset counts on error
            hideLoader(activeVisitorsCountEl, 'Error');
            hideLoader(todayCheckinsCountEl, 'Error');
            hideLoader(blacklistedCountEl, 'Error');
        } finally {
            isLoading = false;
            // Hide loading states
            visitorTableLoader.classList.add('hidden');
            visitorTable.classList.remove('hidden');
        }
    };

    // --- Dialog Logic ---
    const openDialog = () => {
        addVisitorDialog.classList.remove('hidden');
        // Reset to form view when opening
        dialogFormContent.classList.remove('hidden');
        dialogFaceCaptureContent.classList.add('hidden');
        visitorForm.reset(); // Clear form fields
        clearFormErrors();
    };

    const closeDialog = () => {
        addVisitorDialog.classList.add('hidden');
    };

    // --- Form Validation ---
    const validateField = (field) => {
        const errorEl = field.parentElement.querySelector('.error-message');
        let message = '';
        if (field.required && !field.value.trim()) {
            message = 'This field is required.';
        } else if (field.minLength > 0 && field.value.trim().length < field.minLength) {
            message = `Must be at least ${field.minLength} characters.`;
        }
        errorEl.textContent = message;
        return !message; // Return true if valid
    };

     const validateForm = () => {
        let isValid = true;
        isValid &= validateField(visitorForm.elements.name);
        isValid &= validateField(visitorForm.elements.purpose);
        isValid &= validateField(visitorForm.elements.contactInfo);
        // hostName is optional, no validation needed unless specific rules apply
        return isValid;
    };

     const clearFormErrors = () => {
        visitorForm.querySelectorAll('.error-message').forEach(el => el.textContent = '');
    };


    // --- Event Listeners ---
    addVisitorBtn.addEventListener('click', openDialog);
    closeDialogBtn.addEventListener('click', closeDialog);
    addVisitorDialog.addEventListener('click', (e) => { // Close on overlay click
        if (e.target === addVisitorDialog) {
            closeDialog();
        }
    });

    visitorForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearFormErrors();

        if (!validateForm()) {
            console.log("Form validation failed");
            return; // Stop submission if validation fails
        }

        const formData = new FormData(visitorForm);
        const newVisitorData = {
            name: formData.get('name'),
            purpose: formData.get('purpose'),
            contactInfo: formData.get('contactInfo'),
            hostName: formData.get('hostName') || null, // Handle optional field
            // checkIn, status, etc., handled by API mock
        };

        // Simulate adding visitor
        const submitButton = visitorForm.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.innerHTML = '<span class="loader"></span> Registering...';


        try {
            await VisitorAPI.addVisitor(newVisitorData);
            alert('Visitor Added Successfully!'); // Simple feedback
            closeDialog();
            fetchAndRenderData(); // Refresh the list
        } catch (error) {
            console.error("Error adding visitor:", error);
            alert('Error adding visitor. Please try again.'); // Simple error feedback
        } finally {
             submitButton.disabled = false;
             submitButton.textContent = 'Register Visitor';
        }
    });

    // Add listeners for input fields to potentially clear errors on input
    visitorForm.elements.name.addEventListener('input', (e) => validateField(e.target));
    visitorForm.elements.purpose.addEventListener('input', (e) => validateField(e.target));
    visitorForm.elements.contactInfo.addEventListener('input', (e) => validateField(e.target));


    captureFaceBtn.addEventListener('click', () => {
        dialogFormContent.classList.add('hidden');
        dialogFaceCaptureContent.classList.remove('hidden');
    });

    skipCaptureBtn.addEventListener('click', () => {
        dialogFaceCaptureContent.classList.add('hidden');
        dialogFormContent.classList.remove('hidden');
         // Here you might set a flag or data attribute indicating face capture was skipped
         console.log("Face capture skipped");
    });

     completeCaptureBtn.addEventListener('click', () => {
        dialogFaceCaptureContent.classList.add('hidden');
        dialogFormContent.classList.remove('hidden');
         // Here you would typically store the captured face data (simulated)
         console.log("Face capture 'completed'");
         alert("Face 'captured' (simulation)");
    });


    // --- Initial Load ---
    fetchAndRenderData();
});