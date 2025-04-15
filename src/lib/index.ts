// place files you want to import through the `$lib` alias in this folder.

// Create a minimal window shim for server-side
const windowShim = {
    // Add any properties your library needs
    location: {
        href: '',
        origin: '',
        protocol: '',
        host: '',
        hostname: '',
        port: '',
        pathname: '',
        search: '',
        hash: ''
    },
    navigator: {
        userAgent: 'node'
    },
    // Add any other window properties your library might need
    document: {
        createElement: () => ({}),
        querySelector: () => null,
        querySelectorAll: () => []
    },
    // Add any methods your library might need
    addEventListener: () => {},
    removeEventListener: () => {},
    setTimeout: () => {},
    clearTimeout: () => {},
    setInterval: () => {},
    clearInterval: () => {}
};

// Export either the real window or our shim
export const window = typeof globalThis.window !== 'undefined' 
    ? globalThis.window 
    : windowShim;