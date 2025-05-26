// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  components: true,
  compatibilityDate: "2025-05-15",
  devtools: { enabled: true },
  modules: ["@nuxt/ui", "@nuxtjs/tailwindcss"],
  alias: {
    "@": "/",
  },
  ui: {
    global: true,
    // icons: ['heroicons', 'simple-icons']
  },
  tailwindcss: {
    cssPath: "~/assets/css/tailwind.css",
    configPath: "tailwind.config.ts",
    exposeConfig: false,
    viewer: true,
  },
});
// https://nuxt.com/docs/api/configuration/nuxt-config
// export default defineNuxtConfig({
//   compatibilityDate: "2025-05-15",
//   devtools: { enabled: true },

//   modules: [
//     "@nuxt/content",
//     "@nuxt/fonts",
//     "@nuxt/icon",
//     "@nuxt/image",
//     "@nuxt/scripts",
//     "@nuxt/test-utils",
//     "@nuxt/ui",
//     "@nuxt/eslint",
//     "@nuxtjs/tailwindcss",
//   ],
//   // css: ['~/assets/css/main.css'],
//   alias: {
//     "@": ".",
//   },
// });
