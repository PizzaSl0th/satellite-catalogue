/**
 * INTERNATIONAL SPACE STATION
 * ============================
 *
 * To edit this satellite:
 * - Modify the data below
 * - Save the file
 * - Refresh the browser
 */

registerSatellite({
    id: "iss",
    name: "International Space Station",
    icon: "🛸",
    type: "Space Station",
    image: "",
    description: `The **International Space Station (ISS)** is a modular space station in low Earth orbit.

It is a multinational collaborative project involving NASA, Roscosmos, JAXA, ESA, and CSA.

**Key specifications:**
- Launch: 1998 (first module)
- Mass: ~420,000 kg
- Length: 109 meters
- Orbit: 408 km altitude
- Speed: 27,600 km/h`,

    modules: [
        {
            id: "iss-russian",
            name: "Russian Segment",
            icon: "🇷🇺",
            type: "Orbital Segment",
            description: `The **Russian Orbital Segment (ROS)** contains:

- Zarya (FGB) - First module launched
- Zvezda - Service Module
- Pirs - Docking Compartment
- Poisk - Mini Research Module
- Rassvet - Mini Research Module
- Nauka - Multipurpose Laboratory`,

            modules: [
                {
                    id: "iss-zarya",
                    name: "Zarya (FGB)",
                    icon: "🌅",
                    type: "Control Module",
                    description: `**Zarya** (Functional Cargo Block) was the first ISS component launched on November 20, 1998.

**Functions:**
- Provided initial propulsion
- Power generation (solar arrays)
- Storage

Now used primarily for storage and propellant.`
                },
                {
                    id: "iss-zvezda",
                    name: "Zvezda",
                    icon: "⭐",
                    type: "Service Module",
                    description: `**Zvezda** (Star) serves as the structural and functional center of the Russian segment.

**Provides:**
- Life support systems
- Living quarters
- Attitude control
- Propulsion (orbit reboost)

Contains sleeping quarters for two crew members.`
                },
                {
                    id: "iss-nauka",
                    name: "Nauka",
                    icon: "🔬",
                    type: "Laboratory Module",
                    description: `**Nauka** (Multipurpose Laboratory Module) launched in 2021.

**Features:**
- European Robotic Arm
- Airlock for experiments
- Additional sleeping quarters
- Toilet and hygiene facilities`
                }
            ]
        },
        {
            id: "iss-us",
            name: "US Orbital Segment",
            icon: "🇺🇸",
            type: "Orbital Segment",
            description: `The **US Orbital Segment (USOS)** includes modules from:
- United States
- Europe (ESA)
- Japan (JAXA)
- Canada (robotic arm)

Contains the primary research laboratories and crew quarters.`,

            modules: [
                {
                    id: "iss-destiny",
                    name: "Destiny Laboratory",
                    icon: "🧪",
                    type: "Research Module",
                    description: `**Destiny** is NASA's primary research laboratory.

**Dimensions:** 8.5m x 4.3m

**Features:**
- 24 equipment racks
- Life sciences research
- Materials science
- Earth observation window`
                },
                {
                    id: "iss-columbus",
                    name: "Columbus Laboratory",
                    icon: "🇪🇺",
                    type: "ESA Research Module",
                    description: `**Columbus** is the European Space Agency's contribution.

**Launched:** February 2008

**Research areas:**
- Fluid physics
- Materials science
- Life sciences
- Radiation physics`
                },
                {
                    id: "iss-kibo",
                    name: "Kibo Laboratory",
                    icon: "🇯🇵",
                    type: "JAXA Research Module",
                    description: `**Kibo** (Hope) is Japan's laboratory module - the largest on the ISS.

**Components:**
- Pressurized Module (PM)
- Exposed Facility (EF)
- Logistics Module
- Airlock
- Robotic Arm

Allows experiments exposed to space vacuum.`
                },
                {
                    id: "iss-cupola",
                    name: "Cupola",
                    icon: "👁️",
                    type: "Observation Module",
                    description: `**Cupola** provides a 360° observation dome.

**Features:**
- 7 windows
- Central 80cm diameter window (largest in space)
- Robotic arm control station

Used for Earth observation and spacecraft docking operations.`
                }
            ]
        },
        {
            id: "iss-solar",
            name: "Solar Arrays",
            icon: "☀️",
            type: "Power System",
            description: `The ISS has **8 solar array wings** providing electrical power.

**Total power generation:**
- 120 kilowatts peak
- 84 kilowatts average

Each array is 34m long x 12m wide.
Total surface area: ~2,500 square meters`,

            modules: [
                {
                    id: "iss-pv",
                    name: "Photovoltaic Arrays",
                    icon: "🔆",
                    type: "Solar Panels",
                    description: `Four pairs of solar array wings on the truss structure.

**Specifications:**
- Silicon solar cells
- 262,400 cells total
- Auto-rotate to track the sun

Arrays are on the S6, S4, P4, and P6 truss segments.`
                },
                {
                    id: "iss-batteries",
                    name: "Batteries",
                    icon: "🔋",
                    type: "Energy Storage",
                    description: `**Lithium-ion batteries** store power for eclipse periods.

Each orbit includes ~35 minutes of darkness.

Batteries replaced 2017-2021:
- 24 new Li-ion batteries
- Replaced 48 older nickel-hydrogen batteries`
                }
            ]
        },
        {
            id: "iss-canadarm",
            name: "Canadarm2",
            icon: "🦾",
            type: "Robotic System",
            description: `**Canadarm2** (SSRMS) is a 17-meter robotic arm.

**Capabilities:**
- Moves equipment and supplies
- Assists spacewalks
- Captures visiting spacecraft
- Can 'walk' along the station

Built by MDA Space for the Canadian Space Agency.`,

            modules: [
                {
                    id: "iss-arm-segments",
                    name: "Arm Segments",
                    icon: "💪",
                    type: "Boom Structure",
                    description: `Two boom segments with 7 motorized joints.

**Reach:** 17.6 meters
**Mass:** 1,800 kg
**Lift capacity:** 116,000 kg

Can move from one end to the other to reach any part of the station.`
                },
                {
                    id: "iss-dextre",
                    name: "Dextre",
                    icon: "🤖",
                    type: "Special Purpose Manipulator",
                    description: `**Dextre** (SPDM) is a two-armed robot that attaches to Canadarm2.

**Used for:**
- Delicate assembly tasks
- Maintenance work
- Replacing orbital units

Reduces the need for spacewalks.`
                }
            ]
        }
    ]
});
