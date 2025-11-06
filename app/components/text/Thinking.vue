<template>
	<div class="h-screen w-full flex justify-center items-center">
    <p class="loading-text">{{ text }} 
      <span class="before-container">
        <span class=" block relative before-anchor h-full w-full"></span>
      </span>
    </p>
  </div>
</template>

<script setup>
const props = defineProps({
  text: {
    type: String,
    default: "Réflexion en cours"
  }
})

const timeInMsPerLetter = 100

const animationDurationInMs = computed(() => {
  return (props.text.length * timeInMsPerLetter).toString()
})
</script>

<style scoped>
.loading-text {
  position: relative;
}

.before-container {
  position: absolute;
  height: 100%;
  width: calc(100% + 40px);
  transform: translateX(-90%);
  animation: slide v-bind(animationDurationInMs + "ms") both infinite linear;
  filter: blur(5px);
}

.before-anchor::before {
  position: absolute;
  content: "";
  height: 100%;
  width: 20px;
  opacity: 0.9;
  background-color: white;
  top: 0;
  left: 0;
  z-index: 50;
}

@keyframes slide {
  from {
    width: calc(100% + 40px);
  }
  to {
    width: 0%;
  }
}
</style>