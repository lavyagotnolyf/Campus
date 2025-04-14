document.addEventListener('DOMContentLoaded', () => {
    // --- State Variables ---
    let vehicles = [];
    let isLoading = false;
    let nextVehicleId = 101; // Start ID higher

    // --- Mock API ---
    const mockVehicles = [
        { id: nextVehicleId++, licensePlate: "MH14AB1234", make: "Toyota", model: "Corolla", color: "Silver", owner: "Alice Johnson", type: 'student', entryTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), status: 'inside' },
        { id: nextVehicleId++, licensePlate: "KA05XY5678", make: "Honda", model: "Civic", color: "Black", owner: "Prof. Smith", type: 'staff', entryTime: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), status: 'inside' },
        { id: nextVehicleId++, licensePlate: "DL01ZQ9900", make: "Maruti", model: "Swift", color: "Red", owner: "Bob Williams", type: 'visitor', entryTime: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(), status: 'departed' },
         { id: nextVehicleId++, licensePlate: "MH12CD4567", make: "Ford", model: "Ecosport", color: "Blue", owner: "", type: 'unknown', entryTime: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), status: 'inside' },
        { id: nextVehicleId++, licensePlate: "TN07EF8910", make: "Hyundai", model: "Creta", color: "White", owner: "Security Alert", type: 'unknown', entryTime: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(), status: 'flagged' },
    ];
    vehicles = [...mockVehicles]; // Initialize state

    const VehicleAPI = {
        getAll: () => {
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve([...vehicles]); // Return a copy
                }, 600); // Simulate network delay
            });
        },
        addVehicle: (newVehicleData) => {
            return new Promise((resolve) => {
                setTimeout(() => {
                    const vehicleWithId = {
                        ...newVehicleData,
                        id: nextVehicleId++,
                        entryTime: new Date().toISOString(),
                        status: 'inside', // Default status for new entries
                    };
                    vehicles.push(vehicleWithId);
                    console.log("Added vehicle:", vehicleWithId);
                    console.log("Current vehicles:", vehicles);
                    resolve(vehicleWithId);
                }, 400); // Simulate network delay
            });
        },
        // Add updateVehicle, flagVehicle etc. as needed
    };

    // --- DOM Elements ---
    const addVehicleBtn = document.getElementById('addVehicleBtn');
    const addVehicleDialog = document.getElementById('addVehicleDialog');
    const closeDialogBtn = document.getElementById('closeDialogBtn');
    const cancelDialogBtn = document.getElementById('cancelDialogBtn'); // Added
    const vehicleForm = document.getElementById('vehicleForm');

    const vehiclesInsideCountEl = document.getElementById('vehiclesInsideCount');
    const todayEntriesCountEl = document.getElementById('todayEntriesCount');
    const flaggedVehiclesCountEl = document.getElementById('flaggedVehiclesCount');

    const vehicleTable = document.getElementById('vehicleTable');
    const vehicleTableBody = document.getElementById('vehicleTableBody');
    const vehicleTableLoader = document.getElementById('vehicleTableLoader');

    // --- Utility Functions ---
    const formatDate = (date) => {
        if (!date) return "-";
        try {
             return new Intl.DateTimeFormat('en-IN', { // Use locale for format consistency if desired
                year: 'numeric', month: 'short', day: 'numeric',
                hour: 'numeric', minute: '2-digit', hour12: true
            }).format(new Date(date));
        } catch (e) {
            console.error("Date formatting error:", e);
            return "-";
        }
    };

    const getStatusBadge = (status) => {
        status = status?.toLowerCase();
        let badgeClass = 'badge-secondary'; // Default (use gray/outline style)
        if (status === 'inside') badgeClass = 'badge-green';
        else if (status === 'departed') badgeClass = 'badge-outline';
        else if (status === 'flagged') badgeClass = 'badge-destructive';
        // Capitalize first letter for display
        const displayText = status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown';
        return `<span class="badge ${badgeClass}">${displayText}</span>`;
    };

    const getTypeBadge = (type) => {
        type = type?.toLowerCase();
        let badgeClass = 'badge-gray'; // Default (unknown)
        if (type === 'student') badgeClass = 'badge-blue';
        else if (type === 'staff') badgeClass = 'badge-purple';
        else if (type === 'visitor') badgeClass = 'badge-orange';
        // Capitalize first letter for display
        const displayText = type ? type.charAt(0).toUpperCase() + type.slice(1) : 'Unknown';
        return `<span class="badge ${badgeClass}">${displayText}</span>`;
    };


    const showLoader = (el) => {
        if(el) el.innerHTML = '<span class="loader"></span>';
    };

    const hideLoader = (el, defaultValue = '0') => {
       if(el) el.textContent = defaultValue;
    }

    // --- Rendering Functions ---
    const renderVehicleTable = (vehicleData) => {
        if (!vehicleTableBody) return;
        vehicleTableBody.innerHTML = ''; // Clear existing rows

        if (!vehicleData || vehicleData.length === 0) {
            vehicleTableBody.innerHTML = `<tr><td colspan="6" class="text-center muted">No vehicles found</td></tr>`;
            return;
        }

        vehicleData
            .sort((a, b) => new Date(b.entryTime) - new Date(a.entryTime)) // Sort by entry time, newest first
            .forEach(vehicle => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${vehicle.licensePlate || '-'}</td>
                    <td>${vehicle.make || ''} ${vehicle.model || ''}</td>
                    <td>${vehicle.color || '-'}</td>
                    <td>${getTypeBadge(vehicle.type)}</td>
                    <td>${formatDate(vehicle.entryTime)}</td>
                    <td>${getStatusBadge(vehicle.status)}</td>
                `;
                vehicleTableBody.appendChild(row);
            });
    };

    const updateStats = (vehicleData) => {
        if (!vehicleData) return;

        const inside = vehicleData.filter(v => v.status === 'inside').length;
        const today = new Date().toDateString();
        const todayEntries = vehicleData.filter(v => v.entryTime && new Date(v.entryTime).toDateString() === today).length;
        const flagged = vehicleData.filter(v => v.status === 'flagged').length;

        hideLoader(vehiclesInsideCountEl, inside);
        hideLoader(todayEntriesCountEl, todayEntries);
        hideLoader(flaggedVehiclesCountEl, flagged);
    };

    const fetchAndRenderData = async () => {
        // Show loading states
        isLoading = true;
        showLoader(vehiclesInsideCountEl);
        showLoader(todayEntriesCountEl);
        showLoader(flaggedVehiclesCountEl);
        if (vehicleTableLoader) vehicleTableLoader.classList.remove('hidden');
        if (vehicleTable) vehicleTable.classList.add('hidden');

        try {
            const data = await VehicleAPI.getAll();
            vehicles = data; // Update local state
            renderVehicleTable(vehicles);
            updateStats(vehicles);
        } catch (error) {
            console.error("Error fetching vehicles:", error);
           if (vehicleTableBody) vehicleTableBody.innerHTML = `<tr><td colspan="6" class="text-center muted">Error loading data</td></tr>`;
            // Reset counts on error
            hideLoader(vehiclesInsideCountEl, 'Error');
            hideLoader(todayEntriesCountEl, 'Error');
            hideLoader(flaggedVehiclesCountEl, 'Error');
        } finally {
            isLoading = false;
            // Hide loading states
            if (vehicleTableLoader) vehicleTableLoader.classList.add('hidden');
            if (vehicleTable) vehicleTable.classList.remove('hidden');
        }
    };

    // --- Dialog Logic ---
    const openDialog = () => {
        if (addVehicleDialog) addVehicleDialog.classList.remove('hidden');
        if (vehicleForm) vehicleForm.reset(); // Clear form fields
        clearFormErrors();
    };

    const closeDialog = () => {
        if (addVehicleDialog) addVehicleDialog.classList.add('hidden');
    };

    // --- Form Validation ---
     const validateField = (field) => {
        const errorEl = field.parentElement.querySelector('.error-message');
        if (!errorEl) return true; // No place to show error

        let message = '';
        const value = field.value.trim();

        if (field.required && !value) {
            message = 'This field is required.';
        } else if (field.minLength > 0 && value.length < field.minLength) {
            message = `Must be at least ${field.minLength} characters.`;
        } else if (field.id === 'vehicleType' && field.value === '') {
             // Basic check for select if required
             message = 'Please select a type.';
        }
        // Add more specific validation if needed (e.g., license plate format)

        errorEl.textContent = message;
        return !message; // Return true if valid
    };

     const validateForm = () => {
        let isValid = true;
        // Use specific IDs for reliable selection
        isValid &= validateField(document.getElementById('vehicleLicensePlate'));
        isValid &= validateField(document.getElementById('vehicleMake'));
        isValid &= validateField(document.getElementById('vehicleModel'));
        isValid &= validateField(document.getElementById('vehicleColor'));
        isValid &= validateField(document.getElementById('vehicleType'));
        // Owner is optional
        return isValid;
    };

     const clearFormErrors = () => {
       if(vehicleForm) {
            vehicleForm.querySelectorAll('.error-message').forEach(el => el.textContent = '');
       }
    };

    // --- Event Listeners ---
    if (addVehicleBtn) addVehicleBtn.addEventListener('click', openDialog);
    if (closeDialogBtn) closeDialogBtn.addEventListener('click', closeDialog);
    if (cancelDialogBtn) cancelDialogBtn.addEventListener('click', closeDialog); // Added listener for cancel

    if (addVehicleDialog) {
        addVehicleDialog.addEventListener('click', (e) => { // Close on overlay click
            if (e.target === addVehicleDialog) {
                closeDialog();
            }
        });
    }

    if (vehicleForm) {
        vehicleForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            clearFormErrors();

            if (!validateForm()) {
                console.log("Vehicle form validation failed");
                return; // Stop submission if validation fails
            }

            const formData = new FormData(vehicleForm);
            const newVehicleData = {
                licensePlate: formData.get('licensePlate'),
                make: formData.get('make'),
                model: formData.get('model'),
                color: formData.get('color'),
                type: formData.get('type'),
                owner: formData.get('owner') || null, // Handle optional field
                // entryTime, status handled by API mock
            };

            const submitButton = vehicleForm.querySelector('button[type="submit"]');
            if(submitButton) {
                submitButton.disabled = true;
                submitButton.innerHTML = '<span class="loader"></span> Registering...';
            }

            try {
                await VehicleAPI.addVehicle(newVehicleData);
                alert('Vehicle Added Successfully!'); // Simple feedback
                closeDialog();
                fetchAndRenderData(); // Refresh the list
            } catch (error) {
                console.error("Error adding vehicle:", error);
                alert('Error adding vehicle. Please try again.'); // Simple error feedback
            } finally {
                if(submitButton) {
                    submitButton.disabled = false;
                    submitButton.innerHTML = 'Register Vehicle';
                }
            }
        });

        // Add listeners for input fields to potentially clear errors on input
        const fieldsToValidate = ['vehicleLicensePlate', 'vehicleMake', 'vehicleModel', 'vehicleColor', 'vehicleType'];
        fieldsToValidate.forEach(id => {
            const field = document.getElementById(id);
            if (field) {
                field.addEventListener('input', (e) => validateField(e.target));
                if (field.tagName === 'SELECT') {
                     field.addEventListener('change', (e) => validateField(e.target));
                }
            }
        });
    }


    // --- Initial Load ---
    fetchAndRenderData();
});