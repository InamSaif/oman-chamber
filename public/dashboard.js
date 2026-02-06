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
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Serial No.</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vessel Name</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expires</th>
                    <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
                ${documents.map(doc => `
                    <tr>
                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${doc.serialNo}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${doc.formData?.VESSEL_NAME || '-'}</td>
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
    
    // Clear crew members
    const container = document.getElementById('crewMembersContainer');
    container.innerHTML = '<p class="text-sm text-gray-600 text-center py-4">No crew members added yet. Click "Add Crew Member" to start.</p>';
    crewMemberCount = 0;
    
    document.getElementById('documentModal').classList.remove('hidden');
}

// Close modal
function closeModal() {
    document.getElementById('documentModal').classList.add('hidden');
    document.getElementById('documentForm').reset();
    
    // Clear crew members
    const container = document.getElementById('crewMembersContainer');
    container.innerHTML = '<p class="text-sm text-gray-600 text-center py-4">No crew members added yet. Click "Add Crew Member" to start.</p>';
    crewMemberCount = 0;
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
            // New Sail Certificate fields
            'CERTIFICATE_NUMBER', 'VESSEL_NAME', 'VESSEL_NAME_AR',
            'VESSEL_NATIONALITY', 'VESSEL_NATIONALITY_AR', 'FLAG', 'FLAG_AR',
            'VESSEL_AGENT_NAME', 'VESSEL_AGENT_NAME_AR', 'PORT_OF_DEPARTURE', 'PORT_OF_DEPARTURE_AR',
            'NEXT_PORT_OF_CALL', 'NEXT_PORT_OF_CALL_AR', 'VOYAGE_NUMBER',
            'CAPTAIN_NAME', 'CAPTAIN_NAME_AR', 'ETD', 'CUSTOMS_REMARKS',
            'ISSUANCE_DATE', 'IMO_NUMBER',
            
            // Legacy fields (for backward compatibility)
            'SERIAL_NO', 'SERIAL_NO_FA', 'MARINE_AFFAIRS_NO', 'MARINE_AFFAIRS_NO_FA',
            'ISSUE_DATE_TIME', 'ISSUE_DATE_TIME_FA', 'PORT_CLEARANCE_NO', 'PORT_CLEARANCE_NO_FA',
            'CUSTOM_LEAVE_NO', 'CUSTOM_LEAVE_NO_FA', 'AGENT', 'AGENT_FA',
            'VESSEL_NAME_FA', 'ARRIVED_FROM', 'ARRIVED_FROM_FA',
            'ON_DATE', 'ON_DATE_FA', 'IMO_NO', 'IMO_NO_FA',
            'SHIPS_FLAG', 'SHIPS_FLAG_FA', 'REGISTRY_PORT', 'REGISTRY_PORT_FA',
            'GROSS_TONNAGE', 'GROSS_TONNAGE_FA', 'MASTER', 'MASTER_FA',
            'PERMITTED_TO_SAIL', 'PERMITTED_TO_SAIL_FA', 'HEAD_OF_MARITIME', 'HEAD_OF_MARITIME_FA',
            'PORT', 'PORT_FA'
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
        
        // Add crew members
        const crewMembers = getCrewMembers();
        if (crewMembers.length > 0) {
            formData.CREW_MEMBERS = crewMembers;
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
            // Skip CREW_MEMBERS as it needs special handling
            if (field === 'CREW_MEMBERS') return;
            
            const input = document.getElementById(field);
            if (input) {
                input.value = doc.formData[field] || '';
            }
        });
        
        // Load crew members if they exist
        const crewMembers = doc.formData.CREW_MEMBERS;
        if (crewMembers && Array.isArray(crewMembers) && crewMembers.length > 0) {
            // Clear existing crew members
            const container = document.getElementById('crewMembersContainer');
            container.innerHTML = '';
            crewMemberCount = 0;
            
            // Add each crew member
            crewMembers.forEach((crew, index) => {
                addCrewMember();
                
                // Fill the crew member data
                setTimeout(() => {
                    const crewElements = document.querySelectorAll('.crew-member');
                    const currentCrew = crewElements[index];
                    
                    if (currentCrew) {
                        if (crew.nameAr) currentCrew.querySelector('.crew-nameAr').value = crew.nameAr;
                        if (crew.positionEn) currentCrew.querySelector('.crew-positionEn').value = crew.positionEn;
                        if (crew.positionAr) currentCrew.querySelector('.crew-positionAr').value = crew.positionAr;
                        if (crew.nationalityEn) currentCrew.querySelector('.crew-nationalityEn').value = crew.nationalityEn;
                        if (crew.nationalityAr) currentCrew.querySelector('.crew-nationalityAr').value = crew.nationalityAr;
                        if (crew.dateOfBirth) currentCrew.querySelector('.crew-dateOfBirth').value = crew.dateOfBirth;
                        if (crew.travelDocRef) currentCrew.querySelector('.crew-travelDocRef').value = crew.travelDocRef;
                        if (crew.dateOfIssue) currentCrew.querySelector('.crew-dateOfIssue').value = crew.dateOfIssue;
                        if (crew.dateOfExpiry) currentCrew.querySelector('.crew-dateOfExpiry').value = crew.dateOfExpiry;
                        if (crew.seamanBook) currentCrew.querySelector('.crew-seamanBook').value = crew.seamanBook;
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

// Crew Member Management
let crewMemberCount = 0;

function addCrewMember() {
    crewMemberCount++;
    const container = document.getElementById('crewMembersContainer');
    
    // Remove the "no crew members" message if it exists
    if (crewMemberCount === 1) {
        container.innerHTML = '';
    }
    
    const crewMemberHtml = `
        <div class="crew-member border border-gray-300 rounded-lg p-4 bg-white" data-crew-id="${crewMemberCount}">
            <div class="flex justify-between items-center mb-3">
                <h4 class="font-semibold text-gray-700">Crew Member #${crewMemberCount}</h4>
                <button type="button" onclick="removeCrewMember(${crewMemberCount})" class="text-red-600 hover:text-red-800 text-sm">
                    ✕ Remove
                </button>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                    <label class="block text-xs font-medium text-gray-600 mb-1">Name (Arabic)</label>
                    <input type="text" class="crew-nameAr w-full px-3 py-2 border border-gray-300 rounded text-sm" dir="rtl" placeholder="محمد اصف">
                </div>
                <div>
                    <label class="block text-xs font-medium text-gray-600 mb-1">Position (EN)</label>
                    <input type="text" class="crew-positionEn w-full px-3 py-2 border border-gray-300 rounded text-sm" placeholder="Captain">
                </div>
                <div>
                    <label class="block text-xs font-medium text-gray-600 mb-1">Position (AR)</label>
                    <input type="text" class="crew-positionAr w-full px-3 py-2 border border-gray-300 rounded text-sm" dir="rtl" placeholder="قبطان">
                </div>
                <div>
                    <label class="block text-xs font-medium text-gray-600 mb-1">Nationality (EN)</label>
                    <input type="text" class="crew-nationalityEn w-full px-3 py-2 border border-gray-300 rounded text-sm" placeholder="PAKISTAN">
                </div>
                <div>
                    <label class="block text-xs font-medium text-gray-600 mb-1">Nationality (AR)</label>
                    <input type="text" class="crew-nationalityAr w-full px-3 py-2 border border-gray-300 rounded text-sm" dir="rtl" placeholder="باكستان">
                </div>
                <div>
                    <label class="block text-xs font-medium text-gray-600 mb-1">Date of Birth</label>
                    <input type="text" class="crew-dateOfBirth w-full px-3 py-2 border border-gray-300 rounded text-sm" placeholder="03/10/1955">
                </div>
                <div>
                    <label class="block text-xs font-medium text-gray-600 mb-1">Travel Doc Ref No.</label>
                    <input type="text" class="crew-travelDocRef w-full px-3 py-2 border border-gray-300 rounded text-sm" placeholder="AS3174333">
                </div>
                <div>
                    <label class="block text-xs font-medium text-gray-600 mb-1">Date of Issue</label>
                    <input type="text" class="crew-dateOfIssue w-full px-3 py-2 border border-gray-300 rounded text-sm" placeholder="15/09/2021">
                </div>
                <div>
                    <label class="block text-xs font-medium text-gray-600 mb-1">Date of Expiry</label>
                    <input type="text" class="crew-dateOfExpiry w-full px-3 py-2 border border-gray-300 rounded text-sm" placeholder="14/09/2026">
                </div>
                <div>
                    <label class="block text-xs font-medium text-gray-600 mb-1">Seaman Book</label>
                    <input type="text" class="crew-seamanBook w-full px-3 py-2 border border-gray-300 rounded text-sm" placeholder="AS3174333">
                </div>
            </div>
        </div>
    `;
    
    container.insertAdjacentHTML('beforeend', crewMemberHtml);
}

function removeCrewMember(id) {
    const crewMember = document.querySelector(`[data-crew-id="${id}"]`);
    if (crewMember) {
        crewMember.remove();
    }
    
    // If no crew members left, show the message again
    const container = document.getElementById('crewMembersContainer');
    if (container.children.length === 0) {
        container.innerHTML = '<p class="text-sm text-gray-600 text-center py-4">No crew members added yet. Click "Add Crew Member" to start.</p>';
        crewMemberCount = 0;
    }
}

function getCrewMembers() {
    const crewMembers = [];
    const crewElements = document.querySelectorAll('.crew-member');
    
    crewElements.forEach(crew => {
        const member = {
            nameAr: crew.querySelector('.crew-nameAr').value.trim(),
            positionEn: crew.querySelector('.crew-positionEn').value.trim(),
            positionAr: crew.querySelector('.crew-positionAr').value.trim(),
            nationalityEn: crew.querySelector('.crew-nationalityEn').value.trim(),
            nationalityAr: crew.querySelector('.crew-nationalityAr').value.trim(),
            dateOfBirth: crew.querySelector('.crew-dateOfBirth').value.trim(),
            travelDocRef: crew.querySelector('.crew-travelDocRef').value.trim(),
            dateOfIssue: crew.querySelector('.crew-dateOfIssue').value.trim(),
            dateOfExpiry: crew.querySelector('.crew-dateOfExpiry').value.trim(),
            seamanBook: crew.querySelector('.crew-seamanBook').value.trim()
        };
        
        // Only add if at least name is filled
        if (member.nameAr) {
            crewMembers.push(member);
        }
    });
    
    return crewMembers;
}
