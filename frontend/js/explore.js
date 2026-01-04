let allEvents = [];
let filteredEvents = [];

// Load events on page load
document.addEventListener('DOMContentLoaded', () => {
    console.log('Explore page loaded');
    
    // Load all events first
    loadAllEvents().then(() => {
        // Check for search query in URL (from Navbar redirect)
        const urlParams = new URLSearchParams(window.location.search);
        const searchQuery = urlParams.get('query');
        
        if (searchQuery) {
            // Update UI
            const searchInput = document.getElementById('searchInput');
            if (searchInput) searchInput.value = searchQuery;
            
            // Execute Client-Side Search
            performSearchLogic(searchQuery);
        }
    });

    setupFilterButtons();
    setupCreateEventButton();
});

async function loadAllEvents() {
    try {
        let backendEvents = [];
        try {
            console.log('Fetching events from: http://localhost:8080/events/all');
            const response = await fetch('http://localhost:8080/events/all');
            
            if (response.ok) {
                let responseData = await response.json();
                if (responseData && Array.isArray(responseData.content)) {
                    backendEvents = responseData.content;
                } else if (Array.isArray(responseData)) {
                    backendEvents = responseData;
                }
            }
        } catch (apiError) {
            console.warn('Backend unavailable:', apiError);
        }

        // Merge with local storage (legacy support)
        const storedEvents = JSON.parse(localStorage.getItem('myEvents') || '[]');
        
        // Combine them
        const combinedEvents = [...storedEvents.reverse(), ...backendEvents];
        
        // Deduplicate by ID
        const uniqueEvents = Array.from(new Map(combinedEvents.map(item => [item.id, item])).values());

        allEvents = uniqueEvents;
        filteredEvents = uniqueEvents;
        
        if (allEvents.length === 0) {
            showNoResults();
        } else {
            displayEvents(filteredEvents);
        }

    } catch (error) {
        console.error('Error loading events:', error);
        showNoResults();
    }
}

function performSearch(e) {
    e.preventDefault();
    const searchInput = document.getElementById('searchInput');
    const query = searchInput.value.trim();
    performSearchLogic(query);
}

function performSearchLogic(query) {
    const title = document.getElementById('exploreTitle');
    const lowerQuery = query.toLowerCase();

    if (query) {
        if (title) title.textContent = `Search results for "${query}"`;
        
        filteredEvents = allEvents.filter(event => {
            const matchTitle = event.title && event.title.toLowerCase().includes(lowerQuery);
            const matchDesc = event.description && event.description.toLowerCase().includes(lowerQuery);
            const matchLoc = event.location && event.location.toLowerCase().includes(lowerQuery);
            return matchTitle || matchDesc || matchLoc;
        });
    } else {
        if (title) title.textContent = 'Events';
        filteredEvents = [...allEvents];
    }
    
    displayEvents(filteredEvents);
}

function displayEvents(events) {
    const grid = document.getElementById('eventsGrid');
    const noResults = document.getElementById('noResults');

    if (!events || events.length === 0) {
        grid.innerHTML = '';
        noResults.style.display = 'block';
        return;
    }

    noResults.style.display = 'none';
    grid.innerHTML = events.map(event => {
        const formattedDate = formatDate(event.eventDate || event.date);
        
        // Image Logic: Backend URL vs Local Base64 vs Default
        // Explore page is in 'pages/' so assets are one level up '../assets/'
        let imageSrc = event.image || event.imageUrl || '../assets/bgForcards.jpg';
        
        return `
            <div class="event-card" data-event-id="${event.id}">
                <img src="${imageSrc}" alt="Event Image" class="event-card-image" onerror="this.src='../assets/bgForcards.jpg'">
                <div class="event-card-body">
                    <p class="event-card-date-small">${formattedDate}</p>
                    <h3 class="event-card-title-new">${escapeHtml(event.title || 'Untitled Event')}</h3>
                </div>
                <a href="event-details.html?id=${event.id}" class="view-details-btn">View Details</a>
            </div>
        `;
    }).join('');

    // Add click functionality
    document.querySelectorAll('.event-card').forEach(card => {
        card.addEventListener('click', (e) => {
            if (!e.target.classList.contains('view-details-btn')) {
                const eventId = card.dataset.eventId;
                if (eventId) {
                    window.location.href = `event-details.html?id=${eventId}`;
                }
            }
        });
    });
}

function setupFilterButtons() {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            const filter = this.dataset.filter;
            
            if (filter === 'all') {
                filteredEvents = [...allEvents];
            } else if (filter === 'upcoming') {
                filteredEvents = allEvents.filter(event => event.status === 'upcoming' || !event.status);
            } else if (filter === 'popular') {
                filteredEvents = [...allEvents].sort((a, b) => 
                    (b.participantCount || 0) - (a.participantCount || 0)
                );
            }

            displayEvents(filteredEvents);
        });
    });
}

function setupCreateEventButton() {
    const createBtn = document.getElementById('createEventBtn');
    if (createBtn) {
        const userId = localStorage.getItem('userId');
        if (!userId) {
            createBtn.addEventListener('click', (e) => {
                e.preventDefault();
                window.location.href = 'login.html';
            });
        }
    }
}

function showNoResults() {
    document.getElementById('eventsGrid').innerHTML = '';
    document.getElementById('noResults').style.display = 'block';
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
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