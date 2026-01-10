document.addEventListener('DOMContentLoaded', () => {
    Auth.requireAuth();
    loadProfile();
    loadMyEvents();

    // Tab Logic
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const type = btn.dataset.tab;
            filterEvents(type);
        });
    });
});

let allEventsData = [];

function loadProfile() {
    const user = Auth.getUser();
    document.getElementById('profileName').textContent = user.name;
    document.getElementById('profileEmail').textContent = user.email;
    document.getElementById('profileAvatar').textContent = user.name.charAt(0);
}

async function loadMyEvents() {
    const container = document.getElementById('profileEventsContainer');
    container.innerHTML = '<p>Loading your events...</p>';
    
    try {
        const events = await API.getAllEvents();
        allEventsData = events; // Store for filtering
        filterEvents('hosting'); // Default view
    } catch (error) {
        container.innerHTML = `<p style="color:red">Failed to load events: ${error.message}</p>`;
    }
}

function filterEvents(type) {
    const user = Auth.getUser();
    const container = document.getElementById('profileEventsContainer');
    let filtered = [];

    if (type === 'hosting') {
        filtered = allEventsData.filter(e => e.host && e.host.id === user.id);
    } else {
        // 'Attending' means in participants list BUT NOT host (optionally, or include host too)
        // Usually "Attending" implies I joined someone else's event.
        // But for simplicity, let's show all events I'm participating in.
        filtered = allEventsData.filter(e => 
            e.participants && e.participants.some(p => p.id === user.id)
        );
    }

    if (filtered.length === 0) {
        container.innerHTML = `<div class="empty-state">No events found in this category.</div>`;
        return;
    }

    container.innerHTML = `<div class="events-grid">${filtered.map(createEventCard).join('')}</div>`;
}

function createEventCard(event) {
    return `
        <div class="event-card" onclick="window.location.href='event-details.html?id=${event.id}'" style="cursor:pointer">
            <div class="event-header" style="${event.imageUrl ? `background-image: url('${event.imageUrl}');` : ''}">
            </div>
            <div class="event-body">
                <span class="event-date">${new Date(event.eventDate).toLocaleDateString()}</span>
                <h3 class="event-title">${event.title}</h3>
                <div class="event-info">
                    <p>📍 ${event.location}</p>
                </div>
                <div class="event-host">
                    <span style="color: var(--primary); font-weight:600;">View Details →</span>
                </div>
            </div>
        </div>
    `;
}
