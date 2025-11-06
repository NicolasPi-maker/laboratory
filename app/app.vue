<template>
  <div class="bg-black h-svh flex flex-col">
    <header class="h-24 w-full bg-inherit top-0 z-50 grid grid-cols-3 gap-1">
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
      <li v-for="(text, index) in arrConv" :key="index">
        <div class="flex w-full relative message" :class="text.character.side === 'right' ? 'justify-end' : 'justify-start'">
          <p class="text-sm px-2 py-1 text-white rounded-xl max-w-2/3 z-30" 
          :class="[
            text.character.side === 'right' ? 'bg-blue-500' : 'bg-neutral-700']">
            {{ text.text }}
          </p>
          <span :class="[!arrConv[index + 1] || arrConv[index + 1].character.side !== text.character.side ? `tail-${text.character.side} z-10` : '']"></span>
        </div>
      </li>
    </ul>
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

const arrConv = ref([])
const conversationWrapper = ref(null)

const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}

let storedIndex = 0
let conversationIndex = 0

const sendMessage = async () => {
  // Slice array to have only rest of conversation when use pause
  const truncatedConversation = conversation.slice(conversationIndex)

  for(const [index, message] of truncatedConversation.entries()) {
    if(pause.value) break;

    conversationIndex = index + storedIndex + 1
    // time to wait before send current message in loop
    await sleep(message?.time ?? 2000);
    // Push message to display it
    arrConv.value.push(message);
    // scroll to bottom of conversation
    await scrollTobottomConv()
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
    time: 5000
  },
  {
    character: character2,
    text: "Bonjour docteur Telman.",
  },
  {
    character: character1,
    text: "Comment allez-vous aujourd’hui ? Vous aviez l’air plus détendu la dernière fois.",
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
    text: "Oui. Je m’endors vite, mais je me réveille en pleine nuit. Toujours vers la même heure.",
  },
  {
    character: character1,
    text: "Vers quelle heure exactement ?",
  },
  {
    character: character2,
    text: "Trois heures vingt. Presque toujours la même minute, c’est étrange.",
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
    text: "Je ne sais pas. C’est comme si quelque chose me surveillait. Comme si j’étais observé.",
  },
  {
    character: character1,
    text: "Par quelqu’un ?",
  },
  {
    character: character2,
    text: "Pas quelqu’un. C’est plus… une présence. Une impression familière, mais impossible à identifier.",
  },
  {
    character: character1,
    text: "Cette impression, vous l’avez déjà ressentie avant ces insomnies ?",
  },
  {
    character: character2,
    text: "Oui. Il y a longtemps. Quand j’étais enfant. Après l’accident de mon frère.",
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
    text: "Il est tombé du grenier. J’étais avec lui. On jouait à se cacher… et il est tombé. J’ai crié, mais trop tard.",
  },
  {
    character: character1,
    text: "Vous étiez enfant. Vous ne pouviez pas prévoir.",
  },
  {
    character: character2,
    text: "J’aurais pu le retenir. J’aurais dû le retenir. C’est depuis ce jour que je me réveille à cette heure-là.",
  },
  {
    character: character1,
    text: "Trois heures vingt ?",
  },
  {
    character: character2,
    text: "Oui. C’est l’heure où il est mort, docteur.",
  },
];

conversation.push(
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
    text: "…",
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
  }
);

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