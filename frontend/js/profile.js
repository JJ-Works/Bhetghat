document.addEventListener('DOMContentLoaded', () => {
    loadProfileData();
    loadJoinRequests(); // New function
    loadJoinedEvents();
});

function loadProfileData() {
    // Attempt to get data from localStorage, fall back to defaults
    const userName = localStorage.getItem('userName') || 'Guest User';
    const userEmail = localStorage.getItem('userEmail') || 'guest@example.com';
    // Mock data for location and join date since we might not have it yet
    const userLocation = localStorage.getItem('userLocation') || 'Kathmandu, Nepal';
    const joinDate = localStorage.getItem('userJoinDate') || 'January 2024';
    
    // Update DOM
    document.getElementById('profileName').textContent = userName;
    document.getElementById('profileEmail').textContent = userEmail;
    document.getElementById('profileLocation').textContent = userLocation;
    document.getElementById('profileJoinDate').textContent = `Joined ${joinDate}`;
    
    // Handle Profile Avatar (Initial)
    const profilePicContainer = document.querySelector('.profile-pic-container');
    if (profilePicContainer) {
        profilePicContainer.innerHTML = ''; // Clear existing img
        const initialDiv = document.createElement('div');
        initialDiv.className = 'avatar-initial profile-pic-initial';
        initialDiv.textContent = userName.charAt(0).toUpperCase();
        profilePicContainer.appendChild(initialDiv);
    }
    
    // User Interests - Mocking this for now as per requirements
    // In a real app, this would come from an API or localStorage
    const interests = ['Hiking', 'Music', 'Technology', 'Food', 'Travel'];
    const interestsContainer = document.getElementById('interestsContainer');
    
    interestsContainer.innerHTML = '';
    interests.forEach(interest => {
        const tag = document.createElement('div');
        tag.className = 'interest-tag';
        tag.textContent = interest;
        interestsContainer.appendChild(tag);
    });
}

function loadJoinRequests() {
    const requestsContainer = document.getElementById('joinRequestsContainer');
    const requestsSection = document.getElementById('requestsSection');
    const currentUserId = localStorage.getItem('userId');
    
    if (!currentUserId) return;

    // Fetch requests from localStorage
    const allRequests = JSON.parse(localStorage.getItem('eventRequests') || '[]');
    
    // Filter for requests where I am the owner of the event AND status is pending
    // FIX: loose equality for ID comparison (string vs number)
    const myRequests = allRequests.filter(req => String(req.ownerId) === String(currentUserId) && req.status === 'pending');

    if (myRequests.length === 0) {
        requestsSection.style.display = 'none'; // Hide section if no requests
        return;
    }

    requestsSection.style.display = 'block';
    requestsContainer.innerHTML = '';

    myRequests.forEach(req => {
        const reqCard = document.createElement('div');
        reqCard.className = 'request-card';
        reqCard.style.cssText = `
            background: #fff;
            border: 1px solid #eee;
            border-radius: 8px;
            padding: 1rem;
            margin-bottom: 1rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        `;

        reqCard.innerHTML = `
            <div class="request-info">
                <p style="margin: 0; font-weight: 600; color: #333;">${req.requesterName || 'A User'} wants to join <strong>${req.eventTitle}</strong></p>
                <p style="margin: 5px 0 0; font-size: 0.9rem; color: #666;">Reason: "<em>${req.reason || 'No reason provided'}</em>"</p>
            </div>
            <div class="request-actions" style="display: flex; gap: 10px;">
                <button onclick="handleRequest(${req.id}, 'accept')" style="background: #27ae60; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer;">Accept</button>
                <button onclick="handleRequest(${req.id}, 'delete')" style="background: #e74c3c; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer;">Delete</button>
            </div>
        `;
        requestsContainer.appendChild(reqCard);
    });
}

function handleRequest(requestId, action) {
    const allRequests = JSON.parse(localStorage.getItem('eventRequests') || '[]');
    const reqIndex = allRequests.findIndex(r => r.id === requestId);

    if (reqIndex !== -1) {
        if (action === 'accept') {
            allRequests[reqIndex].status = 'accepted';
            alert('Request Accepted!');
        } else if (action === 'delete') {
            allRequests[reqIndex].status = 'rejected';
            // Or splice to remove completely: allRequests.splice(reqIndex, 1);
            alert('Request Rejected.');
        }
        localStorage.setItem('eventRequests', JSON.stringify(allRequests));
        
        // Refresh the list
        loadJoinRequests();
    }
}

async function loadJoinedEvents() {
    const eventsContainer = document.getElementById('joinedEventsList');
    const currentUserId = localStorage.getItem('userId');
    
    if (!currentUserId) {
        eventsContainer.innerHTML = '<div class="no-events">Please login to view events.</div>';
        return;
    }

    let myCreatedEvents = [];
    
    // 1. Fetch events created by me from Backend
    try {
        const response = await fetch(`http://localhost:8080/users/${currentUserId}/events`);
        if (response.ok) {
            myCreatedEvents = await response.json();
            myCreatedEvents = myCreatedEvents.map(e => ({
                ...e,
                image: e.imageUrl || e.image, 
                date: new Date(e.eventDate).toLocaleDateString()
            }));
        }
    } catch (e) {
        console.error("Failed to fetch user events from backend", e);
    }

    // 2. Get events I have joined (accepted requests)
    const storedEvents = JSON.parse(localStorage.getItem('myEvents') || '[]');
    const allRequests = JSON.parse(localStorage.getItem('eventRequests') || '[]');
    const myAcceptedRequests = allRequests.filter(req => String(req.requesterId) === String(currentUserId) && req.status === 'accepted');
    
    // Create a Promise array to fetch details for joined events
    const joinedEventsPromises = myAcceptedRequests.map(async (req) => {
        // A. Try finding in Local Storage
        let evt = storedEvents.find(e => e.id == req.eventId);
        
        // B. Try finding in myCreatedEvents (unlikely if I joined it, but possible)
        if (!evt) evt = myCreatedEvents.find(e => e.id == req.eventId);
        
        // C. Fetch from Backend (New logic for backend-created events)
        if (!evt) {
            try {
                const res = await fetch(`http://localhost:8080/events/${req.eventId}`);
                if (res.ok) {
                    const backendEvt = await res.json();
                    evt = {
                        ...backendEvt,
                        image: backendEvt.imageUrl || backendEvt.image,
                        date: new Date(backendEvt.eventDate).toLocaleDateString()
                    };
                }
            } catch (err) {
                console.warn(`Could not fetch joined event details for ID ${req.eventId}`);
            }
        }
        return evt;
    });

    const myJoinedEvents = (await Promise.all(joinedEventsPromises)).filter(e => e !== undefined && e !== null);

    // Combine created and joined events
    const combinedEvents = [...myCreatedEvents, ...myJoinedEvents];
    
    // Deduplicate by ID
    const uniqueEvents = Array.from(new Map(combinedEvents.map(item => [item.id, item])).values());
    
    const finalEvents = uniqueEvents.sort((a, b) => b.id - a.id); // Simple sort
    
    if (finalEvents.length === 0) {
        eventsContainer.innerHTML = '<div class="no-events">You haven\'t joined or created any events yet.</div>';
        return;
    }

    eventsContainer.innerHTML = '';
    finalEvents.forEach(event => {
        const card = document.createElement('div');
        card.className = 'event-card';
        card.onclick = () => window.location.href = `event-details.html?id=${event.id}`;
        card.style.cursor = 'pointer';
        
        const imageSrc = event.image || event.imageUrl || '../assets/bgForcards.jpg';
        // Handle date formatting if it's not already formatted string
        let displayDate = event.date;
        if (!displayDate && event.eventDate) {
             try { displayDate = new Date(event.eventDate).toLocaleDateString(); } catch(e) { displayDate = 'TBA'; }
        } else if (!displayDate) {
            displayDate = 'TBA';
        }

        card.innerHTML = `
            <div class="event-card-img" style="background-image: url('${imageSrc}')"></div>
            <div class="event-card-body">
                <div class="event-date">${displayDate}</div>
                <h3 class="event-title">${event.title}</h3>
                <div class="event-location">
                    <span>📍</span> ${event.location || 'Location TBA'}
                </div>
            </div>
        `;
        eventsContainer.appendChild(card);
    });
}
