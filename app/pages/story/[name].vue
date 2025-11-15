<template>
  <div class="bg-black h-svh flex flex-col" v-if="story">
    <header class="h-20 w-full bg-inherit top-0 z-50 grid grid-cols-3 gap-1 relative">
      <div class="col-start-1 flex gap-4 m-4 text-white">
					<NuxtLink :to="{name: 'index'}" class="h-max p-1 border rounded-full border-white/50 bg-neutral-800 flex items-center justify-center">
						<Icon name="si:chevron-left-line" style="color: white" size="2em" />
					</NuxtLink>
      </div>
      <div class="col-start-2 flex">
        <HeaderContactPic :url="story.character1.pic" :name="`${story.character1.name} ${story.character1.lastname}`" />
      </div>
      <div class="col-start-3 text-white flex flex-col m-4">
        <HeaderBinaryButton v-model="pause" :callback="togglePause" class="self-end">
          <template #true>
            <svg xmlns="http://www.w3.org/2000/svg" width="1.5em" height="1.5em" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-linejoin="round" stroke-width="1.5" d="M18.89 12.846c-.353 1.343-2.023 2.292-5.364 4.19c-3.23 1.835-4.845 2.752-6.146 2.384a3.25 3.25 0 0 1-1.424-.841C5 17.614 5 15.743 5 12s0-5.614.956-6.579a3.25 3.25 0 0 1 1.424-.84c1.301-.37 2.916.548 6.146 2.383c3.34 1.898 5.011 2.847 5.365 4.19a3.3 3.3 0 0 1 0 1.692Z"/></svg>
          </template>
          <template #false>
            <svg xmlns="http://www.w3.org/2000/svg" width="1.5em" height="1.5em" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linejoin="round" stroke-width="1.5"><rect width="5" height="16.5" x="5" y="3.75" rx="2"/><rect width="5" height="16.5" x="14" y="3.75" rx="2"/></g></svg>
          </template>
        </HeaderBinaryButton>
      </div>
    </header>

    <section ref="conversationWrapper" class="flex-1 overflow-auto">
      <conversation-thread v-model="arrConv" />
    </section>

    <footer class="flex flex-col gap-2">
      <div class="h-16 py-3 px-4 flex gap-4 items-center">
        <button class="border border-white rounded-full flex justify-center items-center opacity-80 bg-gray-800">
          <Icon name="mynaui:plus" style="color: white" size="2em"/>
        </button>
        <div class="h-full border px-3 py-1 border-white opacity-80 flex-1 rounded-full bg-gray-800 flex items-center">
          <p class="text-sm text-white opacity-50 flex-1">Message</p>
          <Icon name="carbon:microphone" style="color:white" class="opacity-50" size="1.2em" />
        </div>
      </div>
  
      <div class="dropdown rounded-tr-2xl rounded-tl-2xl" :class="[isOpenChoiceTab ? 'p-4' : 'hide']">
        <ul class="inner text-white flex flex-col gap-8 items-end">
          <li v-for="choice in story.conversation[conversationIndex]?.choices" class="cursor-pointer" @click="chooseMessage(story.conversation[conversationIndex], choice)">
              <p class="text-sm px-2 py-2  text-white rounded-xl bg-blue-500 relative">
                {{ choice.text }}
              </p>
          </li>
        </ul>
      </div>
    </footer>

    <audio ref="sendSound" src="/sound/send.mp3"></audio>
  </div>
</template>

<script setup>
const { loadStory } = useStory();
const story = ref(null)
const route = useRoute()

onMounted(async () => {
	await setStory()
})

const setStory = async () => {
	const storyName = route.params.name
	try {
		const data = await loadStory(storyName);
		if(data) {
			story.value = data
			sendMessage()
		}
	} catch(e) {
		navigateTo('/')
	}
}

const pause = ref(false)

const togglePause = () => {
  if(pause.value) {
    // Continue conversation
    pause.value = false
    sendMessage()
  } else {
    // Stop conversation
    pause.value = true
    storedIndex = conversationIndex
  }
}

const isOpenChoiceTab = ref(false)

const arrConv = ref([])
const conversationWrapper = ref(null)
const sendSound = ref(null)

const isMute = ref(true)

const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}

let storedIndex = 0
let conversationIndex = 0

const defaultTimingMs = 3000
let previousMessageKey = null;

const toggleChoiceTab = async () => {
  if(isOpenChoiceTab.value) {
    isOpenChoiceTab.value = false;
    await sleep(500); // animation duration to avoid height break
  } else {
    await sleep(1000); // waiting time to make reading time reaction
    togglePause()
    isOpenChoiceTab.value = true;
    await sleep(500)
    scrollTobottomConv()
  }
}

const chooseMessage = async (message, choice) => {
    previousMessageKey = choice.key

    let newMessage = {
      text: choice.text,
      ...message
    }

    await toggleChoiceTab()
    await pushMessage(newMessage, true)

    togglePause()
}

const pushMessage = async (message, direct = false) => {
  if(!direct) {
    await sleep(message?.time ?? defaultTimingMs);
  }

	let newMessage = message
	newMessage.character = story.value[message.character]
  // Push message to display it
  arrConv.value.push(newMessage);
  conversationIndex++

  if(sendSound.value && !isMute.value) {
    sendSound.value.play()
  }
  // scroll to bottom of conversation
  await scrollTobottomConv()

}

const isEnd = ref(false)
const sendMessage = async () => {
  // Slice array to have only rest of conversation when use pause
  const truncatedConversation = story.value.conversation.slice(conversationIndex)
  for(let message of truncatedConversation) {
		let newMessage = {...message}

    if(pause.value) break;
    // time to wait before send current message in loop
    if(newMessage?.type === "choice") {
      await toggleChoiceTab()
    } else {
      if(newMessage?.replies) {
        newMessage = {
						...newMessage,
            text: newMessage.replies[previousMessageKey],
        }
      } else {
        previousMessageKey = null
      }

      await pushMessage(newMessage)
    }

		if(newMessage?.end) {
			isEnd.value = true
		}
  }

	if(story.value?.modificator && isEnd.value) {
		if(story.value?.modificator.infinite) {
			await sleep(3000)
			await resetStory()
			sendMessage()
		}
	}
}

const resetStory = async () => {
	isEnd.value = false
	storedIndex = 0
	conversationIndex = 0

	const messageCount = arrConv.value.length
	for(let i = 0; i < messageCount; i++) {
		arrConv.value.pop()
		await sleep(100)
	}
}

const scrollTobottomConv = async () => {
  await nextTick()
  requestAnimationFrame(() => {
    conversationWrapper.value.scrollTo({
      top: conversationWrapper.value.scrollHeight,
      behavior: 'smooth'
    })
  })
}
</script>

<style scoped>
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