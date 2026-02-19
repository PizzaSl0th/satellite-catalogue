/**
 * SATELLITE LOADER
 * =================
 * This file initializes the satellite collection.
 * Individual satellite files add themselves to this array.
 *
 * MUST be loaded BEFORE any satellite files.
 */

// Global array to collect satellites from individual files
const SATELLITE_FILES = [];

// Helper function for satellite files to register themselves
function registerSatellite(satelliteData) {
    // Ensure the satellite has an ID
    if (!satelliteData.id) {
        satelliteData.id = 'sat-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    }

    // Recursively ensure all modules have IDs
    function ensureIds(node) {
        if (!node.id) {
            node.id = 'mod-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
        }
        if (node.modules && node.modules.length > 0) {
            node.modules.forEach(ensureIds);
        }
    }

    if (satelliteData.modules) {
        satelliteData.modules.forEach(ensureIds);
    }

    SATELLITE_FILES.push(satelliteData);
}
