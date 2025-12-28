const API_BASE_URL = 'http://localhost:8080'; // Change to your backend URL

async function loadRecommendations() {
    const eventsGrid = document.getElementById('eventsGrid');
    
    try {
        console.log('Fetching events from:', `${API_BASE_URL}/events/all`);
        
        const response = await fetch(`${API_BASE_URL}/events/all`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            },
            credentials: 'include'
        });

        console.log('Response status:', response.status);

        if (!response.ok) {
            throw new Error(`Failed to fetch events: ${response.status}`);
        }

        let events = await response.json();
        console.log('Raw response:', events);
        
        // Handle if response is wrapped in an object
        if (events.content) {
            events = events.content; // For paginated responses
        }
        if (!Array.isArray(events)) {
            console.warn('Events is not an array, got:', typeof events);
            events = [];
        }
        
        // Limit to 4 events for landing page
        events = events.slice(0, 4);
        console.log('Processed events (limited to 4):', events);
        
        // Clear skeleton loaders
        eventsGrid.innerHTML = '';
        
        if (events.length === 0) {
            console.log('No events found');
            eventsGrid.innerHTML = '<p class="error-message">No events found. Check back soon!</p>';
            return;
        }

        console.log('Creating cards for', events.length, 'events');

        // Create and append event cards
        events.forEach((event, index) => {
            console.log('Creating card for event:', event.title);
            const card = createEventCard(event);
            card.style.animationDelay = `${index * 0.1}s`;
            eventsGrid.appendChild(card);
        });
    } catch (error) {
        console.error('Error loading events:', error);
        eventsGrid.innerHTML = '<p class="error-message">Unable to load events. Please try again later.</p>';
    }
}

function createEventCard(event) {
    const card = document.createElement('article');
    card.className = 'event-card';
    
    // Generate a random color for the placeholder image
    const colors = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    
    const formattedDate = formatDate(event.eventDate);
    const formattedTime = formatTime(event.eventDate);
    const participantCount = event.participants?.length || 0;
    
    console.log('Event details:', {
        title: event.title,
        date: formattedDate,
        time: formattedTime,
        participants: participantCount,
        category: event.category
    });
    
    card.innerHTML = `
        <div class="event-card-image" style="background-color: ${randomColor}; display: flex; align-items: center; justify-content: center; font-size: 2rem; color: white; font-weight: bold;">
            ${event.category?.charAt(0).toUpperCase() || '📅'}
        </div>
        <div class="event-card-content">
            <div class="event-card-header">
                <h3 class="event-card-title">${escapeHtml(event.title)}</h3>
                <span class="event-card-category">${escapeHtml(event.category || 'Event')}</span>
            </div>
            
            <div class="event-card-meta">
                <div class="event-card-meta-item">
                    <span class="event-card-meta-icon">📅</span>
                    <span>${formattedDate}</span>
                </div>
                <div class="event-card-meta-item">
                    <span class="event-card-meta-icon">🕐</span>
                    <span>${formattedTime}</span>
                </div>
                <div class="event-card-meta-item">
                    <span class="event-card-meta-icon">📍</span>
                    <span>${escapeHtml(event.location || 'Location TBA')}</span>
                </div>
            </div>
            
            <p class="event-card-description">${escapeHtml(event.description || 'No description available')}</p>
            
            <div class="event-card-footer">
                <div class="event-card-attendees">
                    <div class="event-card-avatar">${participantCount > 99 ? '99+' : participantCount}</div>
                    <span>${participantCount} ${participantCount === 1 ? 'participant' : 'participants'}</span>
                </div>
                <a href="pages/event-details.html?id=${event.id}" class="event-card-link">View Details</a>
            </div>
        </div>
    `;
    
    return card;
}

function formatDate(dateTimeString) {
    if (!dateTimeString) return 'Date TBA';
    try {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateTimeString).toLocaleDateString('en-US', options);
    } catch (e) {
        console.warn('Date format error:', e);
        return 'Date TBA';
    }
}

function formatTime(dateTimeString) {
    if (!dateTimeString) return 'Time TBA';
    try {
        const options = { hour: '2-digit', minute: '2-digit' };
        return new Date(dateTimeString).toLocaleTimeString('en-US', options);
    } catch (e) {
        console.warn('Time format error:', e);
        return 'Time TBA';
    }
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Load events when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, starting to load recommendations');
    loadRecommendations();
});

// Also try loading on window load for safety
window.addEventListener('load', () => {
    const eventsGrid = document.getElementById('eventsGrid');
    if (eventsGrid && eventsGrid.children.length === 0) {
        console.log('Events grid empty on window load, attempting reload');
        loadRecommendations();
    }
});