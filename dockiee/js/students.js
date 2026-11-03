// Init
const uploadZone = document.getElementById('upload-zone');
const fileInput = document.getElementById('file-upload');
const orderConfig = document.getElementById('order-config');

// --- 1. Upload Logic ---
if (uploadZone && fileInput) {
    uploadZone.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', async (e) => {
        if (e.target.files.length > 0) {
            const file = e.target.files[0];
            const formData = new FormData();
            formData.append('file', file);

            // Update UI
            document.getElementById('upload-text').innerText = 'Uploading ' + file.name + '...';

            try {
                const res = await API.student.upload(formData);
                document.getElementById('upload-text').innerText = '✅ ' + file.name;
                document.getElementById('file-id').value = res.data.fileId;

                // Show Order Config
                orderConfig.style.display = 'block';
                window.scrollTo({ top: orderConfig.offsetTop - 100, behavior: 'smooth' });

            } catch (err) {
                document.getElementById('upload-text').innerText = 'Upload Failed';
                e.target.value = ''; // Reset
            }
        }
    });
}

// --- 2. Create Order Logic ---
const formOrder = document.getElementById('form-order');
if (formOrder) {
    formOrder.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = e.target.querySelector('button');
        const originalText = btn.innerText;
        btn.innerText = 'Processing...';
        btn.disabled = true;

        const orderData = {
            fileId: document.getElementById('file-id').value,
            printerId: document.getElementById('printer-id').value,
            pages: document.getElementById('order-pages').value,
            printType: document.getElementById('order-type').value
        };

        try {
            await API.student.createOrder(orderData);
            alert('Order Placed Successfully!');
            orderConfig.style.display = 'none'; // Hide form
            loadOrders(); // Refresh table
        } catch (err) {
            // Handled
        } finally {
            btn.innerText = originalText;
            btn.disabled = false;
        }
    });
}

// --- 3. Load History ---
async function loadOrders() {
    try {
        const res = await API.student.getOrders();
        const tbody = document.getElementById('orders-table-body');
        if (!tbody) return;

        tbody.innerHTML = '';

        res.data.orders.forEach(order => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${API.formatDate(order.created_at)}</td>
                <td style="font-family: monospace; font-weight: 700;">${order.order_code}</td>
                <td>${order.original_name}</td>
                <td>${order.printer_name}</td>
                <td>
                    <span class="badge" style="background: ${getStatusColor(order.status)};">
                        ${order.status}
                    </span>
                </td>
                <td>${API.formatCurrency(order.total_price)}</td>
            `;
            tbody.appendChild(tr);
        });
    } catch (err) {
        console.error(err);
    }
}

function getStatusColor(status) {
    switch (status) {
        case 'completed': return '#20C997'; // Primary
        case 'printing': return '#339AF0'; // Blue
        case 'accepted': return '#FCC419'; // Yellow
        case 'pending': return '#adb5bd'; // Gray
        default: return '#adb5bd';
    }
}

// On Load
loadOrders();
