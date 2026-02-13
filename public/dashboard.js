// API Base URL
const API_BASE = window.location.origin;

// Check authentication
function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/login';
        return false;
    }
    return true;
}

// Get headers with auth token
function getHeaders() {
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
    };
}

// Initialize dashboard
document.addEventListener('DOMContentLoaded', async () => {
    if (!checkAuth()) return;
    
    // Load user info
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    document.getElementById('userName').textContent = user.name || 'User';
    
    // Load documents
    await loadDocuments();
});

// Load all documents
async function loadDocuments() {
    try {
        const response = await fetch(`${API_BASE}/api/documents`, {
            headers: getHeaders(),
            credentials: 'include'
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.error || 'Failed to load documents');
        }

        displayDocuments(data.documents);
        updateStats(data.documents);
    } catch (error) {
        console.error('Error loading documents:', error);
        showError('Failed to load documents: ' + error.message);
    }
}

// Display documents in table
function displayDocuments(documents) {
    const container = document.getElementById('documentsContainer');
    
    if (!documents || documents.length === 0) {
        container.innerHTML = `
            <div class="text-center py-12">
                <svg class="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
                <p class="mt-4 text-gray-600">No documents yet</p>
                <p class="text-sm text-gray-500">Create your first port clearance document</p>
                <button onclick="showCreateForm()" class="mt-4 text-primary hover:text-secondary font-medium">Create Document</button>
            </div>
        `;
        return;
    }

    const table = `
        <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
                <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Certificate No.</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Exporter</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expires</th>
                    <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
                ${documents.map(doc => `
                    <tr>
                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${doc.serialNo || doc.formData?.CERTIFICATE_NUMBER || '-'}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${doc.formData?.EXPORTER_COMPANY || '-'}</td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                doc.status === 'active' ? 'bg-green-100 text-green-800' : 
                                doc.status === 'expired' ? 'bg-yellow-100 text-yellow-800' : 
                                'bg-red-100 text-red-800'
                            }">
                                ${doc.status}
                            </span>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${new Date(doc.createdAt).toLocaleDateString()}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${doc.expiresAt ? new Date(doc.expiresAt).toLocaleDateString() : 'Never'}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                            <button onclick="viewDocument('${doc._id}')" class="text-blue-600 hover:text-blue-900">View</button>
                            <button onclick="editDocument('${doc._id}')" class="text-primary hover:text-secondary">Edit</button>
                            ${doc.status === 'active' ? `<button onclick="expireDocument('${doc._id}')" class="text-yellow-600 hover:text-yellow-900">Expire</button>` : ''}
                            <button onclick="deleteDocument('${doc._id}')" class="text-red-600 hover:text-red-900">Delete</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    
    container.innerHTML = table;
}

// Update stats
function updateStats(documents) {
    const active = documents.filter(d => d.status === 'active').length;
    const expired = documents.filter(d => d.status === 'expired').length;
    const total = documents.length;
    
    document.getElementById('activeCount').textContent = active;
    document.getElementById('expiredCount').textContent = expired;
    document.getElementById('totalCount').textContent = total;
}

// Show create form
function showCreateForm() {
    document.getElementById('modalTitle').textContent = 'Create New Document';
    document.getElementById('btnText').textContent = 'Create Document';
    document.getElementById('documentId').value = '';
    document.getElementById('documentForm').reset();
    
    // Clear products
    const container = document.getElementById('productsContainer');
    container.innerHTML = '<p class="text-sm text-gray-600 text-center py-4">No products added yet. Click "Add Product" to start.</p>';
    productCount = 0;
    
    document.getElementById('documentModal').classList.remove('hidden');
}

// Close modal
function closeModal() {
    document.getElementById('documentModal').classList.add('hidden');
    document.getElementById('documentForm').reset();
    
    // Clear products
    const container = document.getElementById('productsContainer');
    container.innerHTML = '<p class="text-sm text-gray-600 text-center py-4">No products added yet. Click "Add Product" to start.</p>';
    productCount = 0;
}

// Handle form submission
document.getElementById('documentForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const docId = document.getElementById('documentId').value;
    const submitBtn = document.getElementById('submitBtn');
    const originalText = document.getElementById('btnText').textContent;
    
    submitBtn.disabled = true;
    document.getElementById('btnText').textContent = 'Processing...';
    
    try {
        const formData = {};
        const fields = [
            // Chamber of Commerce Certificate fields
            'EXPORTER_COMPANY', 'EXPORTER_ADDRESS', 'EXPORTER_POBOX', 'EXPORTER_EMAIL',
            'IMPORTER_COMPANY', 'IMPORTER_ADDRESS', 'IMPORTER_POBOX', 'IMPORTER_EMAIL',
            'CERTIFICATE_NUMBER', 'CERTIFICATE_DATE', 'AMOUNT', 'INVOICE_NO', 'INVOICE_DATE',
            'DESTINATION_COUNTRY', 'DESTINATION_COUNTRY_AR', 'TRANSPORT_MEANS', 'PORT_OF_DISCHARGE',
            'TOTAL_WEIGHT', 'COMMENTS'
        ];
        
        fields.forEach(field => {
            const element = document.getElementById(field);
            if (element) {
                const value = element.value.trim();
                if (value) formData[field] = value;
            }
        });
        
        const expiresAt = document.getElementById('expiresAt').value;
        if (expiresAt) formData.expiresAt = new Date(expiresAt).toISOString();
        
        // Add products
        const products = getProducts();
        if (products.length > 0) {
            formData.PRODUCTS = products;
        }
        
        const url = docId ? `${API_BASE}/api/documents/${docId}` : `${API_BASE}/api/documents`;
        const method = docId ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method,
            headers: getHeaders(),
            body: JSON.stringify(formData),
            credentials: 'include'
        });
        
        const data = await response.json();
        
        if (!response.ok || !data.success) {
            throw new Error(data.error || 'Failed to save document');
        }
        
        showSuccess(docId ? 'Document updated successfully!' : 'Document created successfully!');
        closeModal();
        await loadDocuments();
    } catch (error) {
        showError(error.message);
        console.error('Error saving document:', error);
    } finally {
        submitBtn.disabled = false;
        document.getElementById('btnText').textContent = originalText;
    }
});

// View document
async function viewDocument(id) {
    try {
        const response = await fetch(`${API_BASE}/api/documents/${id}`, {
            headers: getHeaders(),
            credentials: 'include'
        });
        
        const data = await response.json();
        
        if (!response.ok || !data.success) {
            throw new Error(data.error || 'Failed to load document');
        }
        
        window.open(data.document.pdfUrl, '_blank');
    } catch (error) {
        showError('Failed to view document: ' + error.message);
    }
}

// Edit document
async function editDocument(id) {
    try {
        const response = await fetch(`${API_BASE}/api/documents/${id}`, {
            headers: getHeaders(),
            credentials: 'include'
        });
        
        const data = await response.json();
        
        if (!response.ok || !data.success) {
            throw new Error(data.error || 'Failed to load document');
        }
        
        const doc = data.document;
        
        document.getElementById('modalTitle').textContent = 'Edit Document';
        document.getElementById('btnText').textContent = 'Update Document';
        document.getElementById('documentId').value = doc._id;
        
        // Fill form fields
        const fields = Object.keys(doc.formData || {});
        fields.forEach(field => {
            // Skip PRODUCTS as it needs special handling
            if (field === 'PRODUCTS') return;
            
            const input = document.getElementById(field);
            if (input) {
                // Handle date fields
                if (field === 'CERTIFICATE_DATE' || field === 'INVOICE_DATE') {
                    const date = new Date(doc.formData[field]);
                    input.value = date.toISOString().split('T')[0];
                } else {
                    input.value = doc.formData[field] || '';
                }
            }
        });
        
        // Load products if they exist
        const products = doc.formData.PRODUCTS;
        if (products && Array.isArray(products) && products.length > 0) {
            // Clear existing products
            const container = document.getElementById('productsContainer');
            container.innerHTML = '';
            productCount = 0;
            
            // Add each product
            products.forEach((product, index) => {
                addProduct();
                
                // Fill the product data
                setTimeout(() => {
                    const productElements = document.querySelectorAll('.product-item');
                    const currentProduct = productElements[index];
                    
                    if (currentProduct) {
                        if (product.marksNumbers) currentProduct.querySelector('.product-marksNumbers').value = product.marksNumbers;
                        if (product.description) currentProduct.querySelector('.product-description').value = product.description;
                        if (product.originCountry) currentProduct.querySelector('.product-originCountry').value = product.originCountry;
                        if (product.processingType) currentProduct.querySelector('.product-processingType').value = product.processingType;
                        if (product.processingCountry) currentProduct.querySelector('.product-processingCountry').value = product.processingCountry;
                        if (product.quantity) currentProduct.querySelector('.product-quantity').value = product.quantity;
                        if (product.unit) currentProduct.querySelector('.product-unit').value = product.unit;
                    }
                }, 50 * (index + 1));
            });
        }
        
        if (doc.expiresAt) {
            const date = new Date(doc.expiresAt);
            document.getElementById('expiresAt').value = date.toISOString().slice(0, 16);
        }
        
        document.getElementById('documentModal').classList.remove('hidden');
    } catch (error) {
        showError('Failed to load document: ' + error.message);
    }
}

// Delete document
async function deleteDocument(id) {
    if (!confirm('Are you sure you want to delete this document? This action cannot be undone.')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/api/documents/${id}`, {
            method: 'DELETE',
            headers: getHeaders(),
            credentials: 'include'
        });
        
        const data = await response.json();
        
        if (!response.ok || !data.success) {
            throw new Error(data.error || 'Failed to delete document');
        }
        
        showSuccess('Document deleted successfully!');
        await loadDocuments();
    } catch (error) {
        showError('Failed to delete document: ' + error.message);
    }
}

// Expire document
async function expireDocument(id) {
    if (!confirm('Are you sure you want to expire this document? The QR code will stop working.')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/api/documents/${id}/expire`, {
            method: 'PUT',
            headers: getHeaders(),
            credentials: 'include'
        });
        
        const data = await response.json();
        
        if (!response.ok || !data.success) {
            throw new Error(data.error || 'Failed to expire document');
        }
        
        showSuccess('Document expired successfully!');
        await loadDocuments();
    } catch (error) {
        showError('Failed to expire document: ' + error.message);
    }
}

// Logout
async function logout() {
    try {
        await fetch(`${API_BASE}/api/auth/logout`, {
            method: 'GET',
            headers: getHeaders(),
            credentials: 'include'
        });
    } catch (error) {
        console.error('Logout error:', error);
    } finally {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
    }
}

// Show success message
function showSuccess(message) {
    window.alert('Success: ' + message);
}

// Show error message with custom modal (cannot be blocked by browser)
function showError(message) {
    console.log('=== SHOWERROR CALLED ===');
    console.log('Message:', message);
    
    // Create modal overlay
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); z-index: 99999; display: flex; align-items: center; justify-content: center;';
    
    // Create modal box
    const modal = document.createElement('div');
    modal.style.cssText = 'background: white; padding: 30px; border-radius: 10px; max-width: 500px; box-shadow: 0 4px 20px rgba(0,0,0,0.3);';
    
    // Create content
    modal.innerHTML = `
        <h2 style="color: #dc2626; margin: 0 0 15px 0; font-size: 20px; font-weight: bold;">❌ Error</h2>
        <p style="margin: 0 0 20px 0; color: #333; font-size: 16px; line-height: 1.5;">${message}</p>
        <button id="errorOkBtn" style="background: #dc2626; color: white; border: none; padding: 10px 30px; border-radius: 5px; font-size: 16px; cursor: pointer; font-weight: bold;">OK</button>
    `;
    
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    
    // Focus on OK button
    setTimeout(() => {
        const okBtn = document.getElementById('errorOkBtn');
        okBtn.focus();
        
        // Close on click
        okBtn.onclick = () => {
            document.body.removeChild(overlay);
            console.log('=== ERROR MODAL DISMISSED ===');
        };
        
        // Close on Enter key
        okBtn.onkeypress = (e) => {
            if (e.key === 'Enter') {
                document.body.removeChild(overlay);
                console.log('=== ERROR MODAL DISMISSED ===');
            }
        };
    }, 100);
}

// Product Management
let productCount = 0;

function addProduct() {
    productCount++;
    const container = document.getElementById('productsContainer');
    
    // Remove the "no products" message if it exists
    if (productCount === 1) {
        container.innerHTML = '';
    }
    
    const productHtml = `
        <div class="product-item border border-gray-300 rounded-lg p-4 bg-white" data-product-id="${productCount}">
            <div class="flex justify-between items-center mb-3">
                <h4 class="font-semibold text-gray-700">Product #${productCount}</h4>
                <button type="button" onclick="removeProduct(${productCount})" class="text-red-600 hover:text-red-800 text-sm">
                    ✕ Remove
                </button>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                    <label class="block text-xs font-medium text-gray-600 mb-1">Marks & Numbers</label>
                    <input type="text" class="product-marksNumbers w-full px-3 py-2 border border-gray-300 rounded text-sm" placeholder="271012399999">
                </div>
                <div>
                    <label class="block text-xs font-medium text-gray-600 mb-1">Description</label>
                    <input type="text" class="product-description w-full px-3 py-2 border border-gray-300 rounded text-sm" placeholder="GAS OIL">
                </div>
                <div>
                    <label class="block text-xs font-medium text-gray-600 mb-1">Origin Country</label>
                    <input type="text" class="product-originCountry w-full px-3 py-2 border border-gray-300 rounded text-sm" placeholder="Iraq">
                </div>
                <div>
                    <label class="block text-xs font-medium text-gray-600 mb-1">Processing Type</label>
                    <input type="text" class="product-processingType w-full px-3 py-2 border border-gray-300 rounded text-sm" placeholder="Processed In">
                </div>
                <div>
                    <label class="block text-xs font-medium text-gray-600 mb-1">Processing Country</label>
                    <input type="text" class="product-processingCountry w-full px-3 py-2 border border-gray-300 rounded text-sm" placeholder="Oman">
                </div>
                <div>
                    <label class="block text-xs font-medium text-gray-600 mb-1">Quantity</label>
                    <input type="text" class="product-quantity w-full px-3 py-2 border border-gray-300 rounded text-sm" placeholder="1950">
                </div>
                <div class="md:col-span-2">
                    <label class="block text-xs font-medium text-gray-600 mb-1">Unit</label>
                    <input type="text" class="product-unit w-full px-3 py-2 border border-gray-300 rounded text-sm" placeholder="Ton">
                </div>
            </div>
        </div>
    `;
    
    container.insertAdjacentHTML('beforeend', productHtml);
}

function removeProduct(id) {
    const product = document.querySelector(`[data-product-id="${id}"]`);
    if (product) {
        product.remove();
    }
    
    // If no products left, show the message again
    const container = document.getElementById('productsContainer');
    if (container.children.length === 0) {
        container.innerHTML = '<p class="text-sm text-gray-600 text-center py-4">No products added yet. Click "Add Product" to start.</p>';
        productCount = 0;
    }
}

function getProducts() {
    const products = [];
    const productElements = document.querySelectorAll('.product-item');
    
    productElements.forEach(productEl => {
        const product = {
            marksNumbers: productEl.querySelector('.product-marksNumbers').value.trim(),
            description: productEl.querySelector('.product-description').value.trim(),
            originCountry: productEl.querySelector('.product-originCountry').value.trim(),
            processingType: productEl.querySelector('.product-processingType').value.trim(),
            processingCountry: productEl.querySelector('.product-processingCountry').value.trim(),
            quantity: productEl.querySelector('.product-quantity').value.trim(),
            unit: productEl.querySelector('.product-unit').value.trim()
        };
        
        // Only add if at least description is filled
        if (product.description) {
            products.push(product);
        }
    });
    
    return products;
}
