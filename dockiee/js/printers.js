// Init
const toggle = document.getElementById('status-toggle');
const statusText = document.getElementById('status-text');

// --- 1. Load Dashboard ---
async function loadDashboard() {
    try {
        const res = await API.printer.getDashboard();
        const { profile, activeOrders, lifetimeEarnings } = res.data;

        // Update Stats
        if (toggle) toggle.checked = !!profile.is_active_for_work;
        updateStatusText(toggle ? toggle.checked : false);

        const earningsEl = document.getElementById('stats-earnings');
        if (earningsEl) earningsEl.innerText = API.formatCurrency(lifetimeEarnings);

        const jobsEl = document.getElementById('stats-jobs');
        if (jobsEl) jobsEl.innerText = profile.total_jobs;

        // Render Queue
        renderQueue(activeOrders);

    } catch (err) {
        console.error(err);
        if (err.message.includes('not found')) {
            alert('Printer profile not found. Did you register as a printer?');
        }
    }
}

function updateStatusText(isActive) {
    if (!statusText) return;
    statusText.innerText = isActive ? 'Active (Online)' : 'Inactive (Offline)';
    statusText.style.color = isActive ? '#20C997' : '#8A8A95';
}

function renderQueue(orders) {
    const container = document.getElementById('queue-container');
    if (!container) return;
    container.innerHTML = '';

    if (orders.length === 0) {
        container.innerHTML = '<div style="padding: 2rem; text-align: center; color: var(--dockie-muted);">No active jobs.</div>';
        return;
    }

    orders.forEach(order => {
        const div = document.createElement('div');
        div.style.padding = '1.5rem';
        div.style.borderBottom = '1px solid var(--dockie-border)';
        div.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: start; flex-wrap: wrap; gap: 1rem;">
                <div>
                    <div style="font-weight: 700; font-size: 1.1rem; margin-bottom: 0.25rem;">
                        Order #${order.order_code} 
                        <span style="font-size: 0.8rem; font-weight: normal; color: var(--dockie-muted); margin-left: 0.5rem;">${API.formatDate(order.created_at)}</span>
                    </div>
                    <div style="color: var(--dockie-primary); font-weight: 500; margin-bottom: 0.5rem;">${order.student_name}</div>
                    <div style="display: flex; gap: 1rem; font-size: 0.9rem; color: var(--dockie-muted);">
                        <span>📄 ${order.pages} Pages</span>
                        <span>🎨 ${order.print_type === 'bw' ? 'B&W' : 'Color'}</span>
                        <span>attachment: ${order.original_name}</span>
                    </div>
                </div>
                <div style="text-align: right;">
                     <div style="font-size: 1.5rem; font-weight: 700; margin-bottom: 0.5rem;">${API.formatCurrency(order.printer_earning)}</div>
                     ${getActionButtons(order)}
                </div>
            </div>
        `;
        container.appendChild(div);
    });
}

function getActionButtons(order) {
    if (order.status === 'pending') {
        return `<button class="btn btn-primary" onclick="updateOrder(${order.id}, 'accepted')">Accept Job</button>`;
    } else if (order.status === 'accepted') {
        return `<button class="btn btn-primary" style="background:#339AF0;" onclick="updateOrder(${order.id}, 'printing')">Start Printing</button>`;
    } else if (order.status === 'printing') {
        return `<button class="btn btn-primary" style="background:#FCC419; color:black;" onclick="updateOrder(${order.id}, 'completed')">Mark Complete</button>`;
    }
    return '';
}

// --- 2. Toggle Logic ---
if (toggle) {
    toggle.addEventListener('change', async (e) => {
        const isActive = e.target.checked;
        updateStatusText(isActive); // Optimistic UI
        try {
            await API.printer.toggleStatus(isActive);
        } catch (err) {
            toggle.checked = !isActive; // Revert
            updateStatusText(!isActive);
        }
    });
}

// --- 3. Update Order Logic ---
window.updateOrder = async (orderId, status) => {
    if (!confirm(`Update order status to ${status}?`)) return;
    try {
        await API.printer.updateOrderStatus(orderId, status);
        loadDashboard(); // Refresh
    } catch (err) {
        // Handled
    }
};

// On Load
loadDashboard();
