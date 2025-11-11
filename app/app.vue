<template>
  <div class="bg-black h-svh flex flex-col">
    <header class="h-20 w-full bg-inherit top-0 z-50 grid grid-cols-3 gap-1 relative">
      <div @click="isMute = !isMute" class="col-start-1 flex flex-col gap-1 justify-center items-center text-white">
        <svg v-if="isMute" xmlns="http://www.w3.org/2000/svg" width="2em" height="2em" viewBox="0 0 32 32"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.5 21H8a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1h7l6.586-6.586C22.846 3.154 25 4.047 25 5.828V6m0 8.5v11.672c0 1.781-2.154 2.674-3.414 1.414L17 23M7 28L29 6"/></svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" width="2em" height="2em" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="1.5"><path d="M1 13.857v-3.714a2 2 0 0 1 2-2h2.9a1 1 0 0 0 .55-.165l6-3.956a1 1 0 0 1 1.55.835v14.286a1 1 0 0 1-1.55.835l-6-3.956a1 1 0 0 0-.55-.165H3a2 2 0 0 1-2-2Z"/><path stroke-linecap="round" stroke-linejoin="round" d="M17.5 7.5S19 9 19 11.5s-1.5 4-1.5 4m3-11S23 7 23 11.5s-2.5 7-2.5 7"/></g></svg>
      </div>
      <div class="col-start-2 flex flex-col gap-1 justify-center items-center">
        <img src="/img/telman.png" class="h-14 w-14 rounded-full object-cover shadow z-30" />
        <p class="text-white font-semibold border rounded-full px-2 py-1 text-sm absolute bottom-0 glass translate-y-1/2">Dr Telman</p>
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
        <p class="text-xs opacity-50 self-end text-white mr-4 my-1" v-if="index === lastRightMessageIndex">Distribué</p>
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
    <div class="dropdown" :class="[isOpenChoiceTab ? 'p-4' : 'hide']">
      <ul class="inner text-white flex flex-col gap-8 items-end">
        <li v-for="choice in conversation[conversationIndex]?.choices" class="cursor-pointer" @click="chooseMessage(conversation[conversationIndex], choice)">
            <p class="text-sm px-2 py-2  text-white rounded-xl bg-blue-500 relative">
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

const toggleChoiceTab = async () => {
  if(isOpenChoiceTab.value) {
    isOpenChoiceTab.value = false;
    await sleep(500); // animation duration to avoid height break
  } else {
    await sleep(1000); // waiting time to make reading time reaction
    togglePause()
    isOpenChoiceTab.value = true;
  }
}

const chooseMessage = async (message, choice) => {
    previousMessageKey = choice.key
    let newMessage = {
      character: message.character,
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
  // Push message to display it
  arrConv.value.push(message);
  message.character.side === "right" ? lastRightMessageIndex.value = conversationIndex : null;

  conversationIndex++

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
      await toggleChoiceTab()
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
  role: "Psy",
  name: "Ana",
  lastname: "Telman",
  side: "left",
};

const character2 = {
  role: "Patient",
  name: "Turner",
  lastname: "John",
  side: "right",
};

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
      { key: "direct", text: "J'avais besoin de vous voir, ça devenait urgent." },
      { key: "cold", text: "On peut y aller, je n’ai pas beaucoup de temps." },
    ],
  },
  {
    character: character1,
    replies: {
      polite: "Comment allez-vous aujourd’hui ? Vous aviez l’air plus détendu la dernière fois.",
      direct: "Je comprends. Dites-moi ce qui vous a poussé à venir si vite.",
      cold: "Très bien. Allons à l’essentiel, si vous le souhaitez.",
    },
  },
  {
    character: character2,
    text: "Oui, un peu… mais ça n’a pas duré. Les nuits sont redevenues compliquées.",
  },
  {
    character: character1,
    text: "Des difficultés à dormir à nouveau ?",
  },
  {
    character: character2,
    type: "choice",
    choices: [
      { key: "insomnia", text: "Je m'endors vite, mais je me réveille chaque nuit." },
      { key: "details", text: "Oui… toujours vers la même heure, sans raison apparente." },
      { key: "avoid", text: "Ce n’est pas important, ce sont juste des insomnies." },
    ],
  },
  {
    character: character1,
    replies: {
      insomnia: "Vers quelle heure exactement ?",
      details: "Cette heure fixe vous semble-t-elle avoir une signification pour vous ?",
      avoid: "Parfois, ce que l’on minimise contient quelque chose d’important. Regardons quand même l’heure des réveils.",
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
    type: "choice",
    choices: [
      { key: "neutral", text: "Je me lève, je bois un verre d’eau. J’essaie de me rendormir." },
      { key: "dark", text: "Je reste dans le noir et j’attends, sans trop savoir quoi." },
      { key: "rational", text: "Je lis ou je travaille un peu pour me fatiguer." },
    ],
  },
  {
    character: character1,
    replies: {
      neutral: "C’est une façon de reprendre un peu de contrôle. Voyons ce que vous ressentez pendant ces moments.",
      dark: "Ce temps d’attente a l’air chargé d’angoisse. Observons ce qui s’y passe en vous.",
      rational: "Vous cherchez à occuper l’esprit. Et malgré ça, la tension reste présente, n’est-ce pas ?",
    },
  },
  {
    character: character2,
    text: "Il y a ce silence à cette heure-là… il n’est pas reposant. Il est lourd, presque menaçant.",
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
      { key: "memory", text: "Je connais cette sensation, mais je n’arrive pas à la situer." },
      { key: "deny", text: "Probablement la fatigue. Je dramatise, j’imagine." },
    ],
  },
  {
    character: character1,
    replies: {
      presence: "Par quelqu’un, ou plutôt une impression diffuse ?",
      memory: "Vous l’avez déjà ressentie avant, dans un autre contexte ?",
      deny: "Vous souhaitez garder une explication rationnelle, et c’est compréhensible. Voyons si un souvenir s’y rattache.",
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
    type: "choice",
    choices: [
      { key: "guilt", text: "Parce que je me sens responsable." },
      { key: "avoid_brother", text: "Parce que je préfère éviter ce sujet." },
      { key: "cold_fact", text: "Parce qu’il est mort. C’est un fait, je n’ai rien à ajouter." },
    ],
  },
  {
    character: character1,
    replies: {
      guilt: "Ce poids de responsabilité, vous le portez depuis longtemps, je me trompe ?",
      avoid_brother: "Nous n’irons pas plus vite que vous. Nous pouvons l’aborder à votre rythme.",
      cold_fact: "C’est un fait, oui. Et les faits peuvent peser autant que les souvenirs.",
    },
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
    type: "choice",
    choices: [
      { key: "self_blame", text: "J’aurais pu le retenir. Je l’ai vu glisser." },
      { key: "detach", text: "C’est flou. J’ai des trous, comme si ma mémoire avait effacé des morceaux." },
      { key: "repress", text: "Je ne veux pas en parler davantage." },
    ],
  },
  {
    character: character1,
    replies: {
      self_blame: "Cette image revient souvent, comme un instant figé. Nous pourrons la traverser ensemble.",
      detach: "Le flou est parfois une protection. Nous respecterons ce rythme.",
      repress: "Très bien. Nous mettons ce souvenir de côté pour l’instant.",
    },
  },
  {
    character: character2,
    text: "Depuis ce jour, je me réveille à la même heure.",
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
    text: "Cette heure est devenue un repère chargé pour vous. Votre esprit tente peut-être de vous faire signe.",
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
    type: "choice",
    choices: [
      { key: "shadow", text: "Il y a une silhouette au pied du lit." },
      { key: "sound", text: "J’entends des pas derrière la porte." },
      { key: "pressure", text: "L’air devient lourd, comme si quelque chose était là avec moi." },
    ],
  },
  {
    character: character1,
    replies: {
      shadow: "Vous la voyez souvent ? Bouge-t-elle, ou reste-t-elle immobile ?",
      sound: "Ces pas semblent-ils s’approcher, s’éloigner, ou s’arrêter ?",
      pressure: "Cette sensation de présence, est-ce qu’elle s’accompagne d’images ou de souvenirs ?",
    },
  },
  {
    character: character2,
    text: "Pas toujours. Mais quand c’est là, j’ai peur de bouger. Peur de confirmer que ce n’est pas qu’une impression.",
  },
  {
    character: character1,
    text: "Décrivez-moi ce que vous percevez, sans forcer les choses.",
  },
  {
    character: character2,
    text: "Petite. Immobile. Il y a un reflet faible derrière… et parfois le plancher qui craque, comme autrefois, dans le grenier.",
  },
  {
    character: character1,
    text: "Vous avez essayé de consigner ces réveils ? Même quelques mots, au moment où ça survient.",
  },
  {
    character: character2,
    text: "J’ai essayé. Mais le matin, les pages sont vides, tournées, parfois arrachées.",
  },
  {
    character: character1,
    text: "Vous vivez seul, actuellement ?",
  },
  {
    character: character2,
    type: "choice",
    choices: [
      { key: "confirm", text: "Oui. Enfin… je croyais." },
      { key: "deflect", text: "Oui. Pourquoi cette question ?" },
      { key: "avoid", text: "Je préfère changer de sujet." },
    ],
  },
  {
    character: character1,
    replies: {
      confirm: "Vous avez remarqué des objets déplacés, des traces, peut-être ?",
      deflect: "Parce que ce sentiment de présence peut se manifester dans votre quotidien aussi.",
      avoid: "Très bien. Restons sur ce que vous souhaitez partager aujourd’hui.",
    },
  },
  {
    character: character2,
    text: "Oui. Des jouets. Des billes, des petites voitures… exactement les mêmes que celles de mon frère.",
  },
  {
    character: character1,
    text: "Et vous n’en aviez gardé aucun avant cela ?",
  },
  {
    character: character2,
    text: "Non, docteur. Tout avait été jeté.",
  },
  {
    character: character1,
    text: "Je vais poser une question délicate : serait-il possible que quelqu’un cherche à vous troubler ?",
  },
  {
    character: character2,
    text: "C’est ce que je me disais au début. Mais cette nuit, j’ai entendu une voix. Une voix d’enfant, tout près.",
  },
  {
    character: character1,
    text: "Que disait cette voix ?",
  },
  {
    character: character2,
    type: "choice",
    choices: [
      { key: "guilt", text: "« Pourquoi tu m’as laissé tomber ? »" },
      { key: "denial", text: "Je ne suis plus sûr… peut-être que j’ai rêvé." },
      { key: "anger", text: "Elle se moquait de moi. Comme si je méritais ça." },
    ],
  },
  {
    character: character1,
    replies: {
      guilt: "Vous êtes en sécurité ici. Ce que vous ressentez est réel pour vous, et nous allons le comprendre ensemble.",
      denial: "Le rêve peut porter un message. Nous pouvons l’explorer sans l’imposer comme vérité.",
      anger: "Cette colère contre vous-même est vive. Essayons d’entendre ce qu’elle raconte, sans vous juger.",
    },
  },
  {
    character: character2,
    text: "Oui… j’aimerais y croire.",
  },
  {
    character: character1,
    text: "Quand tout cela a-t-il commencé ? Y a-t-il eu un évènement particulier récemment ?",
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

.dropdown:not(.hide) .inner {
  overflow: auto;
}

.glass {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.3);
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