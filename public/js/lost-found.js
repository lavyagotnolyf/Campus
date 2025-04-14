document.addEventListener('DOMContentLoaded', () => {
    // --- State Variables ---
    let lostItems = [];
    let isLoading = false;
    let currentFilter = 'all'; // Initial filter
    let nextItemId = 201; // Start ID higher

    // --- Mock API ---
    const mockItems = [
         { id: nextItemId++, name: "iPhone 14 Pro", description: "Black, slight scratch on corner, transparent case.", location: "Library Cafe Table 3", category: 'electronics', dateFound: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), status: 'unclaimed', image: null },
         { id: nextItemId++, name: "Nike Hoodie", description: "Gray zip-up hoodie, size Medium.", location: "Gym Locker Room", category: 'clothing', dateFound: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), status: 'claimed', image: null },
         { id: nextItemId++, name: "Silver Watch", description: "Analog watch, metal band, Casio brand.", location: "Lecture Hall C Bench", category: 'accessories', dateFound: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), status: 'unclaimed', image: null },
         { id: nextItemId++, name: "Student ID Card", description: "Belongs to Jane Doe, ID# 123456.", location: "Admin Building Counter", category: 'documents', dateFound: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), status: 'pending', image: null },
         { id: nextItemId++, name: "Blue Backpack", description: "Generic blue backpack, contains textbooks.", location: "Bus Stop Shelter", category: 'other', dateFound: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), status: 'unclaimed', image: null },
         { id: nextItemId++, name: "Wireless Earbuds", description: "White charging case, brand unknown.", location: "Cafeteria Floor", category: 'electronics', dateFound: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), status: 'unclaimed', image: null },
    ];
    lostItems = [...mockItems]; // Initialize state

    const LostItemAPI = {
        getAll: () => new Promise(resolve => setTimeout(() => resolve([...lostItems]), 500)),
        addItem: (newItemData) => new Promise(resolve => {
            setTimeout(() => {
                const itemWithId = {
                    ...newItemData,
                    id: nextItemId++,
                    dateFound: new Date().toISOString(),
                    status: 'unclaimed', // Default status
                };
                lostItems.unshift(itemWithId); // Add to beginning
                resolve(itemWithId);
            }, 300);
        }),
        // updateStatus, etc. can be added later
    };

    // --- DOM Elements ---
    const addItemBtn = document.getElementById('addItemBtn');
    const addItemDialog = document.getElementById('addItemDialog');
    const closeDialogBtn = document.getElementById('closeDialogBtn');
    const cancelDialogBtn = document.getElementById('cancelDialogBtn');
    const lostItemForm = document.getElementById('lostItemForm');
    const itemGrid = document.getElementById('itemGrid');
    const itemLoader = document.getElementById('itemLoader');
    const filterButtonsContainer = document.getElementById('filterButtons');
    const itemImageInput = document.getElementById('itemImage');
    const fileNameDisplay = document.getElementById('file-name-display');

    // --- Utility Functions ---
    const formatDate = (date) => {
        if (!date) return "-";
        try {
             return new Intl.DateTimeFormat('en-GB', { // Use locale for format consistency
                year: 'numeric', month: 'short', day: 'numeric'
            }).format(new Date(date));
        } catch (e) { return "-"; }
    };

    const getStatusBadge = (status) => {
        status = status?.toLowerCase();
        let badgeClass = 'badge-secondary';
        let text = status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown';
        if (status === 'unclaimed') badgeClass = 'badge-blue';
        else if (status === 'claimed') badgeClass = 'badge-green';
        else if (status === 'pending') badgeClass = 'badge-amber';
        return `<span class="badge ${badgeClass}">${text}</span>`;
    };

    // Returns HTML string for a Feather icon
    const getCategoryIconHTML = (category) => {
        let iconName = 'package'; // default 'other'
        let colorClass = 'icon-color-gray';
        switch (category?.toLowerCase()) {
            case 'electronics': iconName = 'smartphone'; colorClass = 'icon-color-blue'; break;
            case 'clothing': iconName = 'shopping-bag'; colorClass = 'icon-color-purple'; break; // using shopping-bag
            case 'accessories': iconName = 'watch'; colorClass = 'icon-color-amber'; break;
            case 'documents': iconName = 'file-text'; colorClass = 'icon-color-teal'; break;
        }
         // Use template literal to include data-feather attribute for initialization
         return `<i data-feather="${iconName}" class="category-icon ${colorClass}"></i>`;
    };


    // --- Rendering Functions ---
    const renderItemGrid = () => {
        if (!itemGrid || !lostItems) return;

        // Apply filtering
        const filteredItems = lostItems.filter(item => {
            if (currentFilter === 'all') return true;
            if (currentFilter === 'unclaimed') return item.status === 'unclaimed';
            return item.category === currentFilter; // Filter by category name
        });

        itemGrid.innerHTML = ''; // Clear grid

        if (filteredItems.length === 0) {
            itemGrid.innerHTML = `
                <div class="item-grid-empty-state">
                  <i data-feather="package" class="empty-state-icon"></i>
                  <h3 class="empty-state-title">No items found</h3>
                  <p class="muted">No lost and found items match '${currentFilter}'</p>
                </div>`;
             feather.replace(); // Re-init icons for empty state
            return;
        }

        filteredItems.forEach(item => {
            const card = document.createElement('div');
            card.className = 'card item-card'; // Use existing card class + item-card
            card.dataset.itemId = item.id; // Add data attribute for potential interaction

            const imagePlaceholderHTML = item.image
                ? `<img src="${item.image}" alt="${item.name}" class="w-full h-full object-cover" />`
                : `<div class="flex flex-col items-center justify-center">
                       ${getCategoryIconHTML(item.category)}
                       <p class="text-sm muted mt-2 capitalize">${item.category || 'Other'}</p>
                   </div>`;

            card.innerHTML = `
                <div class="item-image-placeholder">
                    ${imagePlaceholderHTML}
                </div>
                <div class="card-header pb-2">
                    <div class="flex justify-between items-start">
                        <h3 class="card-title">${item.name || 'Unnamed Item'}</h3>
                        ${getStatusBadge(item.status)}
                    </div>
                </div>
                <div class="card-content pb-0">
                    <p class="description-text">${item.description || 'No description provided.'}</p>
                    <div class="space-y-1">
                        <div class="item-details-row">
                           <i data-feather="map-pin" class="icon"></i>
                           <span>${item.location || 'Unknown location'}</span>
                        </div>
                        <div class="item-details-row">
                           <i data-feather="calendar" class="icon"></i>
                           <span>Found on ${formatDate(item.dateFound)}</span>
                        </div>
                    </div>
                </div>
                <div class="card-footer pt-4 pb-4">
                    <button class="button outline claim-button w-full">
                        ${item.status === 'unclaimed' ? 'Claim Item' : 'View Details'}
                    </button>
                </div>
            `;
            itemGrid.appendChild(card);
        });
        feather.replace(); // Initialize icons on newly added cards
    };

    const updateFilterButtons = () => {
        const buttons = filterButtonsContainer.querySelectorAll('.filter-button');
        buttons.forEach(button => {
            if (button.dataset.filter === currentFilter) {
                button.classList.add('active');
                // Ensure it uses primary button styles when active
                button.classList.remove('outline');
                button.classList.add('primary');
            } else {
                button.classList.remove('active');
                 // Ensure it uses outline button styles when inactive
                 button.classList.remove('primary');
                 button.classList.add('outline');
            }
        });
    };

     const showLoading = (show) => {
        if(itemLoader) itemLoader.classList.toggle('hidden', !show);
        if(itemGrid) itemGrid.classList.toggle('hidden', show);
    }

    const fetchAndRenderData = async () => {
        showLoading(true);
        isLoading = true;
        try {
            const data = await LostItemAPI.getAll();
            lostItems = data;
            renderItemGrid(); // Render based on current filter
            updateFilterButtons(); // Ensure buttons reflect state after load
        } catch (error) {
            console.error("Error fetching items:", error);
            if(itemGrid) itemGrid.innerHTML = `<div class="item-grid-empty-state"><p class="muted">Error loading items.</p></div>`;
        } finally {
            isLoading = false;
            showLoading(false);
        }
    };

    // --- Dialog and Form Logic ---
    const openDialog = () => {
        if (addItemDialog) addItemDialog.classList.remove('hidden');
        if (lostItemForm) lostItemForm.reset();
        if (fileNameDisplay) fileNameDisplay.textContent = ''; // Clear file name on open
        clearFormErrors();
    };

    const closeDialog = () => {
        if (addItemDialog) addItemDialog.classList.add('hidden');
    };

    const validateField = (field) => {
        const errorEl = field.parentElement.querySelector('.error-message');
        if (!errorEl) return true;

        let message = '';
        const value = field.value.trim();

        if (field.required && !value && field.tagName !== 'SELECT') {
            message = 'This field is required.';
        } else if (field.required && field.tagName === 'SELECT' && !field.value) {
             message = 'Please select a category.';
        } else if (field.minLength > 0 && value.length < field.minLength) {
            message = `Must be at least ${field.minLength} characters.`;
        }
        errorEl.textContent = message;
        return !message;
    };

     const validateForm = () => {
        let isValid = true;
        isValid &= validateField(document.getElementById('itemName'));
        isValid &= validateField(document.getElementById('itemDescription'));
        isValid &= validateField(document.getElementById('itemLocation'));
        isValid &= validateField(document.getElementById('itemCategory'));
        return isValid;
    };

     const clearFormErrors = () => {
       if(lostItemForm) {
            lostItemForm.querySelectorAll('.error-message').forEach(el => el.textContent = '');
       }
    };


    // --- Event Listeners ---
    if (addItemBtn) addItemBtn.addEventListener('click', openDialog);
    if (closeDialogBtn) closeDialogBtn.addEventListener('click', closeDialog);
    if (cancelDialogBtn) cancelDialogBtn.addEventListener('click', closeDialog);

    if (addItemDialog) {
        addItemDialog.addEventListener('click', (e) => {
            if (e.target === addItemDialog) closeDialog();
        });
    }

    // Filter button clicks
    if (filterButtonsContainer) {
        filterButtonsContainer.addEventListener('click', (e) => {
             // Use closest to handle clicks on icons inside buttons
             const button = e.target.closest('.filter-button');
             if (button && button.dataset.filter) {
                currentFilter = button.dataset.filter;
                updateFilterButtons();
                renderItemGrid(); // Re-render grid with new filter
            }
        });
    }

    // Form submission
    if (lostItemForm) {
        lostItemForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            clearFormErrors();

            if (!validateForm()) {
                console.log("Lost item form validation failed");
                return;
            }

            const formData = new FormData(lostItemForm);
            const newItemData = {
                name: formData.get('name'),
                description: formData.get('description'),
                location: formData.get('location'),
                category: formData.get('category'),
                image: null // Placeholder for image handling
                // dateFound, status handled by mock API
            };

             // Basic image handling simulation (get file name)
             const imageFile = itemImageInput.files[0];
             if (imageFile) {
                 console.log("Image selected:", imageFile.name);
                 // In a real app, you'd upload the file here and get a URL
                 // For now, we just log it. We could potentially use FileReader to display a preview
                 // newItemData.image = URL.createObjectURL(imageFile); // Example for preview
             }

            const submitButton = lostItemForm.querySelector('button[type="submit"]');
             if(submitButton) {
                submitButton.disabled = true;
                submitButton.innerHTML = '<span class="loader"></span> Adding...';
            }

            try {
                await LostItemAPI.addItem(newItemData);
                alert('Lost Item Added Successfully!');
                closeDialog();
                // Set filter to 'all' or 'unclaimed' to see the new item?
                currentFilter = 'all';
                fetchAndRenderData(); // Refresh list & buttons
            } catch (error) {
                console.error("Error adding item:", error);
                alert('Error adding item. Please try again.');
            } finally {
                 if(submitButton) {
                    submitButton.disabled = false;
                    submitButton.innerHTML = 'Add Item';
                }
            }
        });

         // Add listeners for input fields for live validation (optional)
        ['itemName', 'itemDescription', 'itemLocation', 'itemCategory'].forEach(id => {
            const field = document.getElementById(id);
            if (field) {
                const eventType = field.tagName === 'SELECT' ? 'change' : 'input';
                field.addEventListener(eventType, (e) => validateField(e.target));
            }
        });
    }

     // File input change listener
     if (itemImageInput && fileNameDisplay) {
         itemImageInput.addEventListener('change', () => {
             if (itemImageInput.files.length > 0) {
                 fileNameDisplay.textContent = `Selected: ${itemImageInput.files[0].name}`;
             } else {
                 fileNameDisplay.textContent = '';
             }
         });
     }

     // Event delegation for claim buttons on item cards
     if (itemGrid) {
        itemGrid.addEventListener('click', (e) => {
            const claimButton = e.target.closest('.claim-button');
            if (claimButton) {
                const card = claimButton.closest('.item-card');
                const itemId = card?.dataset.itemId;
                if (itemId) {
                     // Find the item details if needed
                     const item = lostItems.find(i => i.id == itemId);
                     if (item && item.status === 'unclaimed') {
                        alert(`Simulating claim process for Item ID: ${itemId} (${item.name})`);
                        // In a real app: Open claim dialog, update status via API, refetch data
                        // item.status = 'pending'; // Example local update (needs API call)
                        // renderItemGrid();
                    } else if (item) {
                         alert(`Viewing details for Item ID: ${itemId} (${item.name})`);
                         // Open details modal/view
                    }
                }
            }
        });
    }


    // --- Initial Load ---
    fetchAndRenderData();

});