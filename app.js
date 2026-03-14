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
const PROCEDURES_STORAGE_KEY = 'satellite-catalogue-procedures-edits';
const ALARMS_STORAGE_KEY = 'satellite-catalogue-alarms-edits';
const HARDWARE_STORAGE_KEY = 'satellite-catalogue-hardware-edits';

// ==================== STATE ====================
let satellites = [];
let procedures = [];
let alarms = [];
let hardware = [];
let currentSatellite = null;
let currentSatelliteIndex = -1;
let currentDataSource = 'satellites'; // 'satellites', 'procedures', 'alarms', or 'hardware'
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
    loadCategoryData();
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

function loadCategoryData() {
    // Load procedures
    procedures = JSON.parse(JSON.stringify(PROCEDURE_FILES));
    _applyCategoryEdits(procedures, PROCEDURE_FILES, PROCEDURES_STORAGE_KEY);

    // Load alarms
    alarms = JSON.parse(JSON.stringify(ALARM_FILES));
    _applyCategoryEdits(alarms, ALARM_FILES, ALARMS_STORAGE_KEY);

    // Load hardware
    hardware = JSON.parse(JSON.stringify(HARDWARE_FILES));
    _applyCategoryEdits(hardware, HARDWARE_FILES, HARDWARE_STORAGE_KEY);

    // Update count badges on category bubbles
    updateCategoryBadges();
}

function _applyCategoryEdits(dataArray, filesArray, storageKey) {
    var stored = localStorage.getItem(storageKey);
    if (!stored) return;
    try {
        var edits = JSON.parse(stored);
        if (edits.modified) {
            edits.modified.forEach(function(mod) {
                var index = dataArray.findIndex(function(s) { return s.id === mod.id; });
                if (index > -1) dataArray[index] = mod;
            });
        }
        if (edits.added) {
            edits.added.forEach(function(item) {
                if (!dataArray.find(function(s) { return s.id === item.id; })) {
                    dataArray.push(item);
                }
            });
        }
        if (edits.deleted) {
            edits.deleted.forEach(function(id) {
                var index = dataArray.findIndex(function(s) { return s.id === id; });
                if (index > -1) dataArray.splice(index, 1);
            });
        }
    } catch (e) {
        console.error('Failed to load category edits:', e);
    }
}

function saveCategoryData(category) {
    var dataArray, filesArray, storageKey;
    if (category === 'procedures') {
        dataArray = procedures; filesArray = PROCEDURE_FILES; storageKey = PROCEDURES_STORAGE_KEY;
    } else if (category === 'hardware') {
        dataArray = hardware; filesArray = HARDWARE_FILES; storageKey = HARDWARE_STORAGE_KEY;
    } else {
        dataArray = alarms; filesArray = ALARM_FILES; storageKey = ALARMS_STORAGE_KEY;
    }

    var edits = { modified: [], added: [], deleted: [] };

    dataArray.forEach(function(item) {
        var original = filesArray.find(function(s) { return s.id === item.id; });
        if (!original) {
            edits.added.push(item);
        } else if (JSON.stringify(item) !== JSON.stringify(original)) {
            edits.modified.push(item);
        }
    });

    filesArray.forEach(function(original) {
        if (!dataArray.find(function(s) { return s.id === original.id; })) {
            edits.deleted.push(original.id);
        }
    });

    localStorage.setItem(storageKey, JSON.stringify(edits));
}

function getCurrentDataArray() {
    if (currentDataSource === 'procedures') return procedures;
    if (currentDataSource === 'alarms') return alarms;
    if (currentDataSource === 'hardware') return hardware;
    return satellites;
}

function getCurrentFilesArray() {
    if (currentDataSource === 'procedures') return PROCEDURE_FILES;
    if (currentDataSource === 'alarms') return ALARM_FILES;
    if (currentDataSource === 'hardware') return HARDWARE_FILES;
    return SATELLITE_FILES;
}

function saveCurrentData() {
    if (currentDataSource === 'procedures') { saveCategoryData('procedures'); return; }
    if (currentDataSource === 'alarms') { saveCategoryData('alarms'); return; }
    if (currentDataSource === 'hardware') { saveCategoryData('hardware'); return; }
    saveData();
}

// ==================== CATEGORY BADGES ====================
function updateCategoryBadges() {
    function countNodes(arr) {
        var count = 0;
        arr.forEach(function(entry) {
            if (entry.modules) count += entry.modules.length;
        });
        return count;
    }

    var procCount = document.getElementById('count-procedures');
    var almCount  = document.getElementById('count-alarms');
    var hwCount   = document.getElementById('count-hardware');

    if (procCount) {
        var pc = countNodes(procedures);
        procCount.textContent = pc > 0 ? pc : '';
    }
    if (almCount) {
        var ac = countNodes(alarms);
        almCount.textContent = ac > 0 ? ac : '';
    }
    if (hwCount) {
        var hc = countNodes(hardware);
        hwCount.textContent = hc > 0 ? hc : '';
    }
}

function generateId() {
    return 'sat-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
}

// ==================== IMAGE LIGHTBOX ====================
function openLightbox() {
    var previewImage = document.getElementById('preview-image');
    if (previewImage.src && previewImage.style.display !== 'none') {
        document.getElementById('lightbox-img').src = previewImage.src;
        document.getElementById('image-lightbox').classList.remove('hidden');
    }
}

function closeLightbox() {
    document.getElementById('image-lightbox').classList.add('hidden');
}

function removeImage() {
    if (selectedNode) {
        selectedNode.image = '';
        updateImage('', selectedNode.name);
    } else if (currentSatellite) {
        currentSatellite.image = '';
        updateImage('', currentSatellite.name);
    }
    saveCurrentData();
    closeLightbox();
    showToast('Image removed', 'success');
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

        saveCurrentData();
        showToast('Image uploaded!', 'success');
    };
    reader.onerror = function() {
        showToast('Failed to read image', 'error');
    };
    reader.readAsDataURL(file);
}

// ==================== EXPORT / IMPORT ====================
function exportData() {
    // Export all categories together in a versioned wrapper
    var payload = {
        version: 2,
        exportedAt: new Date().toISOString(),
        satellites: satellites,
        procedures: procedures,
        alarms: alarms,
        hardware: hardware
    };
    var dataStr = JSON.stringify(payload, null, 2);
    var blob = new Blob([dataStr], { type: 'application/json' });
    var url = URL.createObjectURL(blob);

    var a = document.createElement('a');
    a.href = url;
    a.download = 'engineering-handbook-export.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(url);
    showToast('All data exported!', 'success');
}

function importData(file) {
    var reader = new FileReader();
    reader.onload = function(e) {
        try {
            var imported = JSON.parse(e.target.result);

            if (Array.isArray(imported)) {
                // Legacy format: plain array of satellites
                satellites = imported;
                saveData();
                renderSatelliteBubbles();
                showToast('Satellites imported (legacy format)', 'success');

            } else if (imported && imported.version === 2) {
                // Current format: versioned combined object
                if (Array.isArray(imported.satellites))  { satellites  = imported.satellites;  saveData(); }
                if (Array.isArray(imported.procedures))  { procedures  = imported.procedures;  saveCategoryData('procedures'); }
                if (Array.isArray(imported.alarms))      { alarms      = imported.alarms;      saveCategoryData('alarms'); }
                if (Array.isArray(imported.hardware))    { hardware    = imported.hardware;    saveCategoryData('hardware'); }
                renderSatelliteBubbles();
                updateCategoryBadges();
                showToast('All data imported!', 'success');

            } else {
                showToast('Unrecognised file format', 'error');
            }
        } catch (err) {
            showToast('Failed to parse file', 'error');
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
                selectSatellite(index, 'satellites');
            };
        })(bubbles[j]);
    }
}

// ==================== SELECT SATELLITE ====================
function selectSatellite(index, source) {
    currentDataSource = source || 'satellites';
    var dataArray = getCurrentDataArray();

    // Bug fix: guard against empty arrays (e.g. clicking Procedures when none loaded)
    if (!dataArray || dataArray.length === 0) {
        showToast('No entries found for this category', 'error');
        return;
    }
    var safeIndex = Math.max(0, Math.min(index, dataArray.length - 1));

    currentSatellite = dataArray[safeIndex];
    currentSatelliteIndex = safeIndex;
    currentPath = [];
    selectedNode = null;
    selectedNodeIndex = -1;

    // Update header
    var headerBubble = document.getElementById('header-bubble');
    headerBubble.innerHTML = '<span class="icon">' + (currentSatellite.icon || '🛰️') + '</span><span class="name">' + currentSatellite.name + '</span>';

    // Update context-aware button labels
    updateContextLabels();

    // Switch screens
    document.getElementById('home-screen').classList.remove('active');
    document.getElementById('detail-screen').classList.add('active');

    // Initialize view
    updateImage(currentSatellite.image, currentSatellite.name);
    updateInfo(currentSatellite.name, currentSatellite.description, currentSatellite.descriptionFormat);
    renderTree(currentSatellite.modules || []);
    updateBreadcrumb();
}

function updateContextLabels() {
    var addModuleBtn = document.getElementById('add-module-btn');
    if (!addModuleBtn) return;

    switch (currentDataSource) {
        case 'procedures':
            addModuleBtn.textContent = '+ Add Step';
            break;
        case 'alarms':
            addModuleBtn.textContent = '+ Add Alarm';
            break;
        case 'hardware':
            addModuleBtn.textContent = '+ Add Component';
            break;
        default:
            addModuleBtn.textContent = '+ Add Module';
    }
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
        // Severity badge (alarms)
        if (node.severity) {
            var sevLabels = { critical: '🔴 CRITICAL', warning: '🟠 WARNING', caution: '🟡 CAUTION', info: '🔵 INFO' };
            html += '<div class="severity-badge severity-' + node.severity + '">' + (sevLabels[node.severity] || node.severity.toUpperCase()) + '</div>';
        }
        // Status badge (procedures / other)
        if (node.status && node.status !== 'active') {
            var statusLabels = { draft: '📝 DRAFT', deprecated: '⛔ DEPRECATED' };
            html += '<div class="status-badge status-' + node.status + '">' + (statusLabels[node.status] || node.status.toUpperCase()) + '</div>';
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
                updateInfo(node.name, node.description, node.descriptionFormat);
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
    // Clear selection first so updateEditButtonVisibility works correctly
    selectedNode = null;
    selectedNodeIndex = -1;

    if (level === -1) {
        currentPath = [];
        renderTree(currentSatellite.modules || []);
        updateImage(currentSatellite.image, currentSatellite.name);
        updateInfo(currentSatellite.name, currentSatellite.description, currentSatellite.descriptionFormat);
    } else {
        currentPath = currentPath.slice(0, level + 1);
        var modules = getCurrentModules();
        renderTree(modules);

        var parent = getCurrentParent();
        updateImage(parent.image, parent.name);
        updateInfo(parent.name, parent.description, parent.descriptionFormat);
    }

    updateBreadcrumb();
}

// ==================== UPDATE IMAGE ====================
function updateImage(imagePath, caption) {
    var previewImage = document.getElementById('preview-image');
    var imageCaption = document.getElementById('image-caption');
    var placeholder = document.querySelector('.no-image-placeholder');
    var imagePanel = document.getElementById('image-panel');

    if (imagePath) {
        previewImage.src = imagePath;
        previewImage.style.display = 'block';
        if (placeholder) placeholder.style.display = 'none';
        imagePanel.classList.remove('collapsed');
    } else {
        previewImage.style.display = 'none';
        previewImage.src = '';
        if (placeholder) placeholder.style.display = 'flex';
        imagePanel.classList.add('collapsed');
    }

    imageCaption.textContent = caption || '';
}

// ==================== UPDATE EDIT BUTTON VISIBILITY ====================
function updateEditButtonVisibility() {
    var editBtn = document.getElementById('edit-node-btn');
    var addSubBtn = document.getElementById('add-subcomponent-btn');

    // Hide edit and add-subcomponent buttons when at satellite root level
    if (currentPath.length === 0 && !selectedNode) {
        editBtn.style.display = 'none';
        addSubBtn.style.display = 'none';
    } else {
        editBtn.style.display = '';
        addSubBtn.style.display = '';
    }
}

// ==================== UPDATE INFO ====================
function renderMarkdownToHtml(description) {
    var html = description
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br>')
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
        .replace(/\*([^*]+)\*/g, '<em>$1</em>')
        .replace(/^- (.*)$/gm, '<li>$1</li>');

    html = html.replace(/(<li>[^<]*<\/li>)+/g, '<ul>$&</ul>');
    return '<p>' + html + '</p>';
}

function updateInfo(title, description, format) {
    document.getElementById('info-title').textContent = title;
    updateEditButtonVisibility();

    var infoText = document.getElementById('info-text');
    if (description) {
        if (format === 'html') {
            infoText.innerHTML = description;
        } else {
            infoText.innerHTML = renderMarkdownToHtml(description);
        }
        renderKaTeX(infoText);
    } else {
        infoText.innerHTML = '<p><em>No description. Click edit to add one.</em></p>';
    }
}

function renderKaTeX(element) {
    if (typeof renderMathInElement === 'function') {
        try {
            renderMathInElement(element, {
                delimiters: [
                    { left: '$$', right: '$$', display: true },
                    { left: '$', right: '$', display: false },
                    { left: '\\(', right: '\\)', display: false },
                    { left: '\\[', right: '\\]', display: true }
                ],
                throwOnError: false
            });
        } catch (e) {
            // KaTeX not loaded or error, silently continue
        }
    }
}

// ==================== EXPAND / COLLAPSE ====================
function expandInfo() {
    // Exit edit mode if open
    exitEditMode();

    document.getElementById('expanded-title').textContent = document.getElementById('info-title').textContent;
    document.getElementById('expanded-text').innerHTML = document.getElementById('info-text').innerHTML;
    renderKaTeX(document.getElementById('expanded-text'));

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
    exitEditMode();
    document.getElementById('expanded-overlay').classList.add('hidden');
}

// ==================== EDIT MODAL ====================
function openEditModal(target) {
    editTarget = target;

    var editName        = document.getElementById('edit-name');
    var editIcon        = document.getElementById('edit-icon');
    var editType        = document.getElementById('edit-type');
    var editImage       = document.getElementById('edit-image');
    var editDescription = document.getElementById('edit-description');
    var editSeverity    = document.getElementById('edit-severity');
    var editStatus      = document.getElementById('edit-status');
    var modalTitle      = document.getElementById('modal-title');
    var deleteBtn       = document.getElementById('delete-in-modal');
    var severityGroup   = document.getElementById('severity-group');
    var statusGroup     = document.getElementById('status-group');
    var htmlNotice      = document.getElementById('html-format-notice');

    // Reset conditional fields
    deleteBtn.classList.add('hidden');
    severityGroup.classList.add('hidden');
    statusGroup.classList.add('hidden');
    htmlNotice.classList.add('hidden');

    // Show severity field for alarms, status field for procedures
    if (currentDataSource === 'alarms') {
        severityGroup.classList.remove('hidden');
    } else if (currentDataSource === 'procedures') {
        statusGroup.classList.remove('hidden');
    }

    // Context-aware "new" labels
    var newLabels = { procedures: 'Step', alarms: 'Alarm', hardware: 'Component', satellites: 'Module' };
    var entryLabel = newLabels[currentDataSource] || 'Module';

    function fillNew(defaultIcon) {
        editName.value = '';
        editIcon.value = defaultIcon;
        editType.value = '';
        editImage.value = '';
        editDescription.value = '';
        editSeverity.value = '';
        editStatus.value = 'active';
    }

    function fillNode(node, titleText) {
        modalTitle.textContent = titleText;
        editName.value  = node.name  || '';
        editIcon.value  = node.icon  || '📦';
        editType.value  = node.type  || '';
        editImage.value = node.image || '';
        editSeverity.value = node.severity || '';
        editStatus.value   = node.status   || 'active';

        // Bug fix: if the node uses HTML format, show a warning and strip tags
        // so the textarea contains readable plain text instead of raw markup
        if (node.descriptionFormat === 'html' && node.description) {
            htmlNotice.classList.remove('hidden');
            // Strip HTML tags for a readable preview in the plain-text textarea
            var tmp = document.createElement('div');
            tmp.innerHTML = node.description;
            editDescription.value = tmp.textContent || tmp.innerText || '';
        } else {
            editDescription.value = node.description || '';
        }

        deleteBtn.classList.remove('hidden');
    }

    if (target === 'new-satellite') {
        modalTitle.textContent = 'Add New Satellite';
        fillNew('🛰️');
    } else if (target === 'new-module') {
        modalTitle.textContent = 'Add New ' + entryLabel;
        fillNew('📦');
    } else if (target === 'new-subcomponent') {
        modalTitle.textContent = 'Add Sub-component to ' + selectedNode.name;
        fillNew('📦');
    } else if (target === 'satellite') {
        fillNode(currentSatellite, 'Edit Entry');
    } else if (target === 'module' && selectedNode) {
        fillNode(selectedNode, 'Edit ' + entryLabel);
    }

    document.getElementById('edit-modal').classList.remove('hidden');
    editName.focus();
}

function closeEditModal() {
    document.getElementById('edit-modal').classList.add('hidden');
    editTarget = null;
}

function saveEdit() {
    var name        = document.getElementById('edit-name').value.trim();
    var icon        = document.getElementById('edit-icon').value.trim() || '📦';
    var type        = document.getElementById('edit-type').value.trim();
    var image       = document.getElementById('edit-image').value.trim();
    var description = document.getElementById('edit-description').value;
    var severity    = document.getElementById('edit-severity').value;
    var status      = document.getElementById('edit-status').value;

    if (!name) {
        showToast('Name is required', 'error');
        return;
    }

    function buildNode() {
        var node = {
            id: generateId(),
            name: name, icon: icon, type: type, image: image,
            description: description,
            modules: []
        };
        if (severity) node.severity = severity;
        if (status && status !== 'active') node.status = status;
        return node;
    }

    function applyToNode(node) {
        node.name = name; node.icon = icon; node.type = type;
        node.image = image; node.description = description;
        // Saving from the plain-text modal clears any previous HTML format
        delete node.descriptionFormat;
        if (severity) node.severity = severity; else delete node.severity;
        if (status && status !== 'active') node.status = status; else delete node.status;
    }

    if (editTarget === 'new-satellite') {
        var newSatellite = buildNode();
        newSatellite.icon = icon || '🛰️';
        satellites.push(newSatellite);
        saveData();
        renderSatelliteBubbles();
        showToast('Satellite added!', 'success');

    } else if (editTarget === 'new-module') {
        var parentNew = getCurrentParent();
        if (!parentNew.modules) parentNew.modules = [];
        parentNew.modules.push(buildNode());
        saveCurrentData();
        renderTree(parentNew.modules);
        updateCategoryBadges();
        showToast('Entry added!', 'success');

    } else if (editTarget === 'new-subcomponent') {
        if (!selectedNode.modules) selectedNode.modules = [];
        selectedNode.modules.push(buildNode());
        saveCurrentData();
        renderTree(getCurrentModules());
        showToast('Sub-component added!', 'success');

    } else if (editTarget === 'satellite') {
        applyToNode(currentSatellite);
        saveCurrentData();

        var headerBubble = document.getElementById('header-bubble');
        headerBubble.innerHTML = '<span class="icon">' + icon + '</span><span class="name">' + name + '</span>';

        if (currentPath.length === 0 && !selectedNode) {
            updateInfo(name, description, currentSatellite.descriptionFormat);
            updateImage(image, name);
        }
        updateBreadcrumb();
        showToast('Saved!', 'success');

    } else if (editTarget === 'module' && selectedNode) {
        applyToNode(selectedNode);
        saveCurrentData();

        var currentMods = getCurrentModules();
        renderTree(currentMods);
        updateInfo(name, description, selectedNode.descriptionFormat);
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
        var dataArray = getCurrentDataArray();
        dataArray.splice(currentSatelliteIndex, 1);
        saveCurrentData();
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

        var deleteParent;
        if (isCurrentContext) {
            // Go up one level and delete from there
            var indexToDelete = currentPath[currentPath.length - 1].selectedIndex;
            currentPath.pop();
            deleteParent = getCurrentParent();
            if (deleteParent.modules) {
                deleteParent.modules.splice(indexToDelete, 1);
                saveCurrentData();
                renderTree(deleteParent.modules || []);
                updateBreadcrumb();
                selectedNode = null;
                selectedNodeIndex = -1;
                updateInfo(deleteParent.name, deleteParent.description, deleteParent.descriptionFormat);
                updateImage(deleteParent.image, deleteParent.name);
                showToast('Deleted', 'success');
            }
        } else {
            // Deleting a child of the current view
            deleteParent = getCurrentParent();
            if (deleteParent.modules) {
                deleteParent.modules.splice(selectedNodeIndex, 1);
                saveCurrentData();
                renderTree(deleteParent.modules);
                selectedNode = null;
                selectedNodeIndex = -1;
                updateInfo(deleteParent.name, deleteParent.description, deleteParent.descriptionFormat);
                showToast('Deleted', 'success');
            }
        }
    });
}

// ==================== PRINT ====================
function printCurrentEntry() {
    // Expand the current info to full screen, then print
    expandInfo();
    setTimeout(function() {
        window.print();
    }, 300); // Small delay to let the expanded overlay render fully
}

// ==================== NAVIGATION ====================
function goBack() {
    currentSatellite = null;
    currentSatelliteIndex = -1;
    currentDataSource = 'satellites';
    currentPath = [];
    selectedNode = null;
    selectedNodeIndex = -1;

    document.getElementById('detail-screen').classList.remove('active');
    document.getElementById('home-screen').classList.add('active');
}

// ==================== TOAST ====================
var _toastTimer = null;

function showToast(message, type) {
    var toast = document.getElementById('toast');
    // Clear any in-flight hide timer so rapid toasts don't vanish early
    if (_toastTimer) {
        clearTimeout(_toastTimer);
        _toastTimer = null;
    }
    toast.textContent = message;
    toast.className = 'toast ' + (type || 'info'); // removes 'hidden'

    _toastTimer = setTimeout(function() {
        toast.classList.add('hidden');
        _toastTimer = null;
    }, 3000);
}

// ==================== SEARCH ====================
function buildSearchIndex() {
    var results = [];

    function crawl(node, satIndex, path, pathNames, source) {
        var entry = {
            name: node.name || '',
            icon: node.icon || '📦',
            type: node.type || '',
            description: node.description || '',
            satIndex: satIndex,
            source: source,
            path: path.slice(),
            pathLabel: pathNames.join(' › ')
        };
        results.push(entry);

        if (node.modules) {
            for (var i = 0; i < node.modules.length; i++) {
                var child = node.modules[i];
                var newPath = path.concat([i]);
                var newNames = pathNames.concat([child.name]);
                crawl(child, satIndex, newPath, newNames, source);
            }
        }
    }

    for (var s = 0; s < satellites.length; s++) {
        crawl(satellites[s], s, [], [satellites[s].name], 'satellites');
    }
    for (var p = 0; p < procedures.length; p++) {
        crawl(procedures[p], p, [], ['Procedures', procedures[p].name], 'procedures');
    }
    for (var a = 0; a < alarms.length; a++) {
        crawl(alarms[a], a, [], ['Alarms', alarms[a].name], 'alarms');
    }
    for (var h = 0; h < hardware.length; h++) {
        crawl(hardware[h], h, [], ['Hardware', hardware[h].name], 'hardware');
    }

    return results;
}

function searchSatellites(query) {
    if (!query || query.length < 2) return [];

    var index = buildSearchIndex();
    var terms = query.toLowerCase().split(/\s+/).filter(function(t) { return t.length > 0; });
    var scored = [];

    for (var i = 0; i < index.length; i++) {
        var entry = index[i];
        var nameLower = entry.name.toLowerCase();
        var typeLower = entry.type.toLowerCase();
        // Strip markdown for searching
        var descLower = entry.description.toLowerCase().replace(/\*\*/g, '').replace(/\*/g, '');
        var score = 0;

        var allMatch = true;
        for (var t = 0; t < terms.length; t++) {
            var term = terms[t];
            var found = false;

            if (nameLower.indexOf(term) !== -1) {
                score += 10;
                if (nameLower === term) score += 5;
                found = true;
            }
            if (typeLower.indexOf(term) !== -1) {
                score += 5;
                found = true;
            }
            if (descLower.indexOf(term) !== -1) {
                score += 2;
                found = true;
            }

            if (!found) { allMatch = false; break; }
        }

        if (allMatch && score > 0) {
            // Boost top-level satellites
            if (entry.path.length === 0) score += 3;
            scored.push({ entry: entry, score: score });
        }
    }

    scored.sort(function(a, b) { return b.score - a.score; });
    return scored.slice(0, 15);
}

function highlightText(text, query) {
    var terms = query.toLowerCase().split(/\s+/).filter(function(t) { return t.length > 0; });
    var escaped = text;
    // Sort terms longest first to avoid partial replacement issues
    terms.sort(function(a, b) { return b.length - a.length; });

    for (var i = 0; i < terms.length; i++) {
        var regex = new RegExp('(' + terms[i].replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi');
        escaped = escaped.replace(regex, '<mark>$1</mark>');
    }
    return escaped;
}

function getSnippet(description, query) {
    var clean = description.replace(/\*\*/g, '').replace(/\*/g, '').replace(/\n/g, ' ');
    var terms = query.toLowerCase().split(/\s+/).filter(function(t) { return t.length > 0; });

    // Find the first match position
    var pos = -1;
    for (var i = 0; i < terms.length; i++) {
        var idx = clean.toLowerCase().indexOf(terms[i]);
        if (idx !== -1 && (pos === -1 || idx < pos)) pos = idx;
    }

    if (pos === -1) {
        return clean.substring(0, 120) + (clean.length > 120 ? '...' : '');
    }

    var start = Math.max(0, pos - 40);
    var end = Math.min(clean.length, pos + 100);
    var snippet = (start > 0 ? '...' : '') + clean.substring(start, end) + (end < clean.length ? '...' : '');
    return highlightText(snippet, query);
}

function renderSearchResults(query) {
    var container = document.getElementById('search-results');
    var clearBtn = document.getElementById('search-clear');

    if (!query || query.trim().length < 2) {
        container.classList.add('hidden');
        clearBtn.classList.toggle('hidden', !query);
        return;
    }

    clearBtn.classList.remove('hidden');
    var results = searchSatellites(query);

    if (results.length === 0) {
        container.innerHTML = '<div class="search-no-results">No results for "' + query.replace(/</g, '&lt;') + '"</div>';
        container.classList.remove('hidden');
        return;
    }

    var html = '';
    for (var i = 0; i < results.length; i++) {
        var r = results[i].entry;
        html += '<div class="search-result-item" data-sat-index="' + r.satIndex + '" data-source="' + r.source + '" data-path="' + r.path.join(',') + '">';
        html += '<div class="search-result-icon">' + r.icon + '</div>';
        html += '<div class="search-result-info">';
        html += '<div class="search-result-name">' + highlightText(r.name, query) + '</div>';
        if (r.path.length > 0) {
            html += '<div class="search-result-path">' + r.pathLabel + '</div>';
        }
        if (r.description) {
            html += '<div class="search-result-snippet">' + getSnippet(r.description, query) + '</div>';
        }
        html += '</div>';
        if (r.type) {
            html += '<div class="search-result-type">' + r.type + '</div>';
        }
        html += '</div>';
    }
    container.innerHTML = html;
    container.classList.remove('hidden');

    // Add click handlers
    var items = container.querySelectorAll('.search-result-item');
    for (var j = 0; j < items.length; j++) {
        (function(item) {
            item.onclick = function() {
                var satIndex = parseInt(this.getAttribute('data-sat-index'));
                var source = this.getAttribute('data-source');
                var pathStr = this.getAttribute('data-path');
                var path = pathStr ? pathStr.split(',').map(Number) : [];

                // Clear search
                document.getElementById('search-input').value = '';
                container.classList.add('hidden');
                document.getElementById('search-clear').classList.add('hidden');

                // Navigate to the satellite/procedure/alarm
                selectSatellite(satIndex, source);

                // Drill down through the path (skip index 0 which is the satellite root)
                if (path.length > 0) {
                    var modules = currentSatellite.modules || [];
                    for (var p = 0; p < path.length; p++) {
                        var idx = path[p];
                        var node = modules[idx];
                        if (!node) break;

                        if (p < path.length - 1) {
                            // Intermediate node: drill down
                            drillDown(node, idx);
                            modules = node.modules || [];
                        } else {
                            // Final node: select it
                            selectedNode = node;
                            selectedNodeIndex = idx;
                            updateInfo(node.name, node.description, node.descriptionFormat);
                            updateImage(node.image, node.name);

                            if (node.modules && node.modules.length > 0) {
                                drillDown(node, idx);
                            } else {
                                selectNodeVisually(idx);
                            }
                        }
                    }
                }
            };
        })(items[j]);
    }
}

function setupSearch() {
    var input = document.getElementById('search-input');
    var clearBtn = document.getElementById('search-clear');
    var resultsContainer = document.getElementById('search-results');
    var debounceTimer = null;

    input.addEventListener('input', function() {
        clearTimeout(debounceTimer);
        var query = input.value;
        debounceTimer = setTimeout(function() {
            renderSearchResults(query);
        }, 150);
    });

    clearBtn.onclick = function() {
        input.value = '';
        resultsContainer.classList.add('hidden');
        clearBtn.classList.add('hidden');
        input.focus();
    };

    // Close results when clicking outside
    document.addEventListener('click', function(e) {
        var searchContainer = document.querySelector('.search-container');
        if (!searchContainer.contains(e.target)) {
            resultsContainer.classList.add('hidden');
        }
    });

    // Reopen results on focus if there's a query
    input.addEventListener('focus', function() {
        if (input.value.trim().length >= 2) {
            renderSearchResults(input.value);
        }
    });
}

// ==================== RICH TEXT EDITOR (QUILL) ====================
var quillEditor = null;
var isEditingRichText = false;

function initQuillEditor() {
    if (quillEditor) return quillEditor;

    var toolbarOptions = [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        ['blockquote', 'code-block'],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        ['link', 'image', 'formula'],
        ['clean']
    ];

    quillEditor = new Quill('#quill-editor', {
        theme: 'snow',
        modules: {
            toolbar: {
                container: toolbarOptions,
                handlers: {
                    image: quillImageHandler
                }
            },
            formula: true
        },
        placeholder: 'Write your description here...'
    });

    // Paste handler for images
    quillEditor.root.addEventListener('paste', function(e) {
        var clipboardData = e.clipboardData || window.clipboardData;
        if (!clipboardData || !clipboardData.items) return;

        for (var i = 0; i < clipboardData.items.length; i++) {
            var item = clipboardData.items[i];
            if (item.type.indexOf('image') !== -1) {
                e.preventDefault();
                var file = item.getAsFile();
                insertImageAsBase64(file);
                return;
            }
        }
    });

    return quillEditor;
}

function quillImageHandler() {
    var input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = function() {
        if (input.files && input.files[0]) {
            insertImageAsBase64(input.files[0]);
        }
    };
}

function insertImageAsBase64(file) {
    if (file.size > 2 * 1024 * 1024) {
        showToast('Image too large (max 2MB)', 'error');
        return;
    }

    var reader = new FileReader();
    reader.onload = function(e) {
        var range = quillEditor.getSelection(true);
        quillEditor.insertEmbed(range.index, 'image', e.target.result);
        quillEditor.setSelection(range.index + 1);
    };
    reader.readAsDataURL(file);
}

function enterEditMode() {
    if (isEditingRichText) return;
    isEditingRichText = true;

    var editor = initQuillEditor();

    // Get current node
    var node = getEditableNode();
    if (!node) return;

    // Load content into editor
    if (node.descriptionFormat === 'html') {
        editor.root.innerHTML = node.description || '';
    } else {
        // Convert markdown to HTML for editing
        var html = node.description ? renderMarkdownToHtml(node.description) : '';
        editor.root.innerHTML = html;
    }

    // Show editor, hide read-only
    document.getElementById('expanded-text').classList.add('hidden');
    document.getElementById('quill-editor-container').classList.remove('hidden');

    // Toggle buttons
    document.getElementById('edit-richtext-btn').classList.add('hidden');
    document.getElementById('save-richtext-btn').classList.remove('hidden');
    document.getElementById('cancel-richtext-btn').classList.remove('hidden');
}

function saveFromEditor() {
    if (!quillEditor || !isEditingRichText) return;

    var node = getEditableNode();
    if (!node) return;

    // Get HTML content from Quill
    var htmlContent = quillEditor.root.innerHTML;

    // Clean up empty editor content
    if (htmlContent === '<p><br></p>') {
        htmlContent = '';
    }

    // Save as HTML
    node.description = htmlContent;
    node.descriptionFormat = 'html';

    saveCurrentData();

    // Update read-only views
    updateInfo(node.name, node.description, node.descriptionFormat);
    document.getElementById('expanded-text').innerHTML = node.description;
    renderKaTeX(document.getElementById('expanded-text'));

    exitEditMode();
    showToast('Saved!', 'success');
}

function exitEditMode() {
    if (!isEditingRichText) return;
    isEditingRichText = false;

    // Show read-only, hide editor
    document.getElementById('expanded-text').classList.remove('hidden');
    document.getElementById('quill-editor-container').classList.add('hidden');

    // Toggle buttons
    document.getElementById('edit-richtext-btn').classList.remove('hidden');
    document.getElementById('save-richtext-btn').classList.add('hidden');
    document.getElementById('cancel-richtext-btn').classList.add('hidden');
}

function getEditableNode() {
    if (selectedNode) return selectedNode;
    if (currentSatellite) return currentSatellite;
    return null;
}

// ==================== EVENT LISTENERS ====================
function setupEventListeners() {
    // Search
    setupSearch();

    // Category bubbles — go directly to detail screen
    var categoryBubbles = document.querySelectorAll('.category-bubble');
    for (var c = 0; c < categoryBubbles.length; c++) {
        (function(bubble) {
            bubble.onclick = function() {
                var category = this.getAttribute('data-category');
                // selectSatellite now guards against empty arrays internally
                selectSatellite(0, category);
            };
        })(categoryBubbles[c]);
    }

    // Print button
    var printBtn = document.getElementById('print-btn');
    if (printBtn) printBtn.onclick = printCurrentEntry;

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

    // Image lightbox
    document.getElementById('preview-image').onclick = function() {
        openLightbox();
    };

    // Rich text editor buttons
    document.getElementById('edit-richtext-btn').onclick = enterEditMode;
    document.getElementById('save-richtext-btn').onclick = saveFromEditor;
    document.getElementById('cancel-richtext-btn').onclick = function() {
        exitEditMode();
        // Restore read-only content
        var node = getEditableNode();
        if (node) {
            document.getElementById('expanded-text').innerHTML = document.getElementById('info-text').innerHTML;
            renderKaTeX(document.getElementById('expanded-text'));
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
        var target = editTarget;
        closeEditModal();
        if (target === 'satellite') {
            deleteSatellite();
        } else if (target === 'module') {
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
            var lightbox = document.getElementById('image-lightbox');
            var editModal = document.getElementById('edit-modal');
            var confirmModal = document.getElementById('confirm-modal');
            var expandedOverlay = document.getElementById('expanded-overlay');
            var detailScreen = document.getElementById('detail-screen');

            if (!lightbox.classList.contains('hidden')) {
                closeLightbox();
            } else if (!editModal.classList.contains('hidden')) {
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
