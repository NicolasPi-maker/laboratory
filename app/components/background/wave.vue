<template>
    <div class="h-svh w-full overflow-hidden relative">
        <ul class="grid grid-cols-6">
            <li v-for="index in 90" :key="index" :style="`animation-delay: ${index * 0.08}s`" class="box col-span-1 border border-neutral-800 aspect-square bg-neutral-900"></li>
        </ul>
    </div>
</template>

<script setup>

</script>

<style scoped>
.box {
    animation: move 5s ease-in-out infinite;
    filter: drop-shadow(0 0 0.2rem var(--color-purple-500));
    background-image: linear-gradient(180deg,#d36efa13,#ce6bff00);
}

@keyframes move {
    0%   { transform: scale(1); }
    50%  { transform: scale(0.9); }
    100% { transform: scale(1); }
}

</style>