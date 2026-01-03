async function fetchData() {
    const response = await fetch('/api/data');
    const data = await response.json();
    
    const tableBody = document.querySelector('#appointmentsTable tbody');
    tableBody.innerHTML = '';

    const probabilities = {};
    const bestSlots = data.best_slots;

    data.table_data.forEach(item => {
        probabilities[item.time] = item.probability;

        const row = document.createElement('tr');
        if(item.best_slot) row.classList.add('best-slot');

        row.innerHTML = `
            <td>${item.time}</td>
            <td>${item.occupied ? "Yes" : "No"}</td>
            <td>${item.probability}</td>
            <td>${item.best_slot ? `<button onclick="bookSlot('${item.time}')">Book</button>` : ''}</td>
        `;
        tableBody.appendChild(row);
    });

    document.getElementById('bestSlots').textContent = bestSlots.join(', ');

    const ctx = document.getElementById('confidenceChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(probabilities),
            datasets: [{
                label: 'No-Show Probability',
                data: Object.values(probabilities),
                backgroundColor: Object.keys(probabilities).map(time =>
                    bestSlots.includes(time) ? 'rgba(144,238,144,0.8)' : 'rgba(54,162,235,0.6)'
                )
            }]
        },
        options: { scales: { y: { beginAtZero: true, max: 1 } } }
    });
}

async function bookSlot(slot) {
    const response = await fetch('/api/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slot })
    });
    const result = await response.json();
    if(result.status === 'success') fetchData();
}

// Initial load
fetchData();
