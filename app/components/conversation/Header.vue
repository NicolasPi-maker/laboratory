<template>
    <div>
        <div class="col-start-1 flex gap-4 m-4 text-white">
            <NuxtLink :to="{name: 'index'}" class="h-max p-1 border rounded-full border-white/50 bg-neutral-800 flex items-center justify-center">
                <Icon name="si:chevron-left-line" style="color: white" size="2em" />
            </NuxtLink>
        </div>
        <div class="col-start-2 flex">
            <ConversationHeaderContactPic :url="character.pic" :name="`${character.name} ${character.lastname}`" />
        </div>
        <div class="col-start-3 text-white flex flex-col m-4">
            <ConversationHeaderBinaryButton v-model="pause" :callback="() => emit('togglePause')" class="self-end">
                <template #true>
                    <svg xmlns="http://www.w3.org/2000/svg" width="1.5em" height="1.5em" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-linejoin="round" stroke-width="1.5" d="M18.89 12.846c-.353 1.343-2.023 2.292-5.364 4.19c-3.23 1.835-4.845 2.752-6.146 2.384a3.25 3.25 0 0 1-1.424-.841C5 17.614 5 15.743 5 12s0-5.614.956-6.579a3.25 3.25 0 0 1 1.424-.84c1.301-.37 2.916.548 6.146 2.383c3.34 1.898 5.011 2.847 5.365 4.19a3.3 3.3 0 0 1 0 1.692Z"/></svg>
                </template>
                <template #false>
                    <svg xmlns="http://www.w3.org/2000/svg" width="1.5em" height="1.5em" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linejoin="round" stroke-width="1.5"><rect width="5" height="16.5" x="5" y="3.75" rx="2"/><rect width="5" height="16.5" x="14" y="3.75" rx="2"/></g></svg>
                </template>
            </ConversationHeaderBinaryButton>
        </div>
    </div>
</template>

<script setup>
const pause = defineModel()

defineProps({
    character: {
        type: Object
    }
})

const emit = defineEmits({
    togglePause: () => true
})
</script>

<style scoped>

</style>