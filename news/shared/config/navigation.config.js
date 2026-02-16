/*
 * Header navigation config.
 * - title/path/icon: top-level menu
 * - children: second-level menu list (optional)
 */
export const HEADER_NAVIGATION = [
    {
        title: 'HOME',
        path: '/news',
        icon: 'fa-house',
        children: [
             /*
            { title: 'Overview', path: '/news/generators' },
            { title: 'Buyer Guide', path: '/news/generators?view=guide' },
             */
        ],
    },
    {
        title: 'GasGx',
        path: '/index.html',
        icon: 'fa-globe',
        children: [],
    },
    {
        title: 'FLASH',
        path: '/news/flash',
        icon: 'fa-bolt',
        children: [

        ],
    },
    {
        title: 'GAS ENERGY',
        path: '/news/gas-energy',
        icon: 'fa-fire',
        children: [

        ],
    },
    {
        title: 'GENERATORS',
        path: '/news/generators',
        icon: 'fa-gears',
        children: [
            /*
            { title: 'Overview', path: '/news/generators' },
            { title: 'Buyer Guide', path: '/news/generators?view=guide' },
             */
        ],
    },
    {
        title: 'MINING',
        path: '/news/mining',
        icon: 'fa-bitcoin-sign',
        children: [

        ],
    },
    {
        title: 'INSIGHTS',
        path: '/news/insights',
        icon: 'fa-chart-line',
        children: [

        ],
    },
    {
        title: 'DATA',
        path: '/news/data',
        icon: 'fa-database',
        children: [

        ],
    },
    {
        title: 'EVENTS',
        path: '/news/events',
        icon: 'fa-calendar-days',
        children: [

        ],
    },
];
