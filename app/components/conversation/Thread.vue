<template>
  <div>
    <ul class="flex flex-col gap-4 p-6">
      <li v-for="(text, index) in arrConv" :key="index" class="flex flex-col message text-white">
          <div v-if="text.character.side !== 'none'" class="flex w-full" :class="text.character.side === 'right' ? 'justify-end' : 'justify-start'">
            <img v-if="text?.type === 'image'" :src="text.url" :alt="text.alt" class="message-img max-w-2/3 rounded-2xl" @click="toggleGallery({url: text.url, alt: text.alt})">
            <conversation-message-text v-else :message="text" :next-side="arrConv[index + 1]?.character.side" />
          </div>
          <p v-else class="text-center p-2">
            {{ text.text }}
          </p>
          <p class="text-xs self-end mr-4 my-1 transition-all duration-300" :class="[index === lastRightMessageIndex ? 'max-h-4 text-white/50' : 'max-h-0 opacity-0']">Distribué</p>
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
  emit('pause')
}

const closeGallery = () => {
  galeryOpen.value = false;
  selectedImg.value = null
  emit('unpause')
}

const emit = defineEmits({
  pause: () => true,
  unpause: () => true
})
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

.message-img {
  min-width: 200px;
  max-width: 66%;
  min-height: 200px;
}
</style>