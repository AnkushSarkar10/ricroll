import { defineNuxtConfig } from "nuxt";

// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
  meta: {
    title: "babe"
    // script: [{ src:'https://unpkg.com/three/examples/jsm/controls/OrbitControls.js'}]
  },
  ssr: true,
  modules: ["@nuxtjs/tailwindcss"]
  
});
