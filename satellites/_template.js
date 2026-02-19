/**
 * SATELLITE TEMPLATE
 * ===================
 *
 * HOW TO ADD A NEW SATELLITE:
 * 1. Copy this file
 * 2. Rename it (e.g., "my-satellite.js")
 * 3. Edit the data below
 * 4. Add <script src="satellites/my-satellite.js"></script> to index.html
 *    (add it AFTER _loader.js but BEFORE app.js)
 * 5. Refresh the browser
 *
 * FORMATTING TIPS:
 * - Use **text** for bold
 * - Use *text* for italic
 * - Use - at the start of a line for bullet points
 * - Use template literals (`backticks`) for multi-line descriptions
 *
 * NESTING:
 * - You can nest modules infinitely deep
 * - Each module can have its own "modules" array
 */

registerSatellite({
    // Unique identifier (lowercase, no spaces)
    id: "my-satellite",

    // Display name
    name: "My Satellite Name",

    // Emoji icon for the bubble
    icon: "🛰️",

    // Category/type label
    type: "Communications Satellite",

    // Image path (optional) - put images in the images/ folder
    image: "",

    // Main description (supports **bold** and *italic*)
    description: `This is the main description of the satellite.

You can use multiple paragraphs.

**Key specifications:**
- Specification 1
- Specification 2
- Specification 3`,

    // Modules/components (can be nested infinitely)
    modules: [
        {
            id: "module-1",
            name: "First Module",
            icon: "📡",
            type: "Payload",
            description: `Description of the first module.

Add details here.`,

            // Sub-modules (optional)
            modules: [
                {
                    id: "submodule-1",
                    name: "Sub-component",
                    icon: "📦",
                    type: "Component",
                    description: "Description of this sub-component.",
                    modules: [] // Can continue nesting
                }
            ]
        },
        {
            id: "module-2",
            name: "Second Module",
            icon: "⚡",
            type: "Power System",
            description: "Description of the second module.",
            modules: []
        }
    ]
});
