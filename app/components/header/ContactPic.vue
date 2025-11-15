<template>
    <div class="flex flex-col gap-1 justify-center items-center m-auto relative">
        <div class="h-14 w-14 rounded-full shadow z-30 overflow-hidden">
            <img v-if="url" :src="url" class="w-full object-cover" />
            <div class="bg-neutral-500 h-full w-full text-xl text-white flex justify-center items-center" v-else><h4>{{ name }}</h4></div>
        </div>
        <p class="text-white font-semibold border rounded-full px-2 py-1 whitespace-nowrap text-sm absolute bottom-0 glass translate-y-4/5">{{ name }}</p>
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