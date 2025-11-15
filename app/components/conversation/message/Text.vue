<template>
    <div 
        class="text-sm px-3 py-2 text-white rounded-2xl max-w-2/3 z-30 relative"
        :class="[message.character.side === 'right' ? 'bg-blue-500' : 'bg-neutral-700']"
    >
        <p>{{ message.text }}</p>
        <span :class="[!nextSide || nextSide !== message.character.side ? `tail-${message.character.side} z-10` : '']"></span>
    </div>
</template>

<script setup>
defineProps({
    message: {
        type: Object,
        required: true
    },
    nextSide: {
        type: String,
        default: null
    }
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
	right: 0.5em;
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
</style>