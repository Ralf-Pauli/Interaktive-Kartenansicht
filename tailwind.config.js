module.exports = {
    mode: 'jit',
    content: [
        "./index.html",
        "./src/**/*.{vue,js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                ninaOrange: "#ff5900",
                ninaLightOrange: "#FB8C00",
            },
        },
    },
    plugins: [],
    darkMode: 'class',
}