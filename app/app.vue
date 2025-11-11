<template>
  <div class="bg-black h-svh flex flex-col">
    <header class="h-24 w-full bg-inherit top-0 z-50 grid grid-cols-3 gap-1">
      <div @click="isMute = !isMute" class="col-start-1 flex flex-col gap-1 justify-center items-center text-white">
        <svg v-if="isMute" xmlns="http://www.w3.org/2000/svg" width="2em" height="2em" viewBox="0 0 32 32"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.5 21H8a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1h7l6.586-6.586C22.846 3.154 25 4.047 25 5.828V6m0 8.5v11.672c0 1.781-2.154 2.674-3.414 1.414L17 23M7 28L29 6"/></svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" width="2em" height="2em" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="1.5"><path d="M1 13.857v-3.714a2 2 0 0 1 2-2h2.9a1 1 0 0 0 .55-.165l6-3.956a1 1 0 0 1 1.55.835v14.286a1 1 0 0 1-1.55.835l-6-3.956a1 1 0 0 0-.55-.165H3a2 2 0 0 1-2-2Z"/><path stroke-linecap="round" stroke-linejoin="round" d="M17.5 7.5S19 9 19 11.5s-1.5 4-1.5 4m3-11S23 7 23 11.5s-2.5 7-2.5 7"/></g></svg>
      </div>
      <div class="col-start-2 flex flex-col gap-1 justify-center items-center">
        <img src="/img/telman.png" class="h-14 w-14 rounded-full object-cover shadow" />
        <p class="text-white font-semibold">Dr Telman</p>
      </div>
      <div class="col-start-3 text-white flex flex-col justify-center items-center" @click="togglePause">
        <svg v-if="pause" xmlns="http://www.w3.org/2000/svg" width="2em" height="2em" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-linejoin="round" stroke-width="1.5" d="M18.89 12.846c-.353 1.343-2.023 2.292-5.364 4.19c-3.23 1.835-4.845 2.752-6.146 2.384a3.25 3.25 0 0 1-1.424-.841C5 17.614 5 15.743 5 12s0-5.614.956-6.579a3.25 3.25 0 0 1 1.424-.84c1.301-.37 2.916.548 6.146 2.383c3.34 1.898 5.011 2.847 5.365 4.19a3.3 3.3 0 0 1 0 1.692Z"/></svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" width="2em" height="2em" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linejoin="round" stroke-width="1.5"><rect width="5" height="16.5" x="5" y="3.75" rx="2"/><rect width="5" height="16.5" x="14" y="3.75" rx="2"/></g></svg>
      </div>
    </header>
    <ul class="flex flex-col gap-4 p-6 overflow-auto flex-1" ref="conversationWrapper">
      <li v-for="(text, index) in arrConv" :key="index" class="flex flex-col message">
        <div class="flex w-full relative" :class="text.character.side === 'right' ? 'justify-end' : 'justify-start'">
          <p class="text-sm px-2 py-1 text-white rounded-xl max-w-2/3 z-30" 
          :class="[
            text.character.side === 'right' ? 'bg-blue-500' : 'bg-neutral-700']">
            {{ text.text }}
          </p>
          <span :class="[!arrConv[index + 1] || arrConv[index + 1].character.side !== text.character.side ? `tail-${text.character.side} z-10` : '']"></span>
        </div>
        <!-- <p class="text-xs opacity-50 self-end text-white mr-4 my-1" v-if="index === lastRightMessageIndex">Distribué</p> -->
      </li>
    </ul>
    <div class="h-16 py-3 px-4 flex gap-4 items-center ">
      <button class="border border-white rounded-full flex justify-center items-center opacity-80 bg-gray-800">
        <Icon name="mynaui:plus" style="color: white" size="2em"/>
      </button>
      <div class="h-full border px-3 py-1 border-white opacity-80 flex-1 rounded-full bg-gray-800 flex items-center">
        <p class="text-sm text-white opacity-50 flex-1">Message</p>
        <Icon name="carbon:microphone" style="color:white" class="opacity-50" size="1.2em" />
      </div>
    </div>
    <div class="dropdown p-4" :class="[isOpenChoiceTab ? '' : 'hide']">
      <ul class="inner text-white flex flex-col gap-4 items-end">
        <li v-for="choice in conversation[conversationIndex].choices" class="w-auto cursor-pointer" @click="chooseMessage(conversation[conversationIndex], choice)">
            <p class="text-sm px-2 py-1 text-white rounded-xl bg-blue-500">
              {{ choice.text }}
            </p>
        </li>
      </ul>
    </div>
    <audio ref="sendSound" src="/sound/send.mp3"></audio>
  </div>
</template>

<script setup>
onMounted(() => {
  sendMessage()
})

const lastRightMessageIndex = ref(null)

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

const chooseMessage = async (message, choice) => {
    previousMessageKey = choice.key
    let newMessage = {
      character: message.character,
      text: choice.text,
      ...message
    }

    await pushMessage(newMessage, true)

    togglePause()
    isOpenChoiceTab.value = false
}

const pushMessage = async (message, direct = false) => {
  if(!direct) {
    await sleep(message?.time ?? defaultTimingMs);
  }
  // Push message to display it
  arrConv.value.push(message);
  conversationIndex++

  message.character.side === "right" ? lastRightMessageIndex.value = conversationIndex : null;

  if(sendSound.value && !isMute.value) {
    sendSound.value.play()
  }
  // scroll to bottom of conversation
  await scrollTobottomConv()

}

const sendMessage = async () => {
  // Slice array to have only rest of conversation when use pause
  const truncatedConversation = conversation.slice(conversationIndex)

  for(let [index, message] of truncatedConversation.entries()) {
    if(pause.value) break;
    // time to wait before send current message in loop
    if(message?.type === "choice") {
      await sleep(1000);

      isOpenChoiceTab.value = true
      togglePause()
    } else {
      if(message?.replies) {
        message = {
            character: message.character,
            text: message.replies[previousMessageKey]
        }
        previousMessageKey = null
      }
      await pushMessage(message)
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

const character1 = {
  side: "left",
  role: "Psy",
  name: "Ana",
  lastname: "Telman",
}

const character2 = {
  side: "right",
  role: "Patient",
  name: "Turner",
  lastname: "John",
}

const conversation = [
  {
    character: character1,
    text: "Bonjour Monsieur Turner.",
  },
  {
    character: character2,
    type: "choice",
    choices: [
      { key: "polite", text: "Bonjour docteur Telman." },
      { key: "direct", text: "J'avais besoin de vous voir." },
    ],
  },
  {
    character: character1,
    replies: {
      polite: "Comment allez-vous aujourd’hui ? Vous aviez l’air plus détendu la dernière fois.",
      direct: "Je vous écoute, Turner. Quelque chose vous tracasse ?",
    },
  },
  {
    character: character2,
    text: "Oui, un peu… mais ça n’a pas duré. Les nuits sont redevenues compliquées.",
  },
  {
    character: character1,
    text: "Vous avez du mal à dormir ?",
  },
  {
    character: character2,
    type: "choice",
    choices: [
      { key: "insomnia", text: "Je m'endors vite, mais je me réveille chaque nuit." },
      { key: "details", text: "Oui… toujours vers la même heure, sans raison apparente." },
    ],
  },
  {
    character: character1,
    replies: {
      insomnia: "Vers quelle heure exactement ?",
      details: "Cette heure fixe vous semble-t-elle significative ?",
    },
  },
  {
    character: character2,
    text: "Trois heures vingt. Presque toujours la même minute.",
  },
  {
    character: character1,
    text: "Et que faites-vous alors ?",
  },
  {
    character: character2,
    text: "Je me lève, je bois un verre d’eau. Parfois j’allume la lumière, parfois je reste assis dans le noir.",
  },
  {
    character: character2,
    text: "Il y a ce silence à cette heure-là… il n’est pas reposant, docteur. Il est lourd, presque menaçant.",
  },
  {
    character: character1,
    text: "Vous dites 'menaçant'. Qu’est-ce qui vous fait ressentir cela ?",
  },
  {
    character: character2,
    type: "choice",
    choices: [
      { key: "presence", text: "C’est comme si quelque chose me regardait." },
      { key: "memory", text: "Je ne sais pas… c’est une sensation que je connais, sans comprendre pourquoi." },
    ],
  },
  {
    character: character1,
    replies: {
      presence: "Par quelqu’un ?",
      memory: "Cette impression, vous l’avez déjà ressentie avant ?",
    },
  },
  {
    character: character2,
    text: "Oui. Il y a longtemps. Après l’accident de mon frère.",
  },
  {
    character: character1,
    text: "Je vois… vous ne m’aviez jamais parlé de votre frère, Turner.",
  },
  {
    character: character2,
    text: "Non. Ce n’est pas un sujet facile.",
  },
  {
    character: character1,
    text: "Prenez votre temps. Nous ne sommes pas pressés.",
  },
  {
    character: character2,
    text: "Il est tombé du grenier. On jouait à se cacher… et il est tombé. J’ai crié, mais trop tard.",
  },
  {
    character: character1,
    text: "Vous étiez enfant. Vous ne pouviez pas prévoir.",
  },
  {
    character: character2,
    text: "J’aurais pu le retenir. C’est depuis ce jour que je me réveille à cette heure-là.",
  },
  {
    character: character1,
    text: "Trois heures vingt ?",
  },
  {
    character: character2,
    text: "Oui. C’est l’heure où il est mort, docteur.",
  },
  {
    character: character1,
    text: "C’est une heure qui est restée gravée en vous, Turner. Votre esprit essaie peut-être de vous faire revivre ce moment pour le comprendre, ou pour enfin le laisser partir.",
  },
  {
    character: character2,
    text: "Je l’ai cru longtemps. Mais… ces derniers temps, je ne me réveille plus seul.",
  },
  {
    character: character1,
    text: "Comment ça, 'plus seul' ?",
  },
  {
    character: character2,
    text: "Quand j’ouvre les yeux, il y a quelqu’un. Enfin, je crois. Une silhouette, au pied du lit. Elle ne bouge pas.",
  },
  {
    character: character1,
    text: "Vous voyez cette silhouette à chaque réveil ?",
  },
  {
    character: character2,
    text: "Pas toujours. Mais quand elle est là, je sens qu’elle me regarde. Et j’ai peur de bouger, peur de vérifier si elle existe vraiment.",
  },
  {
    character: character1,
    text: "Est-ce que vous pourriez me décrire cette silhouette ?",
  },
  {
    character: character2,
    text: "Petite. Immobile. Et il y a… une lumière faible derrière elle, comme un reflet. Parfois, j’entends même le bruit du plancher qui craque, comme à l’époque, dans le grenier.",
  },
  {
    character: character1,
    text: "Turner… ces détails, cette précision… Vous avez songé à noter ce que vous ressentez ou voyez à ces moments-là ?",
  },
  {
    character: character2,
    text: "J’ai essayé. Mais le lendemain matin, le carnet est vide. Les pages sont tournées, parfois même arrachées. Comme si on m’empêchait d’écrire.",
  },
  {
    character: character1,
    text: "Vous vivez seul, n’est-ce pas ?",
  },
  {
    character: character2,
    text: "Oui. Enfin… je croyais.",
  },
  {
    character: character1,
    text: "Vous voulez dire que vous avez trouvé des signes, des objets déplacés ?",
  },
  {
    character: character2,
    text: "Oui. Des jouets. Des billes, des petites voitures… exactement les mêmes que celles de mon frère. Dans le couloir, sur la table, au pied du lit.",
  },
  {
    character: character1,
    text: "Et vous n’en aviez gardé aucun souvenir matériel, avant cela ?",
  },
  {
    character: character2,
    text: "Non, docteur. Tout avait été jeté. Tout.",
  },
  {
    character: character1,
    text: "Turner… je vais vous poser une question délicate. Est-ce qu’il est possible que quelqu’un essaie de vous faire peur, ou de vous manipuler ?",
  },
  {
    character: character2,
    text: "C’est ce que je me disais au début. Mais cette nuit, j’ai entendu une voix. Une voix d’enfant, tout près de moi.",
  },
  {
    character: character1,
    text: "Que disait cette voix ?",
  },
  {
    character: character2,
    text: "Elle a dit : 'Pourquoi tu m’as laissé tomber ?'.",
  },
  {
    character: character1,
    text: "Turner, je veux que vous sachiez que vous êtes en sécurité ici. Ce que vous ressentez est réel pour vous, mais nous allons le comprendre ensemble, d’accord ?",
  },
  {
    character: character2,
    text: "Oui… j’aimerais y croire.",
  },
  {
    character: character1,
    text: "Nous allons reprendre calmement. Respirez. Dites-moi : quand tout cela a commencé, est-ce qu’il s’est passé quelque chose de particulier dans votre vie ?",
  },
  {
    character: character2,
    text: "Oui. J’ai hérité de la maison de mes parents. Et j’ai dormi, pour la première fois depuis des années… dans la chambre du grenier.",
  },
];
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