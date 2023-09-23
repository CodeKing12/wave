import { FocusContext, FocusDetails, useFocusable } from "@noriginmedia/norigin-spatial-navigation"
import Episode from "./Episode"
import { SeasonStreamObj, SeriesData, SeriesStreamObj } from "./MediaModal"
import { SeriesObj, StreamObj } from "./MediaTypes"

interface EpisodeListProps {
    episodes: SeriesData,
    selectedSeason?: SeriesObj,
    isLoadingEpisodeStreams: string,
    isFocusable: boolean,
    episodeStreams: SeasonStreamObj,
    onEpisodeStreamClick: (stream: StreamObj) => void,
    onEpisodeClick: (episode: SeriesObj) => void,
    onEpisodeFocus: (focusDetails: FocusDetails) => void,
    onEpisodeStreamFocus?: (focusDetails: FocusDetails) => void
}

export default function EpisodeList({ episodes, selectedSeason, onEpisodeFocus, onEpisodeStreamFocus, isLoadingEpisodeStreams, isFocusable, episodeStreams, onEpisodeClick, onEpisodeStreamClick }: EpisodeListProps) {
    const { ref, focusKey, focused } = useFocusable({
        focusable: isFocusable
    })

    return (
        <FocusContext.Provider value={focusKey}>
            <div className="flex flex-col gap-4 flex-wrap max-w-full" ref={ref}>
                {
                    episodes[selectedSeason?._id || ""]?.map((episode, index) => <Episode key={index} episode={episode} onClick={() => onEpisodeClick(episode)} episodeStreams={episodeStreams?.[episode?._id] || undefined} onEpisodeStreamClick={onEpisodeStreamClick} isLoadingStreams={isLoadingEpisodeStreams === episode?._id} onFocus={onEpisodeFocus} onEpisodeStreamFocus={onEpisodeStreamFocus} />)
                }
            </div>
        </FocusContext.Provider>
    )
}