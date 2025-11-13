<template>
  <div class="bg-black h-svh flex flex-col" v-if="story">
    <header class="h-20 w-full bg-inherit top-0 z-50 grid grid-cols-3 gap-1 relative">
      <div class="col-start-1 flex gap-4 m-4 text-white">
					<NuxtLink :to="{name: 'index'}" class="h-max p-1 border rounded-full border-white/50 bg-neutral-800 flex items-center justify-center">
						<Icon name="si:chevron-left-line" style="color: white" size="2em" />
					</NuxtLink>
					<!-- <HeaderBinaryButton v-model="isMute">
						<template #true>
							<svg xmlns="http://www.w3.org/2000/svg" width="1.5em" height="1.5em" viewBox="0 0 32 32"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.5 21H8a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1h7l6.586-6.586C22.846 3.154 25 4.047 25 5.828V6m0 8.5v11.672c0 1.781-2.154 2.674-3.414 1.414L17 23M7 28L29 6"/></svg>
						</template>
						<template #false>
							<svg xmlns="http://www.w3.org/2000/svg" width="1.5em" height="1.5em" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="1.5"><path d="M1 13.857v-3.714a2 2 0 0 1 2-2h2.9a1 1 0 0 0 .55-.165l6-3.956a1 1 0 0 1 1.55.835v14.286a1 1 0 0 1-1.55.835l-6-3.956a1 1 0 0 0-.55-.165H3a2 2 0 0 1-2-2Z"/><path stroke-linecap="round" stroke-linejoin="round" d="M17.5 7.5S19 9 19 11.5s-1.5 4-1.5 4m3-11S23 7 23 11.5s-2.5 7-2.5 7"/></g></svg>
						</template>
					</HeaderBinaryButton> -->
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

const defaultTimingMs = 4000
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
    let character = story.value[message.character]

    let newMessage = {
      text: choice.text,
      ...message
    }

    newMessage.character = character

    await toggleChoiceTab()
    await pushMessage(newMessage, true)

    togglePause()
}

const pushMessage = async (message, direct = false) => {
  if(!direct) {
    await sleep(message?.time ?? defaultTimingMs);
  }
  // Push message to display it
  arrConv.value.push(message);
  conversationIndex++

  if(sendSound.value && !isMute.value) {
    sendSound.value.play()
  }
  // scroll to bottom of conversation
  await scrollTobottomConv()

}

const sendMessage = async () => {
  // Slice array to have only rest of conversation when use pause
  const truncatedConversation = story.value.conversation.slice(conversationIndex)
  for(let message of truncatedConversation) {
    if(pause.value) break;
    let currCharacter = story.value[message.character]
    // time to wait before send current message in loop
    if(message?.type === "choice") {
      await toggleChoiceTab()
    } else {
      if(message?.replies) {
        message = {
            text: message.replies[previousMessageKey]
        }
      } else {
        previousMessageKey = null
      }

      message.character = currCharacter
      await pushMessage({character: currCharacter, ...message})
    }
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