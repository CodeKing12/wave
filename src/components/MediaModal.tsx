import { getDisplayDetails, getRatingAggr } from "./MediaCard";
import { MediaObj, SeriesObj, StreamObj } from "./MediaTypes";
import { Back, HeartAdd, Image as ImageIcon, Backward } from "iconsax-react";
import { memo, useState, useEffect, useRef, useCallback } from "react";
import {MEDIA_ENDPOINT, TOKEN_PARAM_NAME, TOKEN_PARAM_VALUE, proxyUrl } from "./constants";
import Skeleton from "react-loading-skeleton";
import { HashLoader } from "react-spinners";
import { getMediaStreams, getStreamUrl, handleEscape, resolveArtItem, setWidths } from "@/utils/general";
import 'vidstack/styles/defaults.css';
import 'vidstack/styles/community-skin/video.css';
import { FocusContext, FocusDetails, getCurrentFocusKey, setFocus, useFocusable } from "@noriginmedia/norigin-spatial-navigation";
import FocusLeaf from "./FocusLeaf";
import MediaDetails from "./MediaDetails";
import MediaStreamOption from "./Stream";
import Episode from "./Episode";
import Season from "./Season";
import axiosInstance from "@/utils/axiosInstance";
import EpisodeList from "./EpisodeList";
import Image from "next/image";
import PlayMedia from "./PlayMedia";
import { useRouter } from "next/router";

interface MediaModalProps {
    show: boolean;
    media: MediaObj,
    authToken: string,
    placeholderImg: string,
    onAuth: () => void;
    onExit: () => void;
}

export interface SeriesData {
    [mediaId: string]: SeriesObj[];
}

export type SeasonStreamObj = {
    [episodeId: string]: StreamObj[]
}

export interface SeriesStreamObj {
    [seasonId: string]: SeasonStreamObj
}


const MediaModal = memo(function MediaModal({ show, media, placeholderImg, authToken, onAuth, onExit }: MediaModalProps) {
    // console.log("MediaModal is re-rendering")
    // const router = useRouter();
    const displayDetails = getDisplayDetails(media._source.i18n_info_labels)
    const poster = resolveArtItem(media._source.i18n_info_labels, "poster");
    const fanart = resolveArtItem(media._source.i18n_info_labels, "fanart");
    const movieDetails = media._source;
    const [showEpisodes, setShowEpisodes] = useState(false);
    const [streams, setStreams] = useState([]);
    const [episodeStreams, setEpisodeStreams] = useState<SeriesStreamObj>({});
    const [seasons, setSeasons] = useState<SeriesData>({});
    const [selectedSeason, setSelectedSeason] = useState<SeriesObj>();
    const [selectedEpisode, setSelectedEpisode] = useState();
    const [episodes, setEpisodes] = useState<SeriesData>({});
    const [selectedStream, setSelectedStream] = useState<StreamObj | undefined>();
    const [mediaUrl, setMediaUrl] = useState<string | undefined>("");
    const [isLoadingEpisodeStreams, setIsLoadingEpisodeStreams] = useState("");
    let { rating, voteCount } = getRatingAggr(movieDetails.ratings);
    const streamClasses = [".size", ".audio", ".subtitles", ".resolution", ".codec", ".duration"]
    const [isLoadingUrl, setIsLoadingUrl] = useState(false);
    const movieTitle = displayDetails?.title || movieDetails.info_labels?.originaltitle;
    const storeKeyRef = useRef("");
    const subMediaRef = useRef<HTMLDivElement>(null);
    const tvMediaRef = useRef<HTMLDivElement>(null);
    const episodeListRef = useRef<HTMLDivElement>(null);
    const [lastFocus, setLastFocus] = useState<string | undefined>("FAVE-BTN")
    const [showPlayer, setShowPlayer] = useState(false);
    const prevShowPlayer = useRef(false);
    
    const {
        ref,
        focusSelf,
        hasFocusedChild,
        focusKey,
    } = useFocusable({
        autoRestoreFocus: true,
        isFocusBoundary: true,
        focusable: show,
        // focusBoundaryDirections: ["left", "right"]
    });
   
    useEffect(() => {
        // console.log(show)
        if (show) {
            focusSelf();
        }
    }, [focusSelf, show]);
    
    useEffect(() => {
        storeKeyRef.current = media._id + "__" + selectedSeason?._id;
        // console.log(media);
        // console.log(displayDetails);
    }, [media, selectedSeason])

    const onPlayerExit = useCallback(() => {
        setShowPlayer(false);
        setMediaUrl(undefined);
        if (lastFocus) {
            setFocus(lastFocus)
        }
        console.log("Focused MediaModal")
    }, [lastFocus])

    // const onPlayerExit = () => {
    //     setShowPlayer(false);
    //     setMediaUrl(undefined);
    //     if (lastFocus) {
    //         setFocus(lastFocus)
    //     }
    //     console.log("Focused MediaModal")
    // }

    function transformMediaUrl(originalUrl: string) {
        const modifiedUrl = originalUrl.replace(/https:\/\/\d+\.dl\.wsfiles\.cz/, proxyUrl);
        return modifiedUrl;
    }

    async function getEpisodes(season: SeriesObj) {
        try {
            const response = await axiosInstance.get(MEDIA_ENDPOINT + `/api/media/filter/v2/parent?sort=episode`, {
                params: {
                    value: season._id,
                    [TOKEN_PARAM_NAME]: TOKEN_PARAM_VALUE,
                }
            })
            // console.log(response.data.hits.hits);
            return response.data.hits.hits;
        } catch(error) {
            console.log(error);
            return null;
        }
    }

    useEffect(() => {
        async function fetchModalData () {
            let modalContent = document.querySelector(".modal-content")
            if (modalContent) {
                modalContent.scrollTop = 0
            }
            // Fetch TVShow information
            if (movieDetails.info_labels.mediatype === "tvshow") {
                axiosInstance.get(MEDIA_ENDPOINT + `/api/media/filter/v2/parent?sort=episode`, {
                    params: {
                        value: media._id,
                        [TOKEN_PARAM_NAME]: TOKEN_PARAM_VALUE,
                    }
                })
                .then(function (response) {
                    // console.log(response.data.hits.hits);
                    setSeasons((prevSeasons) => {
                        return {
                            ...prevSeasons,
                            [media._id]: response.data.hits.hits
                        }
                    });
                })
            // Fetch available streams for the media
            } else {
                if (!media._streams) {
                    const mediaStreams = await getMediaStreams(media);
                    setStreams(mediaStreams);
                }
            }
        }
        fetchModalData();

        function handleModalEscape(event: KeyboardEvent) {
            if ((event.code === "Escape" || event.keyCode === 27) && prevShowPlayer.current === showPlayer) {
                exitModal();
            }

            prevShowPlayer.current = showPlayer
        }

        document.addEventListener("keydown", handleModalEscape)

        return () => {
            document.removeEventListener("keydown", handleModalEscape)
        }
    }, [media._id, mediaUrl, showPlayer]) /* eslint-disable-line react-hooks/exhaustive-deps */

    useEffect(() => {
        streamClasses.forEach((streamClass) => setWidths(streamClass))
    }, [media._id, streams]) /* eslint-disable-line react-hooks/exhaustive-deps */

    async function handleStreamPlay(stream: StreamObj, isEnterpress?: boolean) {
        if (authToken.length) {
            setIsLoadingUrl(true);
            setSelectedStream(stream);
            const mediaLink = await getStreamUrl(authToken, stream);
            if (mediaLink) {
                // console.log(mediaLink)
                if (isEnterpress) {
                    setLastFocus(getCurrentFocusKey())
                } else {
                    setLastFocus(undefined)
                }
                // router.push({
                //     pathname: '/play.html',
                //     query: { mediaLink },
                // });
                setMediaUrl(mediaLink);
                setShowPlayer(true);
                prevShowPlayer.current = true
            };
            setIsLoadingUrl(false);
        } else {
            onAuth();
        }
    }

    async function onSeasonClick(season: SeriesObj) {
        setShowEpisodes(true);
        setSelectedSeason(season);
        let seasonEpisodes = episodes[season._id];
        if (!seasonEpisodes) {
            seasonEpisodes = await getEpisodes(season);
            // console.log(seasonEpisodes)
        }
        setEpisodes((prevEpisodes) => { 
            return { ...prevEpisodes, [season._id]: seasonEpisodes }
        });
    }

    async function getEpisodeStreams(episode: SeriesObj) {
        let epiStreams = episodeStreams[storeKeyRef.current]?.[episode?._id]
        // console.log(epiStreams)
        if (!epiStreams) {
            setIsLoadingEpisodeStreams(episode._id);
            epiStreams = await getMediaStreams(episode);
        }
        // const streamObjKey = selectedSeason?._id + "__" + episode._id
        if (selectedSeason) {
            setEpisodeStreams((prevStreams) => {
                return {
                    ...prevStreams,
                    [storeKeyRef.current]: {
                        ...prevStreams[storeKeyRef.current],
                        [episode._id]: epiStreams
                    }
                }
            });
        }
        setIsLoadingEpisodeStreams("");
        // console.log(episodeStreams)
    }

    function exitModal() {
        onExit();
        // setTimeout(() => {
        setSelectedSeason(undefined);
        setSelectedEpisode(undefined);
        setShowEpisodes(false);
        setShowPlayer(false);
        setMediaUrl(undefined);
        // }, 600)
    }

    const onDetailFocus = useCallback(
        ({ y }: { y: number }) => {
        //   console.log("Detail Scroll")
            if (ref.current) {
                // console.log(y)
                ref.current.scrollTo({
                    top: y,
                    behavior: 'smooth'
                });
            }
        }, [ref]
    );

    const onEpisodeFocus = useCallback(
        (focusDetails: FocusDetails, isNotTvMedia?: boolean, isEpisodeList?: boolean) => {
        //   console.log("SubMedia Scroll")
            if (ref.current) {
                let offsetTop = 0;
                // console.log(focusDetails)
                const parentStyles = window.getComputedStyle(focusDetails.node.offsetParent)
                const parentPaddingTop = parentStyles.getPropertyValue("padding-top")
                offsetTop = focusDetails.node.offsetTop - parseFloat(parentPaddingTop) - 30;
                if (tvMediaRef && !isNotTvMedia) {
                    offsetTop = tvMediaRef.current?.offsetTop + focusDetails.y - 30
                }
                // if (episodeListRef && isEpisodeList) {
                //     offsetTop = focusDetails.node.offsetParent.off
                // }
                ref.current.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        }, [ref]
    );

    // rating = ; // To get the rating as a fraction of 10. (Multiplying by 2 undoes the dividing by 2 in the getRatingAggr function)

    return (
        <FocusContext.Provider value={focusKey}>
            <div className={`media-modal fixed top-0 bottom-0 left-0 right-0 w-screen h-screen py-16 px-5 xs:px-7 xsm:px-10 md:px-16 lg:px-20 p-10 bg-black-1 ease-in-out duration-500 opacity-0 invisible -translate-y-20 z-0 xl:overflow-hidden ${showPlayer ? "" : "overflow-y-scroll"} ${show ? "!translate-y-0 !opacity-100 !visible !z-[200]" : ""}`}>
                <FocusLeaf className="absolute top-0 right-0" focusedStyles="exit-focus" onEnterPress={exitModal}>
                    <button className="bg-yellow-300 text-black-1 w-14 h-14 flex items-center justify-center hover:bg-black-1 hover:text-yellow-300 border-[3px] border-yellow-300" onClick={exitModal}>
                        <Back size={30} variant="Bold" />
                    </button>
                </FocusLeaf>
                <div className="flex flex-col xl:flex-row justify-center gap-14 xl:gap-20 xl:h-full relative">
                    <div className="poster w-full max-w-[350px] mx-auto h-[500px] xl:h-full xl:min-w-[450px] xl:w-[450px] relative bg-[#191919] rounded-[30px] bg-opacity-75">
                    {/* xl:w-[500px] */}
                        {
                            poster ?
                            <Image width={600} height={600} key={media._id} src={poster} className="w-full h-full object-cover rounded-[30px]" alt={movieTitle} /> || <Skeleton width={500} height="100%" /> /* eslint-disable-line @next/next/no-img-element */
                            : <ImageIcon size={170} className="text-yellow-300 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 fill-transparent group-hover:-fill-yellow-300 transition-all ease-linear duration-500" variant="Broken" />
                        }
                    </div>

                    <div className="modal-content w-full xl:min-w-[550px] py-10 text-gray-300 xl:overflow-y-scroll hide-scrollbar relative duration-300 ease-in-out" ref={ref}> {/* max-w-[620px] */}                        
                        <MediaDetails movieTitle={movieTitle} displayDetails={displayDetails} movieDetails={movieDetails} rating={rating} voteCount={voteCount} onFocus={onDetailFocus} />

                        {
                            authToken.length ? "" : 
                            <p className="text-red-500 font-medium text-lg my-5">Login to watch</p>
                        }

                        {
                            movieDetails.info_labels.mediatype === "tvshow" ? "" : (
                                <div className={`media-streams mt-12 mb-6 opacity-100 duration-300 ease-in-out ${streams?.length ? "" : "w-[600px]"} ${authToken.length ? "" : "opacity-40 pointer-events-none"}`}>
                                    <p className="text-base opacity-60 text-center mb-5">Available Streams</p>
                                    <div className="flex flex-col gap-20 md:gap-16 lg:gap-12 xl:gap-10">
                                        {
                                            streams?.length ? streams.map((stream, index) => <MediaStreamOption key={index} stream={stream} onFocus={(focusDetails: FocusDetails) => onEpisodeFocus(focusDetails, true)} onStreamClick={(isEnterpress?: boolean) => handleStreamPlay(stream, isEnterpress)} authToken={authToken} />)
                                            : <HashLoader size={70} speedMultiplier={1.2} color="#fde047" loading={true} className="mt-5 relative left-1/2 -translate-x-1/2 -translate-y-1/2" />
                                        }
                                    </div>
                                </div>
                            ) 
                        }

                        <div className="flex flex-col xsm:flex-row justify-center items-center xsm:justify-start xsm:items-start xl:gap-12 mt-16 xl:mt-10">
                            <FocusLeaf focusedStyles="[&>button]:!bg-opacity-5 [&>button]:!border-white [&>button]:!text-white" customFocusKey="FAVE-BTN" onFocus={(focusDetails: FocusDetails) => onEpisodeFocus(focusDetails, true)}>
                                <button className="px-10 py-3 bg-white text-black-1 rounded-xl text-[15px] tracking-wide font-bold border-4 border-transparent hover:bg-opacity-5 hover:border-white hover:text-white flex items-center gap-4">
                                    <HeartAdd size={32} variant="Bold" />
                                    Add to Favorites
                                </button>
                            </FocusLeaf>

                            <FocusLeaf isFocusable={Boolean(showEpisodes && selectedSeason)} focusedStyles="[&>button]:!bg-black-1 [&>button]:!border-yellow-300 [&>button]:!text-yellow-300" onFocus={(focusDetails: FocusDetails) => onEpisodeFocus(focusDetails, true)} onEnterPress={() => {setShowEpisodes(false);setFocus(selectedSeason?._id || "");setSelectedSeason(undefined);}}>
                                <button className={`bg-yellow-300 text-black-1 w-14 h-14 rounded-xl flex items-center justify-center opacity-0 invisible border-4 border-transparent hover:bg-black-1 hover:border-yellow-300 hover:text-yellow-300 ${showEpisodes && selectedSeason ? "!opacity-100 !visible" : ""}`} onClick={() => {setShowEpisodes(false);setSelectedSeason(undefined);}}>
                                    <Backward size={28} variant="Bulk" />
                                </button>
                            </FocusLeaf>

                            {/* <button className="px-10 py-3 bg-yellow-300 text-black-1 rounded-xl text-base tracking-wide font-bold border-2 border-transparent hover:bg-black-1 hover:border-yellow-300 hover:text-yellow-300 flex items-center gap-4">
                                <PlayCircle size={32} variant="Bold" />
                                Watch
                            </button> */}
                        </div>

                        {
                            movieDetails.info_labels.mediatype === "tvshow" ? (
                                <div className={`mt-12 mb-6- ${seasons[media._id]?.length ? "" : "w-[600px]"}`}>
                                    <p className="text-base opacity-60 text-center mb-5">Available {showEpisodes ? "Episodes" : "Seasons"}</p>
                                    <div className="relative w-full min-h-[250px]" ref={tvMediaRef}>
                                        <div className={`max-w-full w-full absolute top-0 flex flex-wrap gap-8 duration-300 ease-in-out ${selectedSeason && seasons[media?._id]?.length ? "opacity-0 invisible -translate-y-16" : ""}`}>
                                            {
                                                seasons[media._id]?.length ? seasons[media._id].map((seriesMedia, index) =>
                                                    seriesMedia._source.info_labels.mediatype === "season" ?
                                                    <Season key={index} season={seriesMedia} onClick={() => {onSeasonClick(seriesMedia);setFocus("FAVE-BTN");}} isVisible={Boolean(!selectedSeason && seasons[media?._id]?.length)} onFocus={onEpisodeFocus} />
                                                    : <Episode authToken={authToken} key={index} episode={seriesMedia} onClick={() => getEpisodeStreams(seriesMedia)} episodeStreams={episodeStreams[storeKeyRef.current]?.[seriesMedia._id]} onEpisodeStreamClick={(stream, isEnterpress) => handleStreamPlay(stream, isEnterpress)} isLoadingStreams={isLoadingEpisodeStreams === seriesMedia._id} onFocus={onEpisodeFocus} />
                                                )
                                                : <HashLoader size={70} speedMultiplier={1.2} color="#fde047" loading={true} className="mt-5 relative left-1/2 -translate-x-1/2 -translate-y-1/2" />
                                            }
                                        </div>
                                        <div className={`max-w-full absolute top-0 flex flex-col gap-10 opacity-0 invisible translate-y-16 duration-500 ease-in-out ${showEpisodes && selectedSeason && episodes[selectedSeason?._id]?.length ? "!opacity-100 !visible !translate-y-0" : ""}`} ref={episodeListRef}>
                                            <EpisodeList authToken={authToken} episodes={episodes} selectedSeason={selectedSeason} episodeStreams={episodeStreams[storeKeyRef.current] || {}} onEpisodeClick={getEpisodeStreams} onEpisodeStreamClick={(stream, isEnterpress) => handleStreamPlay(stream, isEnterpress)} isLoadingEpisodeStreams={isLoadingEpisodeStreams} onEpisodeFocus={onEpisodeFocus} onEpisodeStreamFocus={onEpisodeFocus} isFocusable={Boolean(showEpisodes && selectedSeason)} />
                                            {/* <div className="flex flex-col gap-4 flex-wrap max-w-full">
                                                {
                                                    episodes[selectedSeason?._id || ""]?.map((episode, index) => <Episode key={index} episode={episode} onClick={() => getEpisodeStreams(episode)} episodeStreams={episodeStreams[storeKeyRef.current]?.[episode?._id] || undefined} onEpisodeStreamClick={(stream) => handleStreamPlay(stream)} isLoadingStreams={isLoadingEpisodeStreams === episode?._id} />)
                                                }
                                            </div> */}
                                        </div>
                                        <div className={`absolute w-full h-full top-0 bottom-0 rounded-xl backdrop-blur-sm flex items-center justify-center duration-300 ease-linear opacity-0 invisible ${showEpisodes && !episodes[selectedSeason?._id || ""]?.length ? "!opacity-100 !visible" : ""}`}>
                                            <HashLoader size={70} speedMultiplier={1.2} color="#fde047" loading={showEpisodes} />
                                        </div>
                                    </div>
                                </div>
                            ) : ""
                        }
                    </div>

                    <div className={`absolute w-full h-full top-0 bottom-0 rounded-xl backdrop-blur-sm flex items-center justify-center duration-300 ease-linear opacity-0 invisible ${isLoadingUrl ? "!opacity-100 !visible" : ""}`}>
                        <HashLoader size={70} speedMultiplier={1.2} color="#fde047" loading={isLoadingUrl} />
                    </div>

                    {/* <div className={`fixed w-full h-full top-0 bottom-0 duration-500 ease-linear opacity-0 invisible bg-black -bg-opacity-90 ${mediaUrl?.length ? "!visible !opacity-100" : ""}`} ref={ref}>
                    <MediaPlayer id="media-player" key={mediaUrl} src={mediaUrl + ".mp4"} className="h-full" title={displayDetails?.title} poster={displayDetails?.art.poster || ""} keyShortcuts={{togglePaused: "Space Enter", seekBackward: "ArrowLeft", seekForward: "ArrowRight", toggleFullscreen: "ArrowUp", toggleCaptions: "ArrowDown"}} keyTarget={mediaUrl ? "document" : "player"} autoplay={true}>
                        <MediaProvider key={mediaUrl} />
                        <DefaultVideoLayout icons={defaultLayoutIcons} />
                        <Time type="duration" />
                    </MediaPlayer>
                    </div> */}

                    {/* <AVPlay mediaUrl={mediaUrl} onPlaybackComplete={handlePlaybackComplete} /> */}

                    {
                        <PlayMedia key={media._id} show={showPlayer} mediaUrl={mediaUrl} mediaFormat="mp4" mediaType="video/mp4" mediaDetails={displayDetails} onExit={onPlayerExit} />
                        // renderMedia()
                    }
                </div>
            </div>
        </FocusContext.Provider>
    )
})

export default MediaModal