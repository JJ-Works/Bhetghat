document.addEventListener('DOMContentLoaded', () => {
    const descriptionInput = document.getElementById('eventDescription');
    const charCount = document.getElementById('charCount');
    
    // Character count listener
    descriptionInput.addEventListener('input', () => {
        const length = descriptionInput.value.length;
        charCount.textContent = `${length} characters`;
        if (length < 60) {
            charCount.classList.add('error');
        } else {
            charCount.classList.remove('error');
        }
    });
});

let currentStep = 1;

function nextStep() {
    const errorMsg = document.getElementById('step1Error');
    const locationSelect = document.getElementById('eventLocation');

    if (currentStep === 1) {
        if (!locationSelect.value) {
            errorMsg.style.display = 'block';
            errorMsg.textContent = 'Please select a location.';
            return;
        }
        errorMsg.style.display = 'none';
        showStep(2);
    }
}

function prevStep() {
    if (currentStep === 2) {
        showStep(1);
    }
}

function showStep(step) {
    document.getElementById(`step${currentStep}`).classList.remove('active');
    document.getElementById(`dot${currentStep}`).classList.remove('active');
    
    currentStep = step;
    
    document.getElementById(`step${currentStep}`).classList.add('active');
    document.getElementById(`dot${currentStep}`).classList.add('active');
}

function submitEvent(event) {
    event.preventDefault();
    
    const topic = document.getElementById('eventTopic').value;
    const name = document.getElementById('eventName').value;
    const description = document.getElementById('eventDescription').value;
    const location = document.getElementById('eventLocation').value;
    const step2Error = document.getElementById('step2Error');

    // Validation
    if (!topic || !name || !description) {
        step2Error.style.display = 'block';
        step2Error.textContent = 'Please fill in all fields.';
        return;
    }

    if (description.length < 60) {
        step2Error.style.display = 'block';
        step2Error.textContent = 'Description must be at least 60 characters long.';
        return;
    }

    step2Error.style.display = 'none';

    // Log the data (Mock submission)
    const userId = localStorage.getItem('userId');
    const eventData = {
        id: Date.now(), // Simple unique ID
        userId: userId, // Associate event with user
        location,
        topic,
        title: name, // Profile.js expects 'title'
        description,
        date: new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) + " • " + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        image: "../assets/bgForcards.jpg", // Default placeholder
        createdAt: new Date().toISOString()
    };
    
    // Save to localStorage (Simulating DB)
    const storedEvents = JSON.parse(localStorage.getItem('myEvents') || '[]');
    storedEvents.push(eventData);
    localStorage.setItem('myEvents', JSON.stringify(storedEvents));
    
    console.log('Event Created:', eventData);
    alert('Event created successfully!');
    
    // Redirect to profile page to see the event
    window.location.href = 'profile.html';
}
