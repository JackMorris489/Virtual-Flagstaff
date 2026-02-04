import { defineConfig } from "vite";

export default defineConfig({
    base: "./",
    open: ".\\frontend\\virtualflagstaff\\index.html",
    build: {
        rollupOptions: {
            output: {
                entryFileNames: 'assets/js/[name]-[hash].js'
            },
        },
    },
});