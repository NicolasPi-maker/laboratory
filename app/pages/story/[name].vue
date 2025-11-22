<template>
  <div class="bg-black h-svh flex flex-col" v-if="!loading">
    <header >
      <ConversationHeader 
				:character="story.character1"
				@toggle-pause="togglePause"
				v-model="pause"
				class="h-20 w-full bg-inherit top-0 z-50 grid grid-cols-3 gap-1 relative"
			/>
    </header>
    <section ref="conversationWrapper" class="flex-1 overflow-auto">
      <conversation-thread 
				v-model="arrConv"
				@pause="setPause"
				@unpause="setUnpause"
			/>
    </section>
    <footer class="flex flex-col gap-2">
      <div class="h-16 py-3 px-4 flex gap-4 items-center">
        <button class="border border-white rounded-full flex justify-center items-center opacity-80 bg-neutral-700">
          <Icon name="mynaui:plus" style="color: white" size="2em"/>
        </button>
        <div class="h-full border px-3 py-1 border-white opacity-80 flex-1 rounded-full bg-neutral-700 flex items-center">
          <p class="text-sm text-white opacity-50 flex-1">Message</p>
          <Icon name="carbon:microphone" style="color:white" class="opacity-50" size="1.2em" />
        </div>
      </div>
  
      <div class="dropdown rounded-tr-2xl rounded-tl-2xl" :class="[isOpenChoiceTab ? 'p-4' : 'hide']">
        <ul class="inner text-white flex flex-col gap-6 items-end">
          <li v-for="choice in story.conversation[conversationIndex]?.choices" class="cursor-pointer" @click="chooseMessage(story.conversation[conversationIndex], choice)">
              <p class="text-sm choice relative bg-neutral-900 rounded-2xl">
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

const loading = ref(true);

onMounted(async () => {
	const filename = route.params.name
	await setStory(filename)
})

const setStory = async (filename) => {
	try {
		loading.value = true

		const directory = route.params.name
		const data = await loadStory(`${directory}/${filename}`);

		if(data) {
			story.value = data
			sendMessage()
		}
	} catch(e) {
		navigateTo('/')
	} finally {
		loading.value = false
	}
}

const pause = ref(false)

const togglePause = () => {
  if(pause.value) {
    // Continue conversation
    setUnpause()
  } else {
    // Stop conversation
    setPause()
  }
}

const setPause = () => {
	pause.value = true
}

const setUnpause = () => {
	if(isOpenChoiceTab.value) return

	pause.value = false
	sendMessage()
}

const isOpenChoiceTab = ref(false)

const arrConv = ref([])
const conversationWrapper = ref(null)
const sendSound = ref(null)

const isMute = ref(true)

const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}

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
	let newMessage = message
	newMessage.character = story.value[message.character]
  // Push message to display it
	conversationIndex++

  if(!direct) {
    await sleep(message?.time ?? defaultTimingMs);
  }
  arrConv.value.push(newMessage);

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

	if(story.value?.meta?.next && isEnd.value) {
		if(story.value?.meta?.next) {
			await resetStory()
			story.value = setStory(story.value.meta.next)
		}
	}
}

const resetStory = async () => {
	await sleep(3000)

	isEnd.value = false
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

.choice {
  border: 1px solid rgba(255,255,255,0.15);
  padding: 10px 14px;
  color: #E2E8F0;
  backdrop-filter: blur(4px);
  align-self: flex-end;
  transition: 0.15s ease;
}

.choice:hover {
  border-color: rgba(255,255,255,0.35);
  cursor: pointer;
  transform: translateY(-1px);
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