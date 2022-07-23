<script setup lang='ts'>
import gsap from "gsap";
const title = ref(null);
const content = ref(null);
const button = ref(null);

onMounted(() => {
    gsap.to(title.value, {
        opacity: 1,
        duration: 2.4,
        y: 0,
        ease: "elastic",
    });

    gsap.to(content.value, {
        opacity: 1,
        duration: 2.4,
        delay: 0.3,
        y: 0,
        ease: "elastic",
    });

    gsap.to(button.value, {
        opacity: 1,
        duration: 2.4,
        delay: 0.3,
        y: 0,
        ease: "elastic",
    });

});


</script>

<template>
    <div class="bg-black text-white h-screen px-7 py-12">
        <h1 ref="title" class="opacity-0 translate-y-20 text-5xl">MY WORK</h1>
        <div class="flex justify-center items-center h-full">
            <h2 ref="content" class="basis-auto opacity-0 translate-y-20 text-8xl font-thin pb-60 ml-20">INSERT WORK
            </h2>
             <NuxtLink to="/">
                <button ref="button" class="basis-auto opacity-0 translate-y-20 text-5xl font-thin mt-20">Go back</button>
             </NuxtLink>
        </div>

    </div>
</template>

<style scoped>
</style>