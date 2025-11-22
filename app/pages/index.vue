<template>
    <div class="bg-black h-svh flex flex-col p-2">
        <nav class="flex bg-black p-4 items-center">
            <NuxtLink class="flex-1">
                <p class="rounded-full w-max p-2 px-4 text-white font-semibold border border-white/50 bg-neutral-800">Modifier</p>
            </NuxtLink>
            <NuxtLink class="border border-white/50 bg-neutral-800 w-10 h-10 rounded-full flex justify-center items-center opacity-80">
                <Icon name="ph:user-light" style="color: white" size="2em"/>
            </NuxtLink>
        </nav>
        <div class="flex-1 px-4">
            <h1 class="text-3xl text-white font-bold m-auto">Messages</h1>
            <ul class="flex flex-col justify-center">
                <li v-for="(story, index) in storyList">
                    <NuxtLink :to="{name: 'story-name', params: {name: story.name}}" class="flex gap-4 items-center">
                        <!-- <div class="w-3 h-3 rounded-full bg-blue-300" :class="index % 2 === 0 ? 'opacity-0' : ''"></div> -->
                         <div class="h-12 w-12 rounded-full shadow z-30 overflow-hidden">
                             <img v-if="story.pic" :src="story.pic" class="w-full object-cover" />
                             <div class="bg-neutral-500 h-full w-full text-xl text-white flex justify-center items-center" v-else><h4>{{ story.fullname }}</h4></div>
                         </div>
                        <div class="flex flex-col flex-1 py-4 border-b border-white/20">
                            <div class="flex text-white items-center">
                                <h2 class="flex-1 font-semibold">{{ story.fullname }}</h2>
                                <span class="text-white opacity-50 flex items-center">
                                    <p class="text-[12px]">Hier</p>
                                    <Icon name="si:chevron-right-line" style="color: white" size="1.5em" />
                                </span>
                            </div>
                            <p class="text-[12px] text-white/50 line-clamp-2">{{ story.message }}</p>
                        </div>
                    </NuxtLink>
                </li>
            </ul>
        </div>
    </div>
</template>

<script setup>
const storyList = [
    {
        fullname: "MN",
        pic: null,
        message: "Bonsoir. Vous êtes réveillé ?",
        name: "murder",
        path: "murder/session_01"
    },
    {
        fullname: "Liora Senn",
        pic: "/img/senn.png",
        message: "Eren ? Vous me recevez ? Les communications viennent juste de se rétablir.",
        name: "eren",
        path: "eren/eren"
    },
    {
        fullname: "Ana Telman",
        pic: "/img/telman.png",
        message: "Bonjour Monsieur Turner.",
        name: "turner",
        path: "turner/turner"
    }
];

</script>

<style scoped>

</style>