document.addEventListener('DOMContentLoaded', () => {
    // --- State Variables ---
    let selectedStudent = null; // Holds the found student object
    let activeTab = 'face';    // 'face' or 'id'
    let modelsLoaded = false; // Track model loading status

    // --- DOM References ---
    // Tabs
    const tabFaceButton = document.getElementById('tab-face');
    const tabIdButton = document.getElementById('tab-id');
    const contentFace = document.getElementById('content-face');
    const contentId = document.getElementById('content-id');

    // Face Recognition Elements
    const videoElement = document.getElementById('webcam');
    const scanButton = document.getElementById('scan-button');
    const snapshotCanvas = document.getElementById('snapshot-canvas'); // Still needed for capture
    const faceStatusMessage = document.getElementById('face-status-message');
    let overlayCanvas = null; // For drawing face detections

    // ID Search Elements
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const searchStatusMessage = document.getElementById('search-status-message');

    // Student Details Display
    const studentDetailsContent = document.getElementById('student-details-content');

    // --- Functions ---

    // Function to update the student details display
    function displayStudentDetails(student) {
        selectedStudent = student; // Update state

        if (student) {
            studentDetailsContent.innerHTML = `
                <img src="${student.photoUrl || '/assets/images/no-image.png'}" alt="Student Photo" class="student-photo">
                <p><strong>Name:</strong> ${student.name || 'N/A'}</p>
                <p><strong>Student ID:</strong> ${student.studentId || 'N/A'}</p>
                <p><strong>Roll No:</strong> ${student.rollNo || 'N/A'}</p>
                <p><strong>Department:</strong> ${student.department || 'N/A'}</p>
                `;
        } else {
            studentDetailsContent.innerHTML = '<p>Scan face or search by ID to view student details.</p>';
        }
    }

    // Function to handle tab switching
    function switchTab(newTab) {
        activeTab = newTab;

        // Update button styles
        tabFaceButton.classList.toggle('active', newTab === 'face');
        tabIdButton.classList.toggle('active', newTab === 'id');

        // Update content visibility
        contentFace.classList.toggle('hidden', newTab !== 'face');
        contentFace.classList.toggle('active', newTab === 'face'); // Optional
        contentId.classList.toggle('hidden', newTab !== 'id');
        contentId.classList.toggle('active', newTab === 'id'); // Optional

        if (newTab === 'face' && (!videoElement.srcObject || videoElement.paused)) {
            startWebcam();
        }
    }

    // --- Face Recognition Functions ---
    async function loadModels() {
        const MODEL_URL = '/models'; // Path to where you downloaded the models
        faceStatusMessage.textContent = 'Loading face recognition models...';
        scanButton.disabled = true; // Disable scan button while loading

        try {
            console.log("Loading models from:", MODEL_URL);
            await Promise.all([
                faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
                //faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
                //faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
            ]);
            console.log("Models loaded successfully!");
            modelsLoaded = true;
            if (activeTab === 'face') {
                faceStatusMessage.textContent = 'Models loaded. Webcam starting...';
            }
        } catch (error) {
            console.error("Error loading models:", error);
            faceStatusMessage.textContent = 'Error loading models. Face recognition disabled.';
            modelsLoaded = false;
            scanButton.disabled = true;
        }
    }

    async function startWebcam() {
        if (!modelsLoaded) {
            console.log("Waiting for models to load before starting webcam...");
            faceStatusMessage.textContent = 'Waiting for models...';
            return;
        }

        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { width: { ideal: 320 }, height: { ideal: 240 } }
                });
                videoElement.srcObject = stream;
                videoElement.onloadedmetadata = () => {
                    faceStatusMessage.textContent = 'Webcam active. Position student and click Scan.';
                    if (scanButton) scanButton.disabled = false;
                    setupOverlayCanvas();
                }
            } catch (err) {
                console.error("Error accessing webcam:", err);
                faceStatusMessage.textContent = `Error: ${err.message}. Ensure permission granted.`;
                if (scanButton) scanButton.disabled = true;
            }
        } else {
            console.error("getUserMedia not supported");
            faceStatusMessage.textContent = 'Webcam not supported by this browser.';
            if (scanButton) scanButton.disabled = true;
        }
    }

    function stopWebcam() {
        const stream = videoElement.srcObject;
        if (stream) {
            const tracks = stream.getTracks();
            tracks.forEach(track => track.stop());
            videoElement.srcObject = null;
            console.log("Webcam stopped.");
        }
    }

    function setupOverlayCanvas() {
        if (!overlayCanvas) {
            overlayCanvas = faceapi.createCanvasFromMedia(videoElement);
            document.getElementById('webcam-container').append(overlayCanvas);
            overlayCanvas.style.position = 'absolute';
            overlayCanvas.style.top = '0';
            overlayCanvas.style.left = '0';
        }
        faceapi.matchDimensions(overlayCanvas, videoElement);
    }

    if (scanButton) {
        scanButton.addEventListener('click', async () => {
            if (!modelsLoaded || !videoElement.srcObject || videoElement.paused) {
                faceStatusMessage.textContent = 'Models or webcam not ready.';
                return;
            }

            faceStatusMessage.textContent = 'Detecting face...';
            console.log("Detecting face...");

            setupOverlayCanvas();
            const displaySize = { width: videoElement.clientWidth, height: videoElement.clientHeight };
            faceapi.matchDimensions(overlayCanvas, displaySize);

            try {
                const detection = await faceapi.detectSingleFace(videoElement,
                    new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 }))
                    .withFaceLandmarks()
                    .withFaceDescriptor();

                overlayCanvas.getContext('2d').clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);

                if (detection) {
                    console.log("Face detected!");
                    console.log("Face Descriptor:", detection.descriptor);
                    faceStatusMessage.textContent = 'Face detected! Descriptor logged to console.';

                    const resizedDetection = faceapi.resizeResults(detection, displaySize);
                    faceapi.draw.drawDetections(overlayCanvas, resizedDetection);
                    faceapi.draw.drawFaceLandmarks(overlayCanvas, resizedDetection);

                    // **NEXT STEP:** Send this descriptor to your backend API for matching
                    // You would use fetch() or Workspace API here to make a POST request
                    // to an endpoint like '/api/verify-student-face'
                    // Include the descriptor in the request body

                    // For now, let's just indicate success
                    faceStatusMessage.textContent = 'Face detected. (Matching with backend needs implementation)';
                    displayStudentDetails(null); // Clear any previous ID search result
                } else {
                    console.log("No face detected.");
                    faceStatusMessage.textContent = 'No face detected. Try again.';
                    displayStudentDetails(null);
                }
            } catch (error) {
                console.error("Error during face detection:", error);
                faceStatusMessage.textContent = 'An error occurred during detection.';
            }
        });
    }

    // --- ID Search Logic ---
    if (searchButton) {
        searchButton.addEventListener('click', async () => {
            const searchTerm = searchInput.value.trim();
            if (!searchTerm) {
                searchStatusMessage.textContent = 'Please enter an ID or Name.';
                displayStudentDetails(null);
                return;
            }
            searchStatusMessage.textContent = `Searching for "${searchTerm}"...`;
    
            try {
                const response = await fetch(`http://localhost:5000/api/search-student?term=${searchTerm}`); // Use the full backend URL
                const data = await response.json();
    
                if (response.ok) {
                    if (data && data.length > 0) {
                        displayStudentDetails(data[0]);
                        searchStatusMessage.textContent = 'Student Found!';
                    } else {
                        displayStudentDetails(null);
                        searchStatusMessage.textContent = 'Student not found.';
                    }
                } else {
                    displayStudentDetails(null);
                    searchStatusMessage.textContent = `Error: ${data.message || 'Could not perform search.'}`;
                }
            } catch (error) {
                console.error('Error searching students:', error);
                displayStudentDetails(null);
                searchStatusMessage.textContent = 'An unexpected error occurred during the search.';
            }
        });
    }

    // --- ADD EVENT LISTENERS FOR TABS HERE ---
    if (tabFaceButton && tabIdButton) {
        tabFaceButton.addEventListener('click', () => {
            // Only switch if not already active to potentially save resources
            if (activeTab !== 'face') {
                switchTab('face');
            }
        });

        tabIdButton.addEventListener('click', () => {
            // Only switch if not already active
            if (activeTab !== 'id') {
                switchTab('id');
            }
        });
    } else {
        console.error("Could not find tab buttons to attach listeners.");
    } 

    // --- Initialisation ---
    loadModels().then(() => {
        console.log("Model loading process finished (check logs for success/failure).");
        switchTab(activeTab);
        if (activeTab === 'face') {
            startWebcam();
        }
    });

}); // End DOMContentLoaded