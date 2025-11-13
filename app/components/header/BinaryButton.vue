<template>
    <div class="p-2 glass-circle h-max rounded-full justify-center items-center w-max" @click="callback ? callback() : value = !value">
        <slot name="true" v-if="value"></slot>
        <slot name="false" v-else></slot>
    </div>
</template>

<script setup>
const value = defineModel()

defineProps({
    callback: Function
})
</script>

<style scoped>

</style>