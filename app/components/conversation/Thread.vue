<template>
    <ul class="flex flex-col gap-4 p-6">
        <li v-for="(text, index) in arrConv" :key="index" class="flex flex-col message text-white">
            <div class="flex w-full relative" :class="text.character.side === 'right' ? 'justify-end' : 'justify-start'">
            <p class="text-sm px-2 py-1 text-white rounded-xl max-w-2/3 z-30" 
            :class="[
                text.character.side === 'right' ? 'bg-blue-500' : 'bg-neutral-700']">
                {{ text.text }}
            </p>
            <span :class="[!arrConv[index + 1] || arrConv[index + 1].character.side !== text.character.side ? `tail-${text.character.side} z-10` : '']"></span>
            </div>
            <p class="text-xs opacity-50 self-end text-white mr-4 my-1" v-if="index === lastRightMessageIndex">Distribué</p>
        </li>
    </ul>
</template>

<script setup>
const arrConv = defineModel()

const lastRightMessageIndex = computed(() => {
    const localRef = [...arrConv.value]
    return localRef.findLastIndex(message => message.character.side === "right")
})
</script>

<style scoped>
.tail-right, .tail-left {
	content: '';
	position: absolute;
  width: 0;
	height: 0;
  border: 1em solid transparent;
  border-bottom: 0;
}

.tail-right {
	bottom: 0.25em;
	right: 0.25em;
	border-top-color: var(--color-blue-500);
	border-right: 0;
	margin-left: -0.375em;
	margin-bottom: -0.75em;
}

.tail-left {
	bottom: 0.25em;
	left: 0.75em;
	border-top-color: var(--color-neutral-700);
	border-left: 0;
	margin-left: -0.375em;
	margin-bottom: -0.75em;
}

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
</style>