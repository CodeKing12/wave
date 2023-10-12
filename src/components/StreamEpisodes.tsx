import { FocusContext, FocusDetails, useFocusable } from "@noriginmedia/norigin-spatial-navigation";
import { StreamObj } from "./MediaTypes";
import MediaStreamOption from "./Stream";

interface StreamEpisodesProps { 
    authToken: string,
    episodeStreams: StreamObj[], 
    customFocusKey: string,
    onEpisodeStreamFocus: (focusDetails: FocusDetails) => void,
    onEpisodeStreamClick: (stream: StreamObj, isEnterpress?: boolean) => void, 
}

export default function StreamEpisodes({ authToken, episodeStreams, customFocusKey, onEpisodeStreamFocus, onEpisodeStreamClick }: StreamEpisodesProps) {
  const { ref, focusKey, focused, hasFocusedChild } = useFocusable({
    focusKey: customFocusKey
  })

    return (
        <FocusContext.Provider value={focusKey}>
            <div className={`flex flex-col gap-5 opacity-0 invisible -translate-y-10 duration-500 ease-in-out ${episodeStreams?.length ? "mt-5 !opacity-100 !visible !translate-y-0" : ""}`} ref={ref}>
                {
                    episodeStreams?.length ? 
                    episodeStreams.map((stream, index) => <MediaStreamOption key={index} stream={stream} authToken={authToken} isEpisode={true} onStreamClick={(isEnterpress) => onEpisodeStreamClick(stream, isEnterpress)} onFocus={onEpisodeStreamFocus} />)
                    : ""
                }
            </div>
        </FocusContext.Provider>
    )
}