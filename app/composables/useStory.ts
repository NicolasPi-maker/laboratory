export const useStory = () => {
    const runtimeConfig = useRuntimeConfig()
    const baseUrl = runtimeConfig.public.storyBase

    const loadStory: Object = (filename: string, extension: string = "json") => {
        console.log(filename)
        return $fetch(`${baseUrl}/${filename}.${extension}`);
    }

    return {
        loadStory
    }
}