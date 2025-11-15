<template>
  <div>
    <ul class="flex flex-col gap-4 p-6">
      <li v-for="(text, index) in arrConv" :key="index" class="flex flex-col message text-white">
          <div class="flex w-full" :class="text.character.side === 'right' ? 'justify-end' : 'justify-start'">
            <img v-if="text?.type === 'image'" :src="text.url" width="300px" height="300px" :alt="text.alt" class="max-w-2/3 rounded-2xl" @click="toggleGallery({url: text.url, alt: text.alt})">
            <conversation-message-text v-else :message="text" :next-side="arrConv[index + 1]?.character.side" />
          </div>
          <p class="text-xs opacity-50 self-end text-white mr-4 my-1" v-if="index === lastRightMessageIndex">Distribué</p>
      </li>
    </ul>
    <div @click="toggleGallery" :class="galeryOpen ? 'z-50 scale-100': 'opacity-0 scale-50 -z-1'" class="absolute transition-all delay-150 drop-shadow-blue-300 top-0 left-0 w-full h-svh flex justify-center items-center bg-black">
      <img :src="selectedImg?.url" :alt="selectedImg?.alt">
    </div>
  </div>
</template>

<script setup>
const arrConv = defineModel()

const lastRightMessageIndex = computed(() => {
    const localRef = [...arrConv.value]
    return localRef.findLastIndex(message => message.character.side === "right")
})

const galeryOpen = ref(false)
const selectedImg = ref(null)

const toggleGallery = (img = null) => {
  if(galeryOpen.value) {
    closeGallery()
  } else {
    if(img) {
      openGallery(img)
    }
  }
}

const openGallery = (img) => {
  galeryOpen.value = true
  selectedImg.value = img
}

const closeGallery = () => {
  galeryOpen.value = false;
  selectedImg.value = null
}
</script>

<style scoped>
.message {
  animation: fade-in .3s ease-in;
}

@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.dropdown {
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.5s ease;
  display: grid;
}

.inner {
  overflow: hidden;
}

.dropdown:not(.hide) {
  grid-template-rows: 1fr !important;
}

.dropdown:not(.hide) .inner {
  overflow: auto;
}
</style>