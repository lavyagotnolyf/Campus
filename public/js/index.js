// Optional: dashboard.js (Only if generating cards dynamically)

document.addEventListener('DOMContentLoaded', () => {
    const features = [
        { title: 'Student Authentication', description: 'Verify student identity through facial recognition or student ID', icon: 'user-check', colorClass: 'blue', path: 'student-auth.html' },
        { title: 'Visitor Management', description: 'Register and track visitors on campus premises', icon: 'users', colorClass: 'purple', path: 'visitor-management.html' },
        { title: 'Vehicle Tracking', description: 'Monitor and log vehicles entering and leaving campus', icon: 'truck', colorClass: 'green', path: 'vehicle-tracking.html' },
        { title: 'Lost & Found', description: 'Report and claim lost items through our digital portal', icon: 'package', colorClass: 'amber', path: 'lost-found.html' }
    ];

    const featureGrid = document.querySelector('.feature-grid');

    if (featureGrid) {
        featureGrid.innerHTML = ''; // Clear static content if dynamic generation is used

        features.forEach(feature => {
            const cardHTML = `
                <div class="card feature-card">
                    <div class="card-content feature-card-content">
                        <div class="feature-header">
                            <div class="feature-icon-wrapper icon-bg-${feature.colorClass}">
                                <i data-feather="${feature.icon}" class="feature-icon icon-${feature.colorClass}"></i>
                            </div>
                            <div class="feature-text">
                                <h3 class="feature-title">${feature.title}</h3>
                                <p class="muted feature-description">${feature.description}</p>
                            </div>
                        </div>
                        <div class="feature-footer">
                            <a href="${feature.path}" class="button primary feature-button">
                                Access ${feature.title.split(' ')[0]} </a>
                        </div>
                    </div>
                </div>
            `;
            featureGrid.insertAdjacentHTML('beforeend', cardHTML);
        });

        feather.replace(); // Initialize icons after adding dynamic content
    }
});