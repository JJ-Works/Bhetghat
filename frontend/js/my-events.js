const API_BASE_URL = 'http://localhost:8080';

document.addEventListener('DOMContentLoaded', () => {
    loadMyEvents();
});

async function loadMyEvents() {
    const userId = localStorage.getItem('userId'); // Assuming userId is stored in localStorage
    const myEventsList = document.getElementById('my-events-list');

    if (!userId) {
        myEventsList.innerHTML = '<p>Please log in to view your events.</p>';
        return;
    }

    try {
        // Fetch all events
        const eventsResponse = await fetch(`${API_BASE_URL}/events/all`);
        if (!eventsResponse.ok) {
            throw new Error(`HTTP error! status: ${eventsResponse.status}`);
        }
        const allEvents = await eventsResponse.json();

        // Filter events created by the current user
        const myCreatedEvents = allEvents.filter(event => event.createdBy == userId);

        if (myCreatedEvents.length === 0) {
            myEventsList.innerHTML = '<p>You have not created any events yet.</p>';
            return;
        }

        myEventsList.innerHTML = ''; // Clear previous content

        for (const event of myCreatedEvents) {
            const eventCard = document.createElement('div');
            eventCard.className = 'event-management-card';
            eventCard.innerHTML = `
                <h2>${event.title || 'Untitled Event'}</h2>
                <div class="event-details-summary">
                    <p>ID: <span>${event.id}</span></p>
                    <p>Description: <span>${event.description || 'N/A'}</span></p>
                    <p>Date: <span>${event.eventDate ? new Date(event.eventDate).toLocaleDateString() : 'N/A'}</span></p>
                    <p>Location: <span>${event.location || 'N/A'}</span></p>
                </div>
                <div class="join-requests-list" id="requests-for-event-${event.id}">
                    <h3>Join Requests</h3>
                    <p class="no-requests">Loading requests...</p>
                </div>
            `;
            myEventsList.appendChild(eventCard);

            // Fetch and display join requests for this event
            await fetchJoinRequests(event.id);
        }

    } catch (error) {
        console.error('Error loading my events:', error);
        myEventsList.innerHTML = `<p>Error loading your events: ${error.message}</p>`;
    }
}

async function fetchJoinRequests(eventId) {
    const requestsListDiv = document.getElementById(`requests-for-event-${eventId}`);
    try {
        const requestsResponse = await fetch(`${API_BASE_URL}/events/${eventId}/requests`);
        if (!requestsResponse.ok) {
            throw new Error(`HTTP error! status: ${requestsResponse.status}`);
        }
        const requests = await requestsResponse.json();

        if (requests.length === 0) {
            requestsListDiv.innerHTML = '<p class="no-requests">No join requests for this event.</p>';
            return;
        }

        requestsListDiv.innerHTML = '<h3>Join Requests</h3>'; // Reset header
        for (const request of requests) {
            const requestItem = document.createElement('div');
            requestItem.className = 'request-item';
            requestItem.innerHTML = `
                <span>User ID: ${request.user.id} - Status: ${request.status}</span>
                <div class="request-actions">
                    ${request.status === 'pending' ?
                        `<button class="approve-btn" data-request-id="${request.id}" data-event-id="${eventId}">Approve</button>` :
                        `<span class="${request.status === 'approved' ? 'status-approved' : 'status-rejected'}">${request.status}</span>`
                    }
                </div>
            `;
            requestsListDiv.appendChild(requestItem);

            // Add event listener for approve button
            if (request.status === 'pending') {
                requestItem.querySelector('.approve-btn').addEventListener('click', (e) => {
                    const requestId = e.target.dataset.requestId;
                    approveJoinRequest(requestId, eventId);
                });
            }
        }
    } catch (error) {
        console.error(`Error fetching join requests for event ${eventId}:`, error);
        requestsListDiv.innerHTML = `<p class="no-requests">Error loading requests: ${error.message}</p>`;
    }
}

async function approveJoinRequest(requestId, eventId) {
    try {
        const response = await fetch(`${API_BASE_URL}/events/requests/${requestId}/approve`, {
            method: 'POST',
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        console.log(`Join request ${requestId} for event ${eventId} approved.`);
        // Reload requests for the specific event to update status
        await fetchJoinRequests(eventId);
    } catch (error) {
        console.error(`Error approving request ${requestId}:`, error);
        alert(`Failed to approve request: ${error.message}`);
    }
}

// Helper to escape HTML for security (from previous tasks)
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}