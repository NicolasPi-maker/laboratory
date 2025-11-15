export const useStory = () => {
    const runtimeConfig = useRuntimeConfig()
    const baseUrl = runtimeConfig.public.storyBase

    const loadStory: Object = (filename: string, extension: string = "json") => {
        return $fetch(`${baseUrl}/${filename}/${filename}.${extension}`);
    }

    return {
        loadStory
    }
}