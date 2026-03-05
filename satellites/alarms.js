/**
 * ALARMS
 * ========
 *
 * To edit alarms:
 * - Modify the data below
 * - Save the file
 * - Refresh the browser
 */

registerAlarm({
    id: "alarms",
    name: "Alarms",
    icon: "🚨",
    type: "Alarms",
    image: "",
    description: "Satellite alarms.",
    modules: [
        {
            id: "alm-thor5",
            name: "Thor 5",
            icon: "🛰️",
            type: "Alarms",
            description: "Alarms for **Thor 5** satellite.",
            modules: []
        },
        {
            id: "alm-thor6",
            name: "Thor 6",
            icon: "🛰️",
            type: "Alarms",
            description: "Alarms for **Thor 6** satellite.",
            modules: []
        },
        {
            id: "alm-thor7",
            name: "Thor 7",
            icon: "🛰️",
            type: "Alarms",
            description: "Alarms for **Thor 7** satellite.",
            modules: []
        }
    ]
});
