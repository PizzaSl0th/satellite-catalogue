/**
 * HARDWARE CATALOGUE
 * ===================
 *
 * Documents hardware used across satellite operations:
 * test equipment, cables, antennas, amplifiers, etc.
 *
 * To edit:
 * - Modify the data below, or use the in-app Edit buttons
 * - Save the file and refresh the browser
 *
 * To add more hardware categories, add entries to the modules array,
 * or copy this file and call registerHardware() with a new top-level entry.
 */

registerHardware({
    id: "hardware",
    name: "Hardware",
    icon: "🔧",
    type: "Hardware Catalogue",
    image: "",
    description: "Hardware inventory and specifications for satellite ground operations.",
    modules: [
        {
            id: "hw-test-equipment",
            name: "Test Equipment",
            icon: "🔬",
            type: "Test & Measurement",
            description: "Instruments used for signal measurement and verification.",
            modules: []
        },
        {
            id: "hw-cables",
            name: "Cables & Connectors",
            icon: "🔌",
            type: "RF / Data Cables",
            description: "RF cables, data cables, and connector inventory.",
            modules: []
        },
        {
            id: "hw-antennas",
            name: "Antennas",
            icon: "📡",
            type: "Antenna Systems",
            description: "Antenna hardware, mounts, and feed systems.",
            modules: []
        }
    ]
});
