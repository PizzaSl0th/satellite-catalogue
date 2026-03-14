/**
 * SATELLITE LOADER
 * =================
 * This file initializes the satellite, procedure, and alarm collections.
 * Individual files add themselves to these arrays.
 *
 * MUST be loaded BEFORE any data files.
 */

// Global arrays to collect data from individual files
const SATELLITE_FILES = [];
const PROCEDURE_FILES = [];
const ALARM_FILES = [];
const HARDWARE_FILES = [];

// Recursively ensure all nodes have IDs
function _ensureIds(node, prefix) {
    if (!node.id) {
        node.id = prefix + '-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    }
    if (node.modules && node.modules.length > 0) {
        node.modules.forEach(function(m) { _ensureIds(m, 'mod'); });
    }
}

// Helper function for satellite files to register themselves
function registerSatellite(satelliteData) {
    _ensureIds(satelliteData, 'sat');
    if (satelliteData.modules) {
        satelliteData.modules.forEach(function(m) { _ensureIds(m, 'mod'); });
    }
    SATELLITE_FILES.push(satelliteData);
}

// Helper function for procedure files to register themselves
function registerProcedure(data) {
    _ensureIds(data, 'proc');
    if (data.modules) {
        data.modules.forEach(function(m) { _ensureIds(m, 'mod'); });
    }
    PROCEDURE_FILES.push(data);
}

// Helper function for alarm files to register themselves
function registerAlarm(data) {
    _ensureIds(data, 'alm');
    if (data.modules) {
        data.modules.forEach(function(m) { _ensureIds(m, 'mod'); });
    }
    ALARM_FILES.push(data);
}

// Helper function for hardware files to register themselves
function registerHardware(data) {
    _ensureIds(data, 'hw');
    if (data.modules) {
        data.modules.forEach(function(m) { _ensureIds(m, 'mod'); });
    }
    HARDWARE_FILES.push(data);
}
