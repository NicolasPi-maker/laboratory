<template>
    <div class="flex flex-col gap-1 justify-center items-center m-auto relative">
        <img :src="url" class="h-14 w-14 rounded-full object-cover shadow z-30" />
        <p class="text-white font-semibold border rounded-full px-2 py-1 whitespace-nowrap text-sm absolute bottom-0 glass translate-y-3/4">{{ name }}</p>
    </div>
</template>

<script setup>
defineProps({
    name: {
        type: String,
        default: "Inconnu"
    },
    url: {
        type: String,
        default: "/img/unknow.png"
    }
})
</script>

<style scoped>

</style>