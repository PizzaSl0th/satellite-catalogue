/**
 * Satellite Catalogue Application
 * ================================
 * Interactive satellite architecture browser with editing capabilities.
 * No server required - works directly from the file system.
 *
 * Satellites are loaded from individual .js files in the satellites/ folder.
 * Edits are saved to localStorage and merged with file-based data.
 */

// ==================== CONFIGURATION ====================
const STORAGE_KEY = 'satellite-catalogue-edits';

// ==================== STATE ====================
let satellites = [];
let currentSatellite = null;
let currentSatelliteIndex = -1;
let currentPath = [];
let selectedNode = null;
let selectedNodeIndex = -1;
let editTarget = null;
let deleteCallback = null;

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    loadData();
    renderSatelliteBubbles();
    setupEventListeners();
}

// ==================== DATA MANAGEMENT ====================
function loadData() {
    // Start with satellites from individual files
    satellites = JSON.parse(JSON.stringify(SATELLITE_FILES));

    // Load any edits/additions from localStorage
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
        try {
            const edits = JSON.parse(stored);

            // Apply edits to existing satellites
            if (edits.modified) {
                edits.modified.forEach(function(mod) {
                    const index = satellites.findIndex(function(s) { return s.id === mod.id; });
                    if (index > -1) {
                        satellites[index] = mod;
                    }
                });
            }

            // Add new satellites
            if (edits.added) {
                edits.added.forEach(function(sat) {
                    if (!satellites.find(function(s) { return s.id === sat.id; })) {
                        satellites.push(sat);
                    }
                });
            }

            // Remove deleted satellites
            if (edits.deleted) {
                edits.deleted.forEach(function(id) {
                    const index = satellites.findIndex(function(s) { return s.id === id; });
                    if (index > -1) {
                        satellites.splice(index, 1);
                    }
                });
            }
        } catch (e) {
            console.error('Failed to load edits:', e);
        }
    }
}

function saveData() {
    // Determine what has changed from the original files
    const edits = {
        modified: [],
        added: [],
        deleted: []
    };

    // Find modified and added satellites
    satellites.forEach(function(sat) {
        const original = SATELLITE_FILES.find(function(s) { return s.id === sat.id; });
        if (!original) {
            // This is a new satellite
            edits.added.push(sat);
        } else if (JSON.stringify(sat) !== JSON.stringify(original)) {
            // This satellite was modified
            edits.modified.push(sat);
        }
    });

    // Find deleted satellites
    SATELLITE_FILES.forEach(function(original) {
        if (!satellites.find(function(s) { return s.id === original.id; })) {
            edits.deleted.push(original.id);
        }
    });

    localStorage.setItem(STORAGE_KEY, JSON.stringify(edits));
}

function generateId() {
    return 'sat-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
}

// ==================== IMAGE UPLOAD ====================
function uploadImage(file) {
    // Check file size (limit to 2MB for localStorage)
    if (file.size > 2 * 1024 * 1024) {
        showToast('Image too large (max 2MB)', 'error');
        return;
    }

    var reader = new FileReader();
    reader.onload = function(e) {
        var imageData = e.target.result;

        // Determine what to update
        if (selectedNode) {
            // Update the selected module's image
            selectedNode.image = imageData;
            updateImage(imageData, selectedNode.name);
        } else {
            // Update the current satellite's image
            currentSatellite.image = imageData;
            updateImage(imageData, currentSatellite.name);
        }

        saveData();
        showToast('Image uploaded!', 'success');
    };
    reader.onerror = function() {
        showToast('Failed to read image', 'error');
    };
    reader.readAsDataURL(file);
}

// ==================== EXPORT / IMPORT ====================
function exportData() {
    const dataStr = JSON.stringify(satellites, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'satellite-catalogue-export.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(url);
    showToast('Data exported!', 'success');
}

function importData(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const imported = JSON.parse(e.target.result);
            if (Array.isArray(imported)) {
                satellites = imported;
                saveData();
                renderSatelliteBubbles();
                showToast('Data imported!', 'success');
            } else {
                showToast('Invalid format', 'error');
            }
        } catch (err) {
            showToast('Failed to parse', 'error');
        }
    };
    reader.readAsText(file);
}

// ==================== RENDER BUBBLES ====================
function renderSatelliteBubbles() {
    var container = document.getElementById('satellite-bubbles');

    if (satellites.length === 0) {
        container.innerHTML = '<div class="empty-state"><div class="icon">🛰️</div><p>No satellites yet. Click "Add Satellite" to create one!</p></div>';
        return;
    }

    var html = '';
    for (var i = 0; i < satellites.length; i++) {
        var sat = satellites[i];
        html += '<div class="satellite-bubble" data-index="' + i + '">';
        html += '<span class="icon">' + (sat.icon || '🛰️') + '</span>';
        html += '<span class="name">' + sat.name + '</span>';
        html += '<span class="type">' + (sat.type || 'Satellite') + '</span>';
        html += '</div>';
    }
    container.innerHTML = html;

    // Add click handlers using event delegation
    var bubbles = container.querySelectorAll('.satellite-bubble');
    for (var j = 0; j < bubbles.length; j++) {
        (function(bubble) {
            bubble.onclick = function() {
                var index = parseInt(this.getAttribute('data-index'));
                selectSatellite(index);
            };
        })(bubbles[j]);
    }
}

// ==================== SELECT SATELLITE ====================
function selectSatellite(index) {
    currentSatellite = satellites[index];
    currentSatelliteIndex = index;
    currentPath = [];
    selectedNode = null;
    selectedNodeIndex = -1;

    // Update header
    var headerBubble = document.getElementById('header-bubble');
    headerBubble.innerHTML = '<span class="icon">' + (currentSatellite.icon || '🛰️') + '</span><span class="name">' + currentSatellite.name + '</span>';

    // Switch screens
    document.getElementById('home-screen').classList.remove('active');
    document.getElementById('detail-screen').classList.add('active');

    // Initialize view
    updateImage(currentSatellite.image, currentSatellite.name);
    updateInfo(currentSatellite.name, currentSatellite.description);
    renderTree(currentSatellite.modules || []);
    updateBreadcrumb();
}

// ==================== RENDER DECISION TREE ====================
function renderTree(nodes) {
    var container = document.getElementById('decision-tree');

    if (!nodes || nodes.length === 0) {
        container.innerHTML = '<div class="empty-state"><p>No components yet. Click "+ Add Module" to add one.</p></div>';
        return;
    }

    var html = '';
    for (var i = 0; i < nodes.length; i++) {
        var node = nodes[i];
        html += '<div class="tree-node" data-index="' + i + '">';
        html += '<div class="node-icon">' + (node.icon || '📦') + '</div>';
        html += '<div class="node-name">' + node.name + '</div>';
        if (node.type) {
            html += '<div class="node-type">' + node.type + '</div>';
        }
        if (node.modules && node.modules.length > 0) {
            html += '<div class="has-children">▼ ' + node.modules.length + ' sub-components</div>';
        }
        html += '</div>';
    }
    container.innerHTML = html;

    // Add event handlers - single click drills down (if has children) and shows info
    var nodeElements = container.querySelectorAll('.tree-node');
    for (var j = 0; j < nodeElements.length; j++) {
        (function(nodeEl, nodes) {
            var index = parseInt(nodeEl.getAttribute('data-index'));
            var node = nodes[index];

            nodeEl.onclick = function(e) {
                e.stopPropagation();
                // Always update info panel with clicked node
                selectedNode = node;
                selectedNodeIndex = index;
                updateInfo(node.name, node.description);
                updateImage(node.image, node.name);

                // Drill down if has children
                if (node.modules && node.modules.length > 0) {
                    drillDown(node, index);
                } else {
                    // Just select it visually if no children
                    selectNodeVisually(index);
                }
            };
        })(nodeElements[j], nodes);
    }
}

// ==================== SELECT NODE VISUALLY ====================
function selectNodeVisually(index) {
    var container = document.getElementById('decision-tree');
    var allNodes = container.querySelectorAll('.tree-node');
    for (var i = 0; i < allNodes.length; i++) {
        allNodes[i].classList.remove('selected');
    }

    var nodeEl = container.querySelector('[data-index="' + index + '"]');
    if (nodeEl) {
        nodeEl.classList.add('selected');
    }
}

// ==================== DRILL DOWN ====================
function drillDown(node, index) {
    currentPath.push({
        name: node.name,
        nodeRef: node,
        selectedIndex: index
    });

    renderTree(node.modules || []);
    updateBreadcrumb();

    // Keep the drilled-into node as selected so it can be edited
    selectedNode = node;
    selectedNodeIndex = index;
}

function getCurrentModules() {
    if (currentPath.length === 0) {
        return currentSatellite.modules || [];
    }

    var modules = currentSatellite.modules || [];
    for (var i = 0; i < currentPath.length; i++) {
        var pathItem = currentPath[i];
        if (modules[pathItem.selectedIndex]) {
            modules = modules[pathItem.selectedIndex].modules || [];
        }
    }
    return modules;
}

function getCurrentParent() {
    if (currentPath.length === 0) {
        return currentSatellite;
    }

    var parent = currentSatellite;
    for (var i = 0; i < currentPath.length; i++) {
        var pathItem = currentPath[i];
        if (parent.modules && parent.modules[pathItem.selectedIndex]) {
            parent = parent.modules[pathItem.selectedIndex];
        }
    }
    return parent;
}

// ==================== BREADCRUMB ====================
function updateBreadcrumb() {
    var container = document.getElementById('breadcrumb');
    var items = [{ name: currentSatellite.name, level: -1 }];

    for (var i = 0; i < currentPath.length; i++) {
        items.push({ name: currentPath[i].name, level: i });
    }

    var html = '';
    for (var j = 0; j < items.length; j++) {
        var item = items[j];
        var isCurrent = (j === items.length - 1);
        if (j > 0) {
            html += '<span class="breadcrumb-separator">›</span>';
        }
        html += '<span class="breadcrumb-item' + (isCurrent ? ' current' : '') + '" data-level="' + item.level + '">' + item.name + '</span>';
    }
    container.innerHTML = html;

    // Add click handlers
    var crumbs = container.querySelectorAll('.breadcrumb-item:not(.current)');
    for (var k = 0; k < crumbs.length; k++) {
        (function(crumb) {
            crumb.onclick = function() {
                var level = parseInt(this.getAttribute('data-level'));
                navigateToLevel(level);
            };
        })(crumbs[k]);
    }
}

function navigateToLevel(level) {
    if (level === -1) {
        currentPath = [];
        renderTree(currentSatellite.modules || []);
        updateImage(currentSatellite.image, currentSatellite.name);
        updateInfo(currentSatellite.name, currentSatellite.description);
    } else {
        currentPath = currentPath.slice(0, level + 1);
        var modules = getCurrentModules();
        renderTree(modules);

        var parent = getCurrentParent();
        updateImage(parent.image, parent.name);
        updateInfo(parent.name, parent.description);
    }

    updateBreadcrumb();
    selectedNode = null;
    selectedNodeIndex = -1;
}

// ==================== UPDATE IMAGE ====================
function updateImage(imagePath, caption) {
    var previewImage = document.getElementById('preview-image');
    var imageCaption = document.getElementById('image-caption');
    var placeholder = document.querySelector('.no-image-placeholder');

    if (imagePath) {
        previewImage.src = imagePath;
        previewImage.style.display = 'block';
        if (placeholder) placeholder.style.display = 'none';
    } else {
        previewImage.style.display = 'none';
        previewImage.src = '';
        if (placeholder) placeholder.style.display = 'flex';
    }

    imageCaption.textContent = caption || '';
}

// ==================== UPDATE INFO ====================
function updateInfo(title, description) {
    document.getElementById('info-title').textContent = title;

    var infoText = document.getElementById('info-text');
    if (description) {
        var html = description
            .replace(/\n\n/g, '</p><p>')
            .replace(/\n/g, '<br>')
            .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
            .replace(/\*([^*]+)\*/g, '<em>$1</em>')
            .replace(/^- (.*)$/gm, '<li>$1</li>');

        html = html.replace(/(<li>[^<]*<\/li>)+/g, '<ul>$&</ul>');
        infoText.innerHTML = '<p>' + html + '</p>';
    } else {
        infoText.innerHTML = '<p><em>No description. Click edit to add one.</em></p>';
    }
}

// ==================== EXPAND / COLLAPSE ====================
function expandInfo() {
    document.getElementById('expanded-title').textContent = document.getElementById('info-title').textContent;
    document.getElementById('expanded-text').innerHTML = document.getElementById('info-text').innerHTML;

    var pathTree = document.getElementById('path-tree');

    // Build path from satellite to current location
    var pathNodes = [];

    // Add satellite as root
    pathNodes.push({
        icon: currentSatellite.icon || '🛰️',
        name: currentSatellite.name,
        type: currentSatellite.type || 'Satellite',
        isCurrent: currentPath.length === 0 && !selectedNode
    });

    // Add each level in the path
    var current = currentSatellite;
    for (var i = 0; i < currentPath.length; i++) {
        var pathItem = currentPath[i];
        if (current.modules && current.modules[pathItem.selectedIndex]) {
            current = current.modules[pathItem.selectedIndex];
            pathNodes.push({
                icon: current.icon || '📦',
                name: current.name,
                type: current.type || 'Module',
                isCurrent: i === currentPath.length - 1 && !selectedNode
            });
        }
    }

    // Add selected node if there is one
    if (selectedNode) {
        pathNodes.push({
            icon: selectedNode.icon || '📦',
            name: selectedNode.name,
            type: selectedNode.type || 'Component',
            isCurrent: true
        });
    }

    // Render path tree
    var html = '';
    for (var j = 0; j < pathNodes.length; j++) {
        if (j > 0) {
            html += '<span class="path-separator">›</span>';
        }
        var node = pathNodes[j];
        html += '<div class="path-node' + (node.isCurrent ? ' current' : '') + '">';
        html += '<span class="path-icon">' + node.icon + '</span>';
        html += '<span class="path-name">' + node.name + '</span>';
        html += '</div>';
    }
    pathTree.innerHTML = html;
    pathTree.style.display = 'flex';

    document.getElementById('expanded-overlay').classList.remove('hidden');
}

function collapseInfo() {
    document.getElementById('expanded-overlay').classList.add('hidden');
}

// ==================== EDIT MODAL ====================
function openEditModal(target) {
    editTarget = target;

    var editName = document.getElementById('edit-name');
    var editIcon = document.getElementById('edit-icon');
    var editType = document.getElementById('edit-type');
    var editImage = document.getElementById('edit-image');
    var editDescription = document.getElementById('edit-description');
    var modalTitle = document.getElementById('modal-title');
    var deleteBtn = document.getElementById('delete-in-modal');

    // Hide delete button by default
    deleteBtn.classList.add('hidden');

    if (target === 'new-satellite') {
        modalTitle.textContent = 'Add New Satellite';
        editName.value = '';
        editIcon.value = '🛰️';
        editType.value = '';
        editImage.value = '';
        editDescription.value = '';
    } else if (target === 'new-module') {
        modalTitle.textContent = 'Add New Module';
        editName.value = '';
        editIcon.value = '📦';
        editType.value = '';
        editImage.value = '';
        editDescription.value = '';
    } else if (target === 'new-subcomponent') {
        modalTitle.textContent = 'Add Sub-component to ' + selectedNode.name;
        editName.value = '';
        editIcon.value = '📦';
        editType.value = '';
        editImage.value = '';
        editDescription.value = '';
    } else if (target === 'satellite') {
        modalTitle.textContent = 'Edit Satellite';
        editName.value = currentSatellite.name || '';
        editIcon.value = currentSatellite.icon || '🛰️';
        editType.value = currentSatellite.type || '';
        editImage.value = currentSatellite.image || '';
        editDescription.value = currentSatellite.description || '';
        deleteBtn.classList.remove('hidden');
    } else if (target === 'module' && selectedNode) {
        modalTitle.textContent = 'Edit Module';
        editName.value = selectedNode.name || '';
        editIcon.value = selectedNode.icon || '📦';
        editType.value = selectedNode.type || '';
        editImage.value = selectedNode.image || '';
        editDescription.value = selectedNode.description || '';
        deleteBtn.classList.remove('hidden');
    }

    document.getElementById('edit-modal').classList.remove('hidden');
    editName.focus();
}

function closeEditModal() {
    document.getElementById('edit-modal').classList.add('hidden');
    editTarget = null;
}

function saveEdit() {
    var name = document.getElementById('edit-name').value.trim();
    var icon = document.getElementById('edit-icon').value.trim() || '📦';
    var type = document.getElementById('edit-type').value.trim();
    var image = document.getElementById('edit-image').value.trim();
    var description = document.getElementById('edit-description').value;

    if (!name) {
        showToast('Name is required', 'error');
        return;
    }

    if (editTarget === 'new-satellite') {
        var newSatellite = {
            id: generateId(),
            name: name,
            icon: icon,
            type: type,
            image: image,
            description: description,
            modules: []
        };
        satellites.push(newSatellite);
        saveData();
        renderSatelliteBubbles();
        showToast('Satellite added!', 'success');

    } else if (editTarget === 'new-module') {
        var parent = getCurrentParent();
        if (!parent.modules) parent.modules = [];

        var newModule = {
            id: generateId(),
            name: name,
            icon: icon,
            type: type,
            image: image,
            description: description,
            modules: []
        };
        parent.modules.push(newModule);
        saveData();
        renderTree(parent.modules);
        showToast('Module added!', 'success');

    } else if (editTarget === 'new-subcomponent') {
        if (!selectedNode.modules) selectedNode.modules = [];

        var newSubcomponent = {
            id: generateId(),
            name: name,
            icon: icon,
            type: type,
            image: image,
            description: description,
            modules: []
        };
        selectedNode.modules.push(newSubcomponent);
        saveData();

        // Re-render current tree
        var currentModules = getCurrentModules();
        renderTree(currentModules);
        showToast('Sub-component added!', 'success');

    } else if (editTarget === 'satellite') {
        currentSatellite.name = name;
        currentSatellite.icon = icon;
        currentSatellite.type = type;
        currentSatellite.image = image;
        currentSatellite.description = description;
        saveData();

        var headerBubble = document.getElementById('header-bubble');
        headerBubble.innerHTML = '<span class="icon">' + icon + '</span><span class="name">' + name + '</span>';

        if (currentPath.length === 0 && !selectedNode) {
            updateInfo(name, description);
            updateImage(image, name);
        }
        updateBreadcrumb();
        showToast('Saved!', 'success');

    } else if (editTarget === 'module' && selectedNode) {
        selectedNode.name = name;
        selectedNode.icon = icon;
        selectedNode.type = type;
        selectedNode.image = image;
        selectedNode.description = description;
        saveData();

        var modules = getCurrentModules();
        renderTree(modules);
        updateInfo(name, description);
        updateImage(image, name);

        setTimeout(function() {
            var nodeEl = document.querySelector('#decision-tree [data-index="' + selectedNodeIndex + '"]');
            if (nodeEl) nodeEl.classList.add('selected');
        }, 10);

        showToast('Saved!', 'success');
    }

    closeEditModal();
}

// ==================== DELETE ====================
function openConfirmModal(message, callback) {
    document.getElementById('confirm-message').textContent = message;
    deleteCallback = callback;
    document.getElementById('confirm-modal').classList.remove('hidden');
}

function closeConfirmModal() {
    document.getElementById('confirm-modal').classList.add('hidden');
    deleteCallback = null;
}

function confirmDeleteAction() {
    if (deleteCallback) {
        deleteCallback();
    }
    closeConfirmModal();
}

function deleteSatellite() {
    openConfirmModal('Delete "' + currentSatellite.name + '" and all its modules?', function() {
        satellites.splice(currentSatelliteIndex, 1);
        saveData();
        goBack();
        renderSatelliteBubbles();
        showToast('Deleted', 'success');
    });
}

function deleteSelectedModule() {
    if (!selectedNode) {
        showToast('Select a module first', 'error');
        return;
    }

    openConfirmModal('Delete "' + selectedNode.name + '" and all sub-modules?', function() {
        // Check if we're deleting the current context (the module we drilled into)
        var isCurrentContext = currentPath.length > 0 &&
            currentPath[currentPath.length - 1].nodeRef === selectedNode;

        if (isCurrentContext) {
            // Go up one level and delete from there
            var indexToDelete = currentPath[currentPath.length - 1].selectedIndex;
            currentPath.pop();

            var parent = getCurrentParent();
            if (parent.modules) {
                parent.modules.splice(indexToDelete, 1);
                saveData();
                renderTree(parent.modules || []);
                updateBreadcrumb();
                selectedNode = null;
                selectedNodeIndex = -1;
                updateInfo(parent.name, parent.description);
                updateImage(parent.image, parent.name);
                showToast('Deleted', 'success');
            }
        } else {
            // Deleting a child of the current view
            var parent = getCurrentParent();
            if (parent.modules) {
                parent.modules.splice(selectedNodeIndex, 1);
                saveData();
                renderTree(parent.modules);
                selectedNode = null;
                selectedNodeIndex = -1;
                updateInfo(parent.name, parent.description);
                showToast('Deleted', 'success');
            }
        }
    });
}

// ==================== NAVIGATION ====================
function goBack() {
    currentSatellite = null;
    currentSatelliteIndex = -1;
    currentPath = [];
    selectedNode = null;
    selectedNodeIndex = -1;

    document.getElementById('detail-screen').classList.remove('active');
    document.getElementById('home-screen').classList.add('active');
}

// ==================== TOAST ====================
function showToast(message, type) {
    var toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = 'toast ' + (type || 'info');

    setTimeout(function() {
        toast.classList.add('hidden');
    }, 3000);
}

// ==================== EVENT LISTENERS ====================
function setupEventListeners() {
    // Home screen buttons
    document.getElementById('add-satellite-btn').onclick = function() {
        openEditModal('new-satellite');
    };

    document.getElementById('export-btn').onclick = exportData;

    document.getElementById('import-btn').onclick = function() {
        document.getElementById('import-file').click();
    };

    document.getElementById('import-file').onchange = function(e) {
        if (e.target.files[0]) {
            importData(e.target.files[0]);
            e.target.value = '';
        }
    };

    // Detail screen navigation
    document.getElementById('back-btn').onclick = goBack;

    document.getElementById('edit-satellite-btn').onclick = function() {
        openEditModal('satellite');
    };

    // Tree panel
    document.getElementById('add-module-btn').onclick = function() {
        openEditModal('new-module');
    };

    // Info panel
    document.getElementById('edit-node-btn').onclick = function() {
        if (selectedNode) {
            openEditModal('module');
        } else {
            showToast('Select a module first', 'error');
        }
    };

    document.getElementById('add-subcomponent-btn').onclick = function() {
        if (selectedNode) {
            openEditModal('new-subcomponent');
        } else {
            showToast('Select a module first', 'error');
        }
    };
    document.getElementById('expand-btn').onclick = expandInfo;
    document.getElementById('collapse-btn').onclick = collapseInfo;

    // Image upload
    document.getElementById('upload-image-btn').onclick = function() {
        document.getElementById('image-upload').click();
    };

    document.getElementById('image-upload').onchange = function(e) {
        if (e.target.files && e.target.files[0]) {
            uploadImage(e.target.files[0]);
            e.target.value = '';
        }
    };

    // Expanded overlay
    document.getElementById('expanded-overlay').onclick = function(e) {
        if (e.target === this) collapseInfo();
    };

    // Edit modal
    document.getElementById('modal-close').onclick = closeEditModal;
    document.getElementById('cancel-edit').onclick = closeEditModal;

    document.getElementById('edit-form').onsubmit = function(e) {
        e.preventDefault();
        saveEdit();
    };

    document.getElementById('delete-in-modal').onclick = function() {
        closeEditModal();
        if (editTarget === 'satellite') {
            deleteSatellite();
        } else if (editTarget === 'module') {
            deleteSelectedModule();
        }
    };

    document.getElementById('edit-modal').onclick = function(e) {
        if (e.target === this) closeEditModal();
    };

    // Confirm modal
    document.getElementById('confirm-cancel').onclick = closeConfirmModal;
    document.getElementById('confirm-delete').onclick = confirmDeleteAction;

    document.getElementById('confirm-modal').onclick = function(e) {
        if (e.target === this) closeConfirmModal();
    };

    // Keyboard
    document.onkeydown = function(e) {
        if (e.key === 'Escape') {
            var editModal = document.getElementById('edit-modal');
            var confirmModal = document.getElementById('confirm-modal');
            var expandedOverlay = document.getElementById('expanded-overlay');
            var detailScreen = document.getElementById('detail-screen');

            if (!editModal.classList.contains('hidden')) {
                closeEditModal();
            } else if (!confirmModal.classList.contains('hidden')) {
                closeConfirmModal();
            } else if (!expandedOverlay.classList.contains('hidden')) {
                collapseInfo();
            } else if (detailScreen.classList.contains('active')) {
                if (currentPath.length > 0) {
                    navigateToLevel(currentPath.length - 2);
                } else {
                    goBack();
                }
            }
        }
    };
}
