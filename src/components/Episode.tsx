import { useState, useEffect, useCallback } from "react";
import { getDisplayDetails, getRatingAggr } from "./MediaCard";
import { convertSecondsToTime } from "@/utils/general";
import { PlayCircle, VideoSlash } from "iconsax-react";
import MediaStreamOption from "./Stream";
import { HashLoader } from "react-spinners";
import { SeriesObj, StreamObj } from "./MediaTypes";
import { FocusDetails, setFocus, useFocusable } from "@noriginmedia/norigin-spatial-navigation";
import StreamEpisodes from "./StreamEpisodes";

export interface EpisodeProps {
    authToken: string;
    episode: SeriesObj;
    episodeStreams: StreamObj[];
    isLoadingStreams: boolean;
    onFocus: ({ y }: { y: number }) => void;
    onClick: () => void;
    onEpisodeStreamFocus?: (focusDetails: FocusDetails) => void;
    onEpisodeStreamClick: (stream: StreamObj, isEnterpress?: boolean) => void;
}

export default function Episode({ authToken, episode, onClick, episodeStreams, isLoadingStreams, onFocus, onEpisodeStreamFocus, onEpisodeStreamClick }: EpisodeProps) {
    const episodeDetails = getDisplayDetails(episode._source.i18n_info_labels);
    const hasNoStreams = Array.isArray(episodeStreams) && !episodeStreams?.length;
    const [showStreams, setShowStreams] = useState(false);
    let { rating, voteCount } = getRatingAggr(episode._source.ratings);

    const onFocusStream = useCallback(
        () => {
            setFocus(episode._id)
        }, [episode._id]
    )

    function modifyStreamOffset(focusDetails: FocusDetails) {
        focusDetails.y += parseFloat(ref.current.offsetTop)
        onEpisodeStreamFocus?.(focusDetails)
    }

    const { ref, focused } = useFocusable({
        onEnterPress: onClick,
        onFocus: episodeStreams?.length ? onFocusStream : onFocus
    });

    useEffect(() => {
        // console.log(Boolean(episodeStreams?.length))
        episodeStreams?.length ? setFocus(episode._id) : ""
    }, [episodeStreams, episode._id])

    // useEffect(() => {
    //     console.log(showStreams)
    // }, [showStreams])

    return (
        <div className={`max-w-full relative px-6 py-4 border-2 border-transparent hover:border-yellow-300 hover:border-opacity-100 rounded-xl transition-all duration-[400ms] ease-in-out ${episodeStreams?.length ? "border-yellow-300 border-opacity-60" : ""} ${focused ? "!border-yellow-300 !border-opacity-100" : ""}`} ref={ref}>
            <article className="flex items-center space-x-6 duration-[400ms] ease-in-out w-full">
                <img src={episodeDetails?.art?.poster} alt="" width="60" height="50" className="flex-none rounded-md bg-slate-100 w-16 h-20 object-cover" />
                <div className="min-w-0 relative flex-auto">
                    <h2 className="font-semibold text-white text-opacity-80 truncate mr-28">{ episodeDetails.title || `Season ${episode._source.info_labels.season}: Episode ${episode._source.info_labels.episode}` }</h2>
                    <dl className="mt-2.5 flex flex-wrap text-sm leading-6 font-medium text-gray-300 text-opacity-90">
                        <div className="absolute top-0 right-0 flex items-center space-x-1">
                            <dt className="fill-yellow-300">
                                <span className="sr-only">Star rating</span>
                                <svg className="" width="16" height="20">
                                    <path d="M7.05 3.691c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.372 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.539 1.118l-2.8-2.034a1 1 0 00-1.176 0l-2.8 2.034c-.783.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.363-1.118L.98 9.483c-.784-.57-.381-1.81.587-1.81H5.03a1 1 0 00.95-.69L7.05 3.69z" />
                                </svg>
                            </dt>
                            <dd>{rating.toFixed(1)}</dd>
                        </div>
                        <div>
                            <dt className="sr-only">Episode Number</dt>
                            <dd className="px-1.5 ring-1 ring-slate-200 rounded">S{episode._source.info_labels.season || 1} E{episode._source.info_labels.episode?.toString().padStart(2, "0")}</dd>
                        </div>
                        <div className="ml-2">
                            <dt className="sr-only">Aired</dt>
                            <dd>{episode._source.info_labels.aired}</dd>
                        </div>
                        {/* <div>
                            <dt className="sr-only">Episode</dt>
                            <dd className="flex items-center">
                                <svg width="2" height="2" fill="currentColor" className="mx-2 text-slate-300" aria-hidden="true">
                                    <circle cx="1" cy="1" r="1" />
                                </svg>
                                Episode { season._source.info_labels.episode }
                            </dd>
                        </div> */}
                        <div>
                            <dt className="sr-only">Runtime</dt>
                            <dd className="flex items-center">
                                <svg width="2" height="2" fill="currentColor" className="mx-2 text-slate-300" aria-hidden="true">
                                    <circle cx="1" cy="1" r="1" />
                                </svg>
                                { convertSecondsToTime(episode._source.info_labels.duration) }
                            </dd>
                        </div>
                        {
                            hasNoStreams ? (
                                <div className="ml-auto">
                                    <VideoSlash variant="Bold" className="text-yellow-300" />
                                </div>
                            ) : ""
                        }
                        {/* <div className="flex-none w-full mt-2 font-normal">
                            <dt className="sr-only">Cast</dt>
                            <dd className="text-gray-300">{ season._source.cast.map(actor => actor.name).join(", ") }</dd>
                        </div> */}
                    </dl>
                </div>
                <button className={`h-16 min-w-[48px] w-12 border-black-1 bg-yellow-300 text-black-1 rounded-md text-base tracking-wide font-bold border-2 border-transparent hover:bg-black-1 hover:border-yellow-300 hover:text-yellow-300 flex justify-center items-center !ml-10 ${hasNoStreams ? "opacity-40 pointer-events-none" : ""} ${focused && !hasNoStreams ? "!bg-black-1 !border-yellow-300 !text-yellow-300" : ""}`} onClick={onClick}>
                    <PlayCircle size={28} variant="Bold" />
                </button>
            </article>

            <StreamEpisodes authToken={authToken} episodeStreams={episodeStreams} onEpisodeStreamClick={onEpisodeStreamClick} customFocusKey={episode._id} onEpisodeStreamFocus={modifyStreamOffset} />

            <div className={`h-0 duration-300 ease-linear ${hasNoStreams ? "h-6 remove-element" : ""}`}>
                {
                    hasNoStreams ? 
                        <p className={`text-center text-gray-300 font-medium ${hasNoStreams ? "" : ""}`}>No streams available</p>
                        : ""
                }
            </div>
            {/* If you want a smoother height increase animation, you can comment out the loader below (and its wrapper div) */}
            <div className={`absolute top-0 left-0 right-0 w-full h-full backdrop-blur-sm rounded-2xl flex items-center justify-center opacity-0 invisible duration-300 ease-in-out ${isLoadingStreams ? "!opacity-100 !visible" : ""}`}>
                <HashLoader size={50} speedMultiplier={1.2} color="#fde047" loading={isLoadingStreams} />
            </div>
        </div>
    )
}