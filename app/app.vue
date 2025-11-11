<template>
  <div class="bg-black h-svh flex flex-col">


    <header class="h-20 w-full bg-inherit top-0 z-50 grid grid-cols-3 gap-1 relative">
      <div class="col-start-1 flex flex-col gap-1 m-4 text-white">
        <HeaderBinaryButton v-model="isMute">
          <template #true>
            <svg xmlns="http://www.w3.org/2000/svg" width="1.5em" height="1.5em" viewBox="0 0 32 32"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.5 21H8a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1h7l6.586-6.586C22.846 3.154 25 4.047 25 5.828V6m0 8.5v11.672c0 1.781-2.154 2.674-3.414 1.414L17 23M7 28L29 6"/></svg>
          </template>
          <template #false>
            <svg xmlns="http://www.w3.org/2000/svg" width="1.5em" height="1.5em" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="1.5"><path d="M1 13.857v-3.714a2 2 0 0 1 2-2h2.9a1 1 0 0 0 .55-.165l6-3.956a1 1 0 0 1 1.55.835v14.286a1 1 0 0 1-1.55.835l-6-3.956a1 1 0 0 0-.55-.165H3a2 2 0 0 1-2-2Z"/><path stroke-linecap="round" stroke-linejoin="round" d="M17.5 7.5S19 9 19 11.5s-1.5 4-1.5 4m3-11S23 7 23 11.5s-2.5 7-2.5 7"/></g></svg>
          </template>
        </HeaderBinaryButton>
      </div>
      <div class="col-start-2 flex">
        <HeaderContactPic :url="character1.pic" :name="`${character1.name} ${character1.lastname}`" />
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
          <li v-for="choice in conversation[conversationIndex]?.choices" class="cursor-pointer" @click="chooseMessage(conversation[conversationIndex], choice)">
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
onMounted(() => {
  sendMessage()
})

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
      } else {
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

// const character1 = {
//   role: "Psy",
//   pic: "/img/telman.png",
//   name: "Ana",
//   lastname: "Telman",
//   side: "left",
// };

// const character2 = {
//   role: "Patient",
//   name: "Turner",
//   lastname: "John",
//   side: "right",
// };

// const conversation = [
//   {
//     character: character1,
//     text: "Bonjour Monsieur Turner.",
//   },
//   {
//     character: character2,
//     type: "choice",
//     choices: [
//       { key: "polite", text: "Bonjour docteur Telman." },
//       { key: "direct", text: "J'avais besoin de vous voir, ça devenait urgent." },
//       { key: "cold", text: "On peut y aller, je n’ai pas beaucoup de temps." },
//     ],
//   },
//   {
//     character: character1,
//     replies: {
//       polite: "Comment allez-vous aujourd’hui ? Vous aviez l’air plus détendu la dernière fois.",
//       direct: "Je comprends. Dites-moi ce qui vous a poussé à venir si vite.",
//       cold: "Très bien. Allons à l’essentiel, si vous le souhaitez.",
//     },
//   },
//   {
//     character: character2,
//     text: "Oui, un peu… mais ça n’a pas duré. Les nuits sont redevenues compliquées.",
//   },
//   {
//     character: character1,
//     text: "Des difficultés à dormir à nouveau ?",
//   },
//   {
//     character: character2,
//     type: "choice",
//     choices: [
//       { key: "insomnia", text: "Je m'endors vite, mais je me réveille chaque nuit." },
//       { key: "details", text: "Oui… toujours vers la même heure, sans raison apparente." },
//       { key: "avoid", text: "Ce n’est pas important, ce sont juste des insomnies." },
//     ],
//   },
//   {
//     character: character1,
//     replies: {
//       insomnia: "Vers quelle heure exactement ?",
//       details: "Cette heure fixe vous semble-t-elle avoir une signification pour vous ?",
//       avoid: "Parfois, ce que l’on minimise contient quelque chose d’important. Regardons quand même l’heure des réveils.",
//     },
//   },
//   {
//     character: character2,
//     text: "Trois heures vingt. Presque toujours la même minute.",
//   },
//   {
//     character: character1,
//     text: "Et que faites-vous alors ?",
//   },
//   {
//     character: character2,
//     type: "choice",
//     choices: [
//       { key: "neutral", text: "Je me lève, je bois un verre d’eau. J’essaie de me rendormir." },
//       { key: "dark", text: "Je reste dans le noir et j’attends, sans trop savoir quoi." },
//       { key: "rational", text: "Je lis ou je travaille un peu pour me fatiguer." },
//     ],
//   },
//   {
//     character: character1,
//     replies: {
//       neutral: "C’est une façon de reprendre un peu de contrôle. Voyons ce que vous ressentez pendant ces moments.",
//       dark: "Ce temps d’attente a l’air chargé d’angoisse. Observons ce qui s’y passe en vous.",
//       rational: "Vous cherchez à occuper l’esprit. Et malgré ça, la tension reste présente, n’est-ce pas ?",
//     },
//   },
//   {
//     character: character2,
//     text: "Il y a ce silence à cette heure-là… il n’est pas reposant. Il est lourd, presque menaçant.",
//   },
//   {
//     character: character1,
//     text: "Vous dites 'menaçant'. Qu’est-ce qui vous fait ressentir cela ?",
//   },
//   {
//     character: character2,
//     type: "choice",
//     choices: [
//       { key: "presence", text: "C’est comme si quelque chose me regardait." },
//       { key: "memory", text: "Je connais cette sensation, mais je n’arrive pas à la situer." },
//       { key: "deny", text: "Probablement la fatigue. Je dramatise, j’imagine." },
//     ],
//   },
//   {
//     character: character1,
//     replies: {
//       presence: "Par quelqu’un, ou plutôt une impression diffuse ?",
//       memory: "Vous l’avez déjà ressentie avant, dans un autre contexte ?",
//       deny: "Vous souhaitez garder une explication rationnelle, et c’est compréhensible. Voyons si un souvenir s’y rattache.",
//     },
//   },
//   {
//     character: character2,
//     text: "Oui. Il y a longtemps. Après l’accident de mon frère.",
//   },
//   {
//     character: character1,
//     text: "Je vois… vous ne m’aviez jamais parlé de votre frère, Turner.",
//   },
//   {
//     character: character2,
//     type: "choice",
//     choices: [
//       { key: "guilt", text: "Parce que je me sens responsable." },
//       { key: "avoid_brother", text: "Parce que je préfère éviter ce sujet." },
//       { key: "cold_fact", text: "Parce qu’il est mort. C’est un fait, je n’ai rien à ajouter." },
//     ],
//   },
//   {
//     character: character1,
//     replies: {
//       guilt: "Ce poids de responsabilité, vous le portez depuis longtemps, je me trompe ?",
//       avoid_brother: "Nous n’irons pas plus vite que vous. Nous pouvons l’aborder à votre rythme.",
//       cold_fact: "C’est un fait, oui. Et les faits peuvent peser autant que les souvenirs.",
//     },
//   },
//   {
//     character: character2,
//     text: "Il est tombé du grenier. On jouait à se cacher… et il est tombé. J’ai crié, mais trop tard.",
//   },
//   {
//     character: character1,
//     text: "Vous étiez enfant. Vous ne pouviez pas prévoir.",
//   },
//   {
//     character: character2,
//     type: "choice",
//     choices: [
//       { key: "self_blame", text: "J’aurais pu le retenir. Je l’ai vu glisser." },
//       { key: "detach", text: "C’est flou. J’ai des trous, comme si ma mémoire avait effacé des morceaux." },
//       { key: "repress", text: "Je ne veux pas en parler davantage." },
//     ],
//   },
//   {
//     character: character1,
//     replies: {
//       self_blame: "Cette image revient souvent, comme un instant figé. Nous pourrons la traverser ensemble.",
//       detach: "Le flou est parfois une protection. Nous respecterons ce rythme.",
//       repress: "Très bien. Nous mettons ce souvenir de côté pour l’instant.",
//     },
//   },
//   {
//     character: character2,
//     text: "Depuis ce jour, je me réveille à la même heure.",
//   },
//   {
//     character: character1,
//     text: "Trois heures vingt ?",
//   },
//   {
//     character: character2,
//     text: "Oui. C’est l’heure où il est mort, docteur.",
//   },
//   {
//     character: character1,
//     text: "Cette heure est devenue un repère chargé pour vous. Votre esprit tente peut-être de vous faire signe.",
//   },
//   {
//     character: character2,
//     text: "Je l’ai cru longtemps. Mais… ces derniers temps, je ne me réveille plus seul.",
//   },
//   {
//     character: character1,
//     text: "Comment ça, 'plus seul' ?",
//   },
//   {
//     character: character2,
//     type: "choice",
//     choices: [
//       { key: "shadow", text: "Il y a une silhouette au pied du lit." },
//       { key: "sound", text: "J’entends des pas derrière la porte." },
//       { key: "pressure", text: "L’air devient lourd, comme si quelque chose était là avec moi." },
//     ],
//   },
//   {
//     character: character1,
//     replies: {
//       shadow: "Vous la voyez souvent ? Bouge-t-elle, ou reste-t-elle immobile ?",
//       sound: "Ces pas semblent-ils s’approcher, s’éloigner, ou s’arrêter ?",
//       pressure: "Cette sensation de présence, est-ce qu’elle s’accompagne d’images ou de souvenirs ?",
//     },
//   },
//   {
//     character: character2,
//     text: "Pas toujours. Mais quand c’est là, j’ai peur de bouger. Peur de confirmer que ce n’est pas qu’une impression.",
//   },
//   {
//     character: character1,
//     text: "Décrivez-moi ce que vous percevez, sans forcer les choses.",
//   },
//   {
//     character: character2,
//     text: "Petite. Immobile. Il y a un reflet faible derrière… et parfois le plancher qui craque, comme autrefois, dans le grenier.",
//   },
//   {
//     character: character1,
//     text: "Vous avez essayé de consigner ces réveils ? Même quelques mots, au moment où ça survient.",
//   },
//   {
//     character: character2,
//     text: "J’ai essayé. Mais le matin, les pages sont vides, tournées, parfois arrachées.",
//   },
//   {
//     character: character1,
//     text: "Vous vivez seul, actuellement ?",
//   },
//   {
//     character: character2,
//     type: "choice",
//     choices: [
//       { key: "confirm", text: "Oui. Enfin… je croyais." },
//       { key: "deflect", text: "Oui. Pourquoi cette question ?" },
//       { key: "avoid", text: "Je préfère changer de sujet." },
//     ],
//   },
//   {
//     character: character1,
//     replies: {
//       confirm: "Vous avez remarqué des objets déplacés, des traces, peut-être ?",
//       deflect: "Parce que ce sentiment de présence peut se manifester dans votre quotidien aussi.",
//       avoid: "Très bien. Restons sur ce que vous souhaitez partager aujourd’hui.",
//     },
//   },
//   {
//     character: character2,
//     text: "Oui. Des jouets. Des billes, des petites voitures… exactement les mêmes que celles de mon frère.",
//   },
//   {
//     character: character1,
//     text: "Et vous n’en aviez gardé aucun avant cela ?",
//   },
//   {
//     character: character2,
//     text: "Non, docteur. Tout avait été jeté.",
//   },
//   {
//     character: character1,
//     text: "Je vais poser une question délicate : serait-il possible que quelqu’un cherche à vous troubler ?",
//   },
//   {
//     character: character2,
//     text: "C’est ce que je me disais au début. Mais cette nuit, j’ai entendu une voix. Une voix d’enfant, tout près.",
//   },
//   {
//     character: character1,
//     text: "Que disait cette voix ?",
//   },
//   {
//     character: character2,
//     type: "choice",
//     choices: [
//       { key: "guilt", text: "« Pourquoi tu m’as laissé tomber ? »" },
//       { key: "denial", text: "Je ne suis plus sûr… peut-être que j’ai rêvé." },
//       { key: "anger", text: "Elle se moquait de moi. Comme si je méritais ça." },
//     ],
//   },
//   {
//     character: character1,
//     replies: {
//       guilt: "Vous êtes en sécurité ici. Ce que vous ressentez est réel pour vous, et nous allons le comprendre ensemble.",
//       denial: "Le rêve peut porter un message. Nous pouvons l’explorer sans l’imposer comme vérité.",
//       anger: "Cette colère contre vous-même est vive. Essayons d’entendre ce qu’elle raconte, sans vous juger.",
//     },
//   },
//   {
//     character: character2,
//     text: "Oui… j’aimerais y croire.",
//   },
//   {
//     character: character1,
//     text: "Quand tout cela a-t-il commencé ? Y a-t-il eu un évènement particulier récemment ?",
//   },
//   {
//     character: character2,
//     text: "Oui. J’ai hérité de la maison de mes parents. Et j’ai dormi, pour la première fois depuis des années… dans la chambre du grenier.",
//   },
// ];

const character1 = {
  role: "Officier",
  name: "Liora",
  pic: "/img/senn.png",
  lastname: "Senn",
  side: "left",
};

const character2 = {
  role: "Technicien",
  name: "Eren",
  lastname: "Kael",
  side: "right",
};

const conversation = [
  {
    character: character1,
    text: "Eren ? Vous me recevez ? Les communications viennent juste de se rétablir.",
  },
  {
    character: character2,
    type: "choice",
    choices: [
      { key: "relief", text: "Oui… enfin. J’ai cru que j’étais seul ici." },
      { key: "sarcastic", text: "Oh, génial. Une voix humaine, enfin." },
      { key: "neutral", text: "Je vous entends, commandante Senn." },
    ],
  },
  {
    character: character1,
    replies: {
      relief: "Vous n’étiez pas seul. On a perdu la liaison après l’explosion du couloir C.",
      sarcastic: "Heureuse de voir que vous avez gardé votre sens de l’humour.",
      neutral: "Bien. Restez concentré, Eren. Quelle est votre position ?",
    },
  },
  {
    character: character2,
    replies: {
      relief: "Je suis dans le module d’entretien. Plus de lumière. L’air devient lourd.",
      sarcastic: "Je suis coincé dans la salle d’entretien. Celle qu’on devait réparer avant que tout parte en fumée.",
      neutral: "Section maintenance, couloir D. Les systèmes auxiliaires sont hors ligne.",
    },
  },
  {
    character: character1,
    text: "Essayez de rester calme. Le réacteur secondaire s’est arrêté, mais l’oxygène est stable pour l’instant.",
  },
  {
    character: character2,
    type: "choice",
    choices: [
      { key: "trust", text: "Vous êtes sûre ? Parce que j’ai du mal à respirer." },
      { key: "hope", text: "Bon… au moins, il nous reste un peu de temps." },
      { key: "doubt", text: "Stable ? J’ai entendu un bruit sourd il y a deux minutes." },
    ],
  },
  {
    character: character1,
    replies: {
      trust: "Je vous le promets. Le capteur d’atmosphère n’indique rien d’anormal.",
      hope: "Oui. Assez pour remettre le cœur de propulsion en marche si on agit vite.",
      doubt: "Décrivez-moi ce bruit, Eren. Il pourrait s’agir d’une dépressurisation lente.",
    },
  },
  {
    character: character2,
    text: "C’était comme un battement… lent. Régulier. Comme si le métal respirait.",
  },
  {
    character: character1,
    text: "Le métal ne respire pas, Eren.",
  },
  {
    character: character2,
    text: "Je sais, commandante. Mais depuis que je suis coincé ici, j’ai l’impression qu’il… m’écoute.",
  },
  {
    character: character2,
    type: "choice",
    choices: [
      { key: "rational", text: "C’est sûrement mon cœur. Je commence à délirer." },
      { key: "soft", text: "Je crois que je perds pied, Liora. J’entends des choses." },
      { key: "sharp", text: "Ne me dites pas que vous n’entendez rien, vous aussi ?" },
    ],
  },
  {
    character: character1,
    replies: {
      rational: "Vous êtes en état de stress intense. Votre esprit comble les silences, c’est normal.",
      soft: "Je comprends. L’isolement et le manque d’oxygène peuvent jouer sur la perception. Respirez lentement.",
      sharp: "Ici, tout est calme, Eren. Ce que vous entendez n’est pas réel. Gardez la tête froide.",
    },
  },
  {
    character: character2,
    text: "Non, je vous jure. Ce n’est pas dans ma tête.",
  },
  {
    character: character1,
    text: "Eren, écoutez-moi. Vous n’êtes pas seul. Restez concentré sur ma voix.",
  },
  {
    character: character2,
    type: "choice",
    choices: [
      { key: "fear", text: "Commandante… il y a quelqu’un d’autre sur le canal." },
      { key: "confusion", text: "Je n’arrive pas à faire la différence entre vos mots et… les siens." },
      { key: "denial", text: "Non, non… la radio déconne, c’est tout." },
    ],
  },
  {
    character: character1,
    replies: {
      fear: "Eren ? Soyez précis. Qu’est-ce que vous entendez ?",
      confusion: "Les siens ? Qui ça, Eren ? Il n’y a personne d’autre connecté à cette fréquence.",
      denial: "La radio est intacte. Ce que vous percevez n’est pas un parasite, Eren.",
    },
  },
  {
    character: character2,
    text: "Une voix. Très basse. Elle répète mon nom, encore et encore.",
  },
  {
    character: character1,
    text: "Eren, verrouillez le canal secondaire. Maintenant.",
  },
  {
    character: character2,
    text: "Trop tard. Elle est… à l’intérieur de la ligne.",
  },
];

conversation.push(
  {
    character: character1,
    text: "Eren ? Qu’est-ce que vous entendez exactement ?",
  },
  {
    character: character2,
    text: "Des interférences. Non... ce n’est plus ça. C’est… une respiration.",
  },
  {
    character: character1,
    text: "Restez calme. Les micros internes amplifient les sons du système respiratoire, c’est peut-être le vôtre.",
  },
  {
    character: character2,
    type: "choice",
    choices: [
      { key: "trust", text: "Oui... peut-être. J’imagine des choses." },
      { key: "doubt", text: "Non, c’est plus lent. Ce n’est pas le mien." },
      { key: "fear", text: "Elle respire dans ma fréquence, Liora..." },
    ],
  },
  {
    character: character1,
    replies: {
      trust: "Bien. Respirez profondément. Vous devez reprendre le contrôle de votre rythme cardiaque.",
      doubt: "Vous êtes sûr ? Essayez de couper votre micro pour vérifier si le son continue.",
      fear: "Eren, écoutez-moi. Ce que vous entendez n’est pas réel. Vous devez couper la transmission.",
    },
  },
  {
    character: character2,
    text: "Je coupe…",
  },
  {
    character: character2,
    text: "…",
  },
  {
    character: character2,
    text: "Liora ?",
  },
  {
    character: character1,
    text: "Je vous entends. Qu’est-ce qu’il se passe ?",
  },
  {
    character: character2,
    text: "La respiration a continué.",
  },
  {
    character: character1,
    text: "Eren, vous devez quitter ce module immédiatement.",
  },
  {
    character: character2,
    type: "choice",
    choices: [
      { key: "panic", text: "Je… je ne peux pas. La porte est verrouillée de l’extérieur." },
      { key: "resign", text: "Il n’y a plus rien à faire, Liora." },
      { key: "rational", text: "Je vais tenter le panneau de dérivation. Donnez-moi le code d’urgence." },
    ],
  },
  {
    character: character1,
    replies: {
      panic: "Écoutez-moi, vous n’êtes pas piégé. Le verrou peut être contourné depuis le tableau secondaire à votre gauche.",
      resign: "Ne dites pas ça, Eren. Vous êtes vivant. Tant que vous m’entendez, vous êtes vivant.",
      rational: "Code d’urgence 6-1-3. Soyez prudent, une surcharge pourrait tout griller.",
    },
  },
  {
    character: character2,
    text: "Je vois le panneau. Il clignote… rouge.",
  },
  {
    character: character1,
    text: "C’est normal. Le système principal essaie de rediriger l’énergie.",
  },
  {
    character: character2,
    text: "Non. Ce n’est pas normal. Le panneau m’a parlé.",
  },
  {
    character: character1,
    text: "Pardon ?",
  },
  {
    character: character2,
    type: "choice",
    choices: [
      { key: "shock", text: "Il a dit mon nom. Avec la même voix que vous." },
      { key: "confused", text: "J’ai entendu ma propre voix venir du haut-parleur." },
      { key: "deny", text: "Non, laissez tomber. J’ai dû halluciner." },
    ],
  },
  {
    character: character1,
    replies: {
      shock: "Eren… restez lucide. Ce n’est pas moi. Vous devez couper l’alimentation immédiatement.",
      confused: "C’est probablement un écho enregistré. Le système rejoue des fragments audio corrompus.",
      deny: "D’accord. On met ça sur le compte de la fatigue. Concentrez-vous sur le tableau.",
    },
  },
  {
    character: character2,
    text: "Le son continue, Liora. Même quand je ferme les yeux.",
  },
  {
    character: character1,
    text: "Fermez les yeux, oui. Décrivez-moi ce que vous ressentez.",
  },
  {
    character: character2,
    type: "choice",
    choices: [
      { key: "calm", text: "Il fait chaud. Presque apaisant." },
      { key: "cold", text: "Il fait froid. Comme si le vide se glissait dans ma combinaison." },
      { key: "pain", text: "Ça brûle. À l’intérieur de ma tête." },
    ],
  },
  {
    character: character1,
    replies: {
      calm: "Très bien. Restez là-dessus. Ce calme, gardez-le le plus longtemps possible.",
      cold: "Eren, concentrez-vous sur votre respiration. Inspirez profondément. Vous devez vous réchauffer de l’intérieur.",
      pain: "Ouvrez les yeux, maintenant. Vous m’entendez ? Ouvrez-les !",
    },
  },
  {
    character: character2,
    text: "… Liora ?",
  },
  {
    character: character1,
    text: "Je suis là.",
  },
  {
    character: character2,
    text: "Je crois… qu’il y a quelqu’un derrière moi.",
  },
);

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