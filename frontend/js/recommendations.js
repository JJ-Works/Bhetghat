const API_BASE_URL = 'http://localhost:8080';

async function loadRecommendations() {
    const eventsGrid = document.getElementById('eventsGrid');
    
    try {
        const response = await fetch(`${API_BASE_URL}/events/all`);
        
        if (!response.ok) throw new Error(`Failed to fetch events: ${response.status}`);

        let backendEvents = await response.json();
        
        // Merge with local events
        const storedEvents = JSON.parse(localStorage.getItem('myEvents') || '[]');
        let events = [...storedEvents.reverse(), ...backendEvents];
        
        // Deduplicate
        events = Array.from(new Map(events.map(item => [item.id, item])).values());

        if (events.length === 0) {
            eventsGrid.innerHTML = '<p class="error-message">No events found. Check back soon!</p>';
            return;
        }

        // Limit to 8
        events = events.slice(0, 8);
        eventsGrid.innerHTML = '';

        events.forEach((event, index) => {
            const card = createEventCard(event);
            card.style.animationDelay = `${index * 0.1}s`;
            eventsGrid.appendChild(card);
        });
    } catch (error) {
        console.error('Error loading events:', error);
        eventsGrid.innerHTML = '<p class="error-message">Unable to load events.</p>';
    }
}

function createEventCard(event) {
    const card = document.createElement('article');
    card.className = 'event-card';
    
    const formattedDate = formatDate(event.eventDate || event.date);
    
    // IMAGE LOGIC FIX
    // 1. Backend URL (http...) -> Use as is
    // 2. Base64 (data:image...) -> Use as is
    // 3. Relative path -> Ensure correct prefix for Home Page (assets/)
    
    let imageSrc = 'assets/bgForcards.jpg'; // Default
    
    if (event.imageUrl) {
        imageSrc = event.imageUrl; // Backend preferred
    } else if (event.image) {
        imageSrc = event.image; // LocalStorage
    }

    card.innerHTML = `
        <img src="${imageSrc}" alt="Event Image" class="event-card-image" onerror="this.src='assets/bgForcards.jpg'">
        <div class="event-card-body">
            <p class="event-card-date-small">${formattedDate}</p>
            <h3 class="event-card-title-new">${escapeHtml(event.title)}</h3>
        </div>
        <a href="pages/event-details.html?id=${event.id}" class="view-details-btn">View Details</a>
    `;
    
    card.addEventListener('click', (e) => {
        if (!e.target.classList.contains('view-details-btn')) {
            window.location.href = `pages/event-details.html?id=${event.id}`;
        }
    });
    
    return card;
}

function formatDate(dateTimeString) {
    if (!dateTimeString) return 'Date TBA';
    try {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateTimeString).toLocaleDateString('en-US', options);
    } catch (e) {
        return 'Date TBA';
    }
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

document.addEventListener('DOMContentLoaded', loadRecommendations);
