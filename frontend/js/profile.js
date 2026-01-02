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
    const myRequests = allRequests.filter(req => req.ownerId === currentUserId && req.status === 'pending');

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

function loadJoinedEvents() {
    const eventsContainer = document.getElementById('joinedEventsList');
    const currentUserId = localStorage.getItem('userId');
    
    // Load from localStorage (Simulating DB)
    const storedEvents = JSON.parse(localStorage.getItem('myEvents') || '[]');
    
    // Filter events belonging to this user
    const userEvents = storedEvents.filter(event => event.userId === currentUserId);
    
    // Combine with default mock data if needed, or just use stored events.
    // For this prototype, we'll start with storedEvents. 
    // If empty, we can show a few mocks or just "No events".
    // Let's mix them so the user sees something initially, then their new event appears.
    
    const defaultEvents = [
        {
            id: 1,
            title: "Saturday Morning Hike",
            date: "Sat, Jan 15 • 7:00 AM",
            location: "Shivapuri Nagarjun National Park",
            image: "../assets/trek.jpg"
        },
        {
            id: 2,
            title: "Tech Meetup Kathmandu",
            date: "Fri, Jan 21 • 4:00 PM",
            location: "Thamel, Kathmandu",
            image: "../assets/wallpaperflare.com_wallpaper(1).jpg"
        }
    ];

    // Combine: Newest created events first
    // Only show default events if user hasn't created any, or just show them always?
    // User requested "events that is not even mine" fix. 
    // Assuming "My Events" should ONLY show what I created/joined.
    // For now, let's keep defaultEvents for visual population but strictly filter the `storedEvents`.
    // Actually, to fully "fix" it, I should probably remove the defaultEvents or make them "public" events I joined.
    // Let's assume defaultEvents are "joined" by everyone for demo purposes, 
    // BUT since the user complained, let's only show `userEvents`.
    
    let allEvents = [...userEvents.reverse()];

    // Fallback: If no personal events, show defaults so page isn't empty (Demo mode)
    // OR better: Only show user's events to be "correct".
    // Let's just show userEvents to be strictly correct per request.
    // But if list is empty, user might think it's broken.
    // Let's stick to userEvents only.
    
    if (allEvents.length === 0) {
        eventsContainer.innerHTML = '<div class="no-events">You haven\'t joined any events yet.</div>';
        return;
    }

    eventsContainer.innerHTML = '';
    allEvents.forEach(event => {
        const card = document.createElement('div');
        card.className = 'event-card';
        // Make the whole card clickable
        card.onclick = () => window.location.href = `event-details.html?id=${event.id}`;
        card.style.cursor = 'pointer';

        card.innerHTML = `
            <div class="event-card-img" style="background-image: url('${event.image || '../assets/bgForcards.jpg'}')"></div>
            <div class="event-card-body">
                <div class="event-date">${event.date}</div>
                <h3 class="event-title">${event.title}</h3>
                <div class="event-location">
                    <span>📍</span> ${event.location}
                </div>
            </div>
        `;
        eventsContainer.appendChild(card);
    });
}
