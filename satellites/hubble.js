/**
 * HUBBLE SPACE TELESCOPE
 * =======================
 *
 * To edit this satellite:
 * - Modify the data below
 * - Save the file
 * - Refresh the browser
 *
 * Formatting tips:
 * - Use **text** for bold
 * - Use *text* for italic
 * - Use - at start of line for bullet points
 * - Use \n for new lines
 */

registerSatellite({
    id: "hubble",
    name: "Hubble Space Telescope",
    icon: "🔭",
    type: "Space Telescope",
    image: "",
    description: `The **Hubble Space Telescope (HST)** is a space telescope that was launched into low Earth orbit in 1990 and remains in operation.

It is one of the largest and most versatile space telescopes, renowned for its visible light images.

**Key specifications:**
- Launch Date: April 24, 1990
- Mass: 11,110 kg
- Orbit: Low Earth Orbit (540 km)
- Mission Duration: 30+ years`,

    modules: [
        {
            id: "hubble-ota",
            name: "Optical Telescope Assembly",
            icon: "🔬",
            type: "Primary Optics",
            description: `The **Optical Telescope Assembly (OTA)** is the main optical component of Hubble. It collects light from distant celestial objects and focuses it onto the scientific instruments.

The OTA uses a Ritchey-Chrétien design with two hyperbolic mirrors:
- Primary mirror: 2.4 meters diameter
- Secondary mirror: 0.3 meters diameter`,

            modules: [
                {
                    id: "hubble-primary",
                    name: "Primary Mirror",
                    icon: "🪞",
                    type: "Main Reflector",
                    description: `The **Primary Mirror** is a 2.4-meter diameter concave hyperbolic mirror.

**Specifications:**
- Diameter: 2.4 m (7.9 ft)
- Weight: 828 kg
- Material: Ultra-low expansion glass
- Coating: Aluminum with magnesium fluoride`,

                    modules: [
                        {
                            id: "hubble-substrate",
                            name: "Mirror Substrate",
                            icon: "💎",
                            type: "Base Material",
                            description: `Made from **ultra-low expansion (ULE) glass** by Corning.

The glass has near-zero thermal expansion to maintain precise shape across temperature variations in space.`
                        },
                        {
                            id: "hubble-coating",
                            name: "Reflective Coating",
                            icon: "✨",
                            type: "Surface Layer",
                            description: `The mirror is coated with:
- **Aluminum** (primary reflective layer) - 75 nanometers thick
- **Magnesium fluoride** (protective overcoat) - 25 nanometers thick`
                        }
                    ]
                },
                {
                    id: "hubble-secondary",
                    name: "Secondary Mirror",
                    icon: "🔲",
                    type: "Secondary Reflector",
                    description: `The **Secondary Mirror** is a 0.3-meter convex hyperbolic mirror positioned at the top of the telescope.

It receives light from the primary mirror and reflects it back through a hole in the primary to the focal plane.`
                }
            ]
        },
        {
            id: "hubble-instruments",
            name: "Scientific Instruments",
            icon: "📡",
            type: "Payload",
            description: `Hubble carries five main scientific instruments:

- Wide Field Camera 3 (WFC3)
- Cosmic Origins Spectrograph (COS)
- Advanced Camera for Surveys (ACS)
- Space Telescope Imaging Spectrograph (STIS)
- Near Infrared Camera and Multi-Object Spectrometer (NICMOS)`,

            modules: [
                {
                    id: "hubble-wfc3",
                    name: "Wide Field Camera 3",
                    icon: "📷",
                    type: "Imaging Camera",
                    description: `**WFC3** was installed in 2009 during Servicing Mission 4.

It can observe in:
- Ultraviolet (200-400 nm)
- Visible light (400-700 nm)
- Near-infrared (700-1700 nm)`
                },
                {
                    id: "hubble-cos",
                    name: "Cosmic Origins Spectrograph",
                    icon: "🌈",
                    type: "UV Spectrograph",
                    description: `**COS** is optimized for ultraviolet spectroscopy.

Wavelength range: 115-320 nm

Used for studying the intergalactic medium, galaxy evolution, and star formation.`
                }
            ]
        },
        {
            id: "hubble-spacecraft",
            name: "Spacecraft Systems",
            icon: "🚀",
            type: "Bus Subsystems",
            description: `The spacecraft bus provides all support functions:

- Power generation and storage
- Attitude control and pointing
- Communications
- Thermal control`,

            modules: [
                {
                    id: "hubble-power",
                    name: "Power System",
                    icon: "⚡",
                    type: "Electrical Power",
                    description: `**Solar Arrays:** Two arrays generating 2,800 watts

**Batteries:** Six nickel-hydrogen batteries for eclipse periods (36 minutes per orbit)`
                },
                {
                    id: "hubble-pointing",
                    name: "Pointing Control",
                    icon: "🎯",
                    type: "Attitude Control",
                    description: `Achieves **0.007 arcsecond** pointing precision.

**Components:**
- Fine Guidance Sensors (3)
- Reaction Wheels (4)
- Rate Gyroscopes (6)
- Magnetic Torquers (4)`
                }
            ]
        }
    ]
});
