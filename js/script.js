let orderCounter = 1; // Global counter for order numbers
let stopChecking = false; // Global flag to stop checking status

document.addEventListener('DOMContentLoaded', (event) => {
    loadOrdersFromLocalStorage();
});

function orderNumbers() {
    var service = document.getElementById('service').value;
    var country = document.getElementById('country').value;
    var maxPrice = document.getElementById('maxPrice').value;
    var quantity = document.getElementById('quantity').value;
    
    stopChecking = false; // Reset the flag
    for (let i = 0; i < quantity; i++) {
        orderNumber(service, country, maxPrice);
    }
}

function orderNumber(service, country, maxPrice) {
    var phoneException = ''; // Add logic if you want to get this from user
    var ref = ''; // Add logic if you want to get this from user

    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'order.php?service=' + service + '&country=' + country + '&maxPrice=' + maxPrice + '&phoneException=' + phoneException + '&ref=' + ref, true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
            var response = xhr.responseText.split(':');
            if(response[0] === "ACCESS_NUMBER") {
                var id = response[1];
                var number = response[2];
                addOrderToTable(id, number, "Pending"); // Add order to table
                saveOrderToLocalStorage(id, number, "Pending");
                checkStatus(id, 0);
            } else if (response[0] === "NO_NUMBER") {
                alert("No numbers available for this service and country. Retrying...");
                setTimeout(function() {
                    orderNumber(service, country, maxPrice); // Retry order after a delay
                }, 10000); // Retry after 30 seconds (adjust as needed)
            } else {
                alert("Error: " + xhr.responseText);
            }
        }
    };
    xhr.send();
}

function addOrderToTable(id, number, status) {
    var table = document.getElementById('orderTable').getElementsByTagName('tbody')[0];
    var newRow = table.insertRow();

    var cellIndex = newRow.insertCell(0); // New cell for index
    var cellId = newRow.insertCell(1);
    var cellNumber = newRow.insertCell(2);
    var cellStatus = newRow.insertCell(3);

    cellIndex.innerText = table.rows.length; // Set index as row number
    cellId.innerText = id;
    cellNumber.innerText = number;
    cellStatus.innerText = status;
    cellStatus.id = `status-${id}`;

    newRow.id = `row-${id}`; // Set the row ID
}

function checkStatus(id, count) {
    if (count >= 30 || stopChecking) {
        if (!stopChecking) {
            cancelOrderAPI(id);
        }
        return;
    }

    setTimeout(function() {
        if (stopChecking) return;

        var xhr = new XMLHttpRequest();
        xhr.open('GET', 'getStatus.php?id=' + id, true);
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    var response = xhr.responseText;
                    if (response.startsWith('STATUS_WAIT_CODE')) {
                        document.getElementById(`status-${id}`).innerText = "Wait sms code";
                        updateOrderStatusInLocalStorage(id, "Wait sms code");
                        checkStatus(id, count + 1);
                    } else if (response.startsWith('STATUS_OK')) {
                        var code = response.split(':')[1];
                        document.getElementById(`status-${id}`).innerText = "SMS Code: " + code;
                        updateOrderStatusInLocalStorage(id, "SMS Code: " + code);
                    } else {
                        console.error("Unexpected response:", response); // Log unexpected response
                        document.getElementById(`status-${id}`).innerText = "Unexpected response";
                        updateOrderStatusInLocalStorage(id, "Unexpected response");
                    }
                } else {
                    console.error("Request failed. Status:", xhr.status); // Log request failure
                    document.getElementById(`status-${id}`).innerText = "Request failed";
                    updateOrderStatusInLocalStorage(id, "Request failed");
                }
            }
        };

        // Set timeout for the request
        xhr.timeout = 60000; // 60 seconds
        xhr.ontimeout = function() {
            console.error("Request timed out after 60 seconds.");
            document.getElementById(`status-${id}`).innerText = "Request timed out";
            updateOrderStatusInLocalStorage(id, "Request timed out");
        };

        xhr.send();
    }, 30000); // 20 seconds interval
}

function completeOrderAPI(id) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'completeOrder.php?id=' + id, true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
            document.getElementById(`status-${id}`).innerText = "Completed";
            removeOrderFromLocalStorage(id);
            removeRow(id); // Remove row after status update
        }
    };
    xhr.send();
}

// Fungsi untuk memulai operasi "Cancel All"
function cancelAll() {
    stopChecking = true; // Set flag to stop checking status
    var table = document.getElementById('orderTable').getElementsByTagName('tbody')[0];
    var rows = table.getElementsByTagName('tr');
    var ids = [];

    // Collect IDs of orders to cancel
    for (var i = 0; i < rows.length; i++) {
        var id = rows[i].cells[1].innerText; // Get ID from table cell
        var status = rows[i].cells[3].innerText; // Get status from table cell
        if (status !== "SMS Code: ") { // Check if status does not contain "SMS Code: "
            ids.push(id);
        }
    }

    // Send batch request to cancel orders
    sendCancelBatch(ids);
}

// Fungsi untuk mengirim batch request untuk membatalkan pesanan
function sendCancelBatch(ids) {
    var batchSize = 5; // Jumlah pesanan yang akan dikirimkan dalam satu batch
    var index = 0;

    function processBatch() {
        var batchIds = ids.slice(index, index + batchSize); // Ambil sejumlah ID dari indeks tertentu

        // Kirim request untuk membatalkan batch pesanan
        var xhr = new XMLHttpRequest();
        xhr.open('POST', 'cancelAll.php', true);
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4 && xhr.status === 200) {
                var response = JSON.parse(xhr.responseText);
                if (response.status === 'success') {
                    // Update UI for cancelled orders
                    batchIds.forEach(id => {
                        document.getElementById(`status-${id}`).innerText = "Cancelled";
                        removeOrderFromLocalStorage(id);
                        removeRow(id); // Remove row after status update
                    });
                } else {
                    alert("Failed to cancel orders");
                }

                // Proses batch berikutnya jika masih ada
                index += batchSize;
                if (index < ids.length) {
                    processBatch();
                } else {
                    stopChecking = false; // Reset flag setelah selesai
                }
            }
        };
        xhr.send('ids=' + JSON.stringify(batchIds));
    }

    // Mulai proses batch
    processBatch();
}

// Fungsi untuk memulai operasi "Complete All"
function completeAll() {
    stopChecking = true; // Set flag to stop checking status
    var table = document.getElementById('orderTable').getElementsByTagName('tbody')[0];
    var rows = table.getElementsByTagName('tr');
    var ids = [];

    // Collect IDs of orders to complete
    for (var i = 0; i < rows.length; i++) {
        var id = rows[i].cells[1].innerText; // Get ID from table cell
        var status = rows[i].cells[3].innerText; // Get status from table cell
        if (status.startsWith("SMS Code:")) { // Check if status starts with "SMS Code:"
            ids.push(id);
        }
    }

    // Send batch request to complete orders
    sendCompleteBatch(ids);
}

// Fungsi untuk mengirim batch request untuk menyelesaikan pesanan
function sendCompleteBatch(ids) {
    var batchSize = 5; // Jumlah pesanan yang akan dikirimkan dalam satu batch
    var index = 0;

    function processBatch() {
        var batchIds = ids.slice(index, index + batchSize); // Ambil sejumlah ID dari indeks tertentu

        // Kirim request untuk menyelesaikan batch pesanan
        var xhr = new XMLHttpRequest();
        xhr.open('POST', 'completeAll.php', true);
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4 && xhr.status === 200) {
                var response = JSON.parse(xhr.responseText);
                if (response.status === 'success') {
                    // Update UI for completed orders
                    batchIds.forEach(id => {
                        document.getElementById(`status-${id}`).innerText = "Completed";
                        removeOrderFromLocalStorage(id);
                        removeRow(id); // Remove row after status update
                    });
                } else {
                    alert("Failed to complete orders");
                }

                // Proses batch berikutnya jika masih ada
                index += batchSize;
                if (index < ids.length) {
                    processBatch();
                } else {
                    stopChecking = false; // Reset flag setelah selesai
                }
            }
        };
        xhr.send('ids=' + JSON.stringify(batchIds));
    }

    // Mulai proses batch
    processBatch();
}


// Function to send batch request
function sendBatchRequest(url, ids) {
    return new Promise(function(resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.open('POST', url, true);
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    var responses = JSON.parse(xhr.responseText);
                    resolve(responses);
                } else {
                    reject("HTTP error: " + xhr.status);
                }
            }
        };
        xhr.send('ids=' + JSON.stringify(ids));
    });
}

function removeRow(id) {
    var row = document.getElementById(`row-${id}`);
    if (row) {
        row.parentNode.removeChild(row);
    }
}

// LocalStorage functions
function saveOrderToLocalStorage(id, number, status) {
    let orders = JSON.parse(localStorage.getItem('orders')) || [];
    orders.push({ id, number, status });
    localStorage.setItem('orders', JSON.stringify(orders));
}

function updateOrderStatusInLocalStorage(id, status) {
    let orders = JSON.parse(localStorage.getItem('orders')) || [];
    orders = orders.map(order => order.id === id ? { ...order, status } : order);
    localStorage.setItem('orders', JSON.stringify(orders));
}

function removeOrderFromLocalStorage(id) {
    let orders = JSON.parse(localStorage.getItem('orders')) || [];
    orders = orders.filter(order => order.id !== id);
    localStorage.setItem('orders', JSON.stringify(orders));
}

function loadOrdersFromLocalStorage() {
    let orders = JSON.parse(localStorage.getItem('orders')) || [];
    orders.forEach(order => {
        addOrderToTable(order.id, order.number, order.status);
        if(order.status === "Pending" || order.status === "Wait sms code") {
            checkStatus(order.id, 0);
        }
    });
}
