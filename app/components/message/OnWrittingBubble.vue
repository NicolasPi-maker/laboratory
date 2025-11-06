<template>
	<div>
		<ul class="onwriting-wrapper flex gap-2 rounded-full bg-neutral-700 p-4 w-max m-auto">
			<li v-for="dot in 3" :key="dot" class="h-2 w-2 rounded-full bg-gray-300"></li>
		</ul>
	</div>
</template>

<script setup>

</script>

<style scoped>
.onwriting-wrapper :nth-child(1) {
  animation: up-down 1s ease-in both infinite;
}

.onwriting-wrapper :nth-child(2) {
  animation: up-down 1s .250s ease-in both infinite;
}

.onwriting-wrapper :nth-child(3) {
  animation: up-down 1s .5s ease-in both infinite;
}

@keyframes up-down {
  0% {

    transform: scale(1);
  }
  50% {

    transform: scale(1.2);
  }
  100% {

    transform: scale(1);
  }
}
</style>