import { getDisplayDetails, getRatingAggr } from "./MediaCard";
import { MediaObj, SeriesObj, StreamObj } from "./MediaTypes";
import { Back, Star1, HeartAdd, Play, PlayCircle, VolumeHigh, MessageText1, Size, Barcode, VideoSlash, Document, Clock, Image as ImageIcon, Backward } from "iconsax-react";
import { useState, useEffect, useRef } from "react";
import {MEDIA_ENDPOINT, TOKEN_PARAM_NAME, TOKEN_PARAM_VALUE, proxyUrl } from "./constants";
import axios from "axios";
import Skeleton from "react-loading-skeleton";
import { HashLoader } from "react-spinners";
import { bytesToSize, convertSecondsToTime, formatDate, getMediaStreams, getStreamUrl, getUUID, secondsToHMS, setWidths, transformStreamObj } from "@/utils/general";
import 'vidstack/styles/defaults.css';
import 'vidstack/styles/community-skin/video.css';
import { MediaCommunitySkin, MediaOutlet, MediaPlayer, MediaPoster } from '@vidstack/react';

interface MediaModalProps {
    show: boolean;
    media: MediaObj,
    authToken: string,
    onExit: () => void;
}

interface SeasonProps {
    season: SeriesObj;
    onClick: () => void;
}

interface EpisodeProps {
    episode: SeriesObj;
    onClick: () => void;
    episodeStreams: StreamObj[];
    isLoadingStreams: boolean;
    onEpisodeStreamClick: (stream: StreamObj) => void;
}

interface SeriesData {
    [mediaId: string]: SeriesObj[];
}

interface SeriesStreamObj {
    [seasonId: string]: {
        [episodeId: string]: StreamObj[]
    }
}


function Season({ season, onClick }: SeasonProps) {
    const seasonDetails = getDisplayDetails(season._source.i18n_info_labels)
    const mediaType = season._source.info_labels.mediatype;
    let { rating, voteCount } = getRatingAggr(season._source.ratings);
    // console.log(seasonDetails, season)

    return (
        <div className="w-[170px] h-[250px] relative rounded-xl cursor-pointer" onClick={onClick}>
            {
                seasonDetails.art.poster ? <img className="absolute top-0 bottom-0 left-0 right-0 w-full h-full rounded-xl" src={seasonDetails?.art.poster} alt={seasonDetails?.plot} /> : ""
            }
            {
                // mediaType === "episode" ?
                // <h4 className="rounded-tl-xl absolute top-0 left-0 bg-yellow-500 bg-opacity-80 text-black-1 font-semibold text-sm py-1 px-2">Episode { season._source.info_labels.episode }</h4> 
                // : ""
            }
            <div className="w-full bg-black bg-opacity-80 px-3 py-3 text-white absolute bottom-0 rounded-b-[11px]">
                <h4>{mediaType === "season" ? season._source.info_labels.originaltitle || `Season ${season._source.info_labels.season}` : mediaType === "episode" ? seasonDetails.title : ""}</h4>
            </div>
        </div>
    )
}

function Episode({ episode, onClick, episodeStreams, isLoadingStreams, onEpisodeStreamClick }: EpisodeProps) {
    const episodeDetails = getDisplayDetails(episode._source.i18n_info_labels);
    const hasNoStreams = Array.isArray(episodeStreams) && !episodeStreams?.length;
    const [showStreams, setShowStreams] = useState(false);
    let { rating, voteCount } = getRatingAggr(episode._source.ratings);
    useEffect(() => {
        console.log(episodeStreams)
    }, [episodeStreams])

    useEffect(() => {
        console.log(showStreams)
    }, [showStreams])

    return (
        <div className={`max-w-full relative px-6 py-4 border-2 border-transparent hover:border-yellow-300 hover:border-opacity-100 rounded-xl transition-all duration-500 ease-in-out ${episodeStreams?.length ? "border-yellow-300 border-opacity-60" : ""}`}>
            <article className="flex items-center space-x-6 duration-500 ease-in-out w-full">
                <img src={episodeDetails?.art.poster} alt="" width="60" height="50" className="flex-none rounded-md bg-slate-100 w-16 h-20 object-cover" />
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
                <button className={`h-16 min-w-[48px] w-12 border-black-1 bg-yellow-300 text-black-1 rounded-md text-base tracking-wide font-bold border-2 border-transparent hover:bg-black-1 hover:border-yellow-300 hover:text-yellow-300 flex justify-center items-center !ml-10 ${hasNoStreams ? "opacity-40 pointer-events-none" : ""}`} onClick={onClick}>
                    <PlayCircle size={28} variant="Bold" />
                </button>
            </article>
            <div className={`flex flex-col gap-5 opacity-0 invisible -translate-y-10 duration-500 ease-in-out ${episodeStreams?.length ? "mt-5 !opacity-100 !visible !translate-y-0" : ""}`}>
                {
                    episodeStreams?.length ? 
                    episodeStreams.map((stream, index) => <MediaStreamOption key={index} stream={stream} isEpisode={true} onStreamClick={() => onEpisodeStreamClick(stream)} />)
                    : ""
                }
            </div>
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


function MediaStreamOption({ stream, isEpisode, onStreamClick }: { stream: StreamObj, isEpisode?: boolean, onStreamClick: () => void }) {
    return (
        <div className={`flex items-center justify-between ${isEpisode ? "gap-10" : "gap-20"}`}>
            <div className="flex gap-8 text-[15px] text-gray-300 text-opacity-50">
                {
                    stream.video.length ?
                    <div className="duration flex flex-col gap-1.5 items-center">
                        <Clock size={22} variant="Bold" className="text-white text-opacity-70" />
                        <p>
                            {
                                secondsToHMS(stream.video[0].duration)
                            }
                        </p>
                    </div> : ""
                }
                {
                    !isEpisode ? (
                        <div className="size flex flex-col gap-1.5 items-center">
                            <Document size={22} variant="Bold" className="text-white text-opacity-70" />
                            <p>
                                {
                                    bytesToSize(stream.size)
                                }
                            </p>
                        </div>
                    ) : ""
                }
                {
                    stream.audio.length ?
                    <div className="audio flex flex-col gap-1.5 items-center">
                        <VolumeHigh size={22} variant="Bold" className="text-white text-opacity-70" />
                        <p>
                            {
                                stream.audio.map(audio => audio?.language?.toUpperCase() || "").join("/")
                            }
                        </p>
                    </div> : ""
                }
                {
                    stream.subtitles.length ?
                    <div className="subtitles flex flex-col gap-1.5 items-center">
                        <MessageText1 size={22} variant="Bold" className="text-white text-opacity-70" />
                        <p>
                            {
                                stream.subtitles.map(subtitle => subtitle.language.toUpperCase()).join("/")
                            }
                        </p>
                    </div> : ""
                }
                {
                    stream.video.length ?
                    <div className="resolution flex flex-col gap-1.5 items-center">
                        <Size size={22} variant="Bold" className="text-white text-opacity-70" />
                        <p>
                            {
                                stream.video.map(video => video.width + "×" + video.height).join(",")
                            }
                        </p>
                    </div> : ""
                }
                {
                    stream.video.length && stream.audio.length && !isEpisode ?
                    <div className="codec flex flex-col gap-1.5 items-center">
                        <Barcode size={22} variant="Bold" className="text-white text-opacity-70" />
                        <p>
                            {
                                stream.video[0].codec + "+" + stream.audio[0].codec
                            }
                        </p>
                    </div> : ""
                }
            </div>

            {
                isEpisode ? 
                    <button onClick={() => {onStreamClick();}}>
                        <PlayCircle size={40} variant="Bold" className="text-yellow-300" />
                    </button>
                : (
                    <button className="h-16 w-12 bg-yellow-300 text-black-1 rounded-md text-base tracking-wide font-bold border-2 border-transparent hover:bg-black-1 hover:border-yellow-300 hover:text-yellow-300 flex justify-center items-center gap-4" onClick={() => {onStreamClick();}}>
                        <PlayCircle size={28} variant="Bold" />
                    </button>
                )
            }
        </div>
    )
}

export default function MediaModal({ show, media, authToken, onExit }: MediaModalProps) {
    const displayDetails = getDisplayDetails(media._source.i18n_info_labels)
    const movieDetails = media._source;
    const [showEpisodes, setShowEpisodes] = useState(false);
    const [streams, setStreams] = useState([]);
    const [episodeStreams, setEpisodeStreams] = useState<SeriesStreamObj>({});
    const [seasons, setSeasons] = useState<SeriesData>({});
    const [selectedSeason, setSelectedSeason] = useState<SeriesObj>();
    const [selectedEpisode, setSelectedEpisode] = useState();
    const [episodes, setEpisodes] = useState<SeriesData>({});
    const [selectedStream, setSelectedStream] = useState<StreamObj | undefined>();
    const [mediaUrl, setMediaUrl] = useState("");
    const [isLoadingEpisodeStreams, setIsLoadingEpisodeStreams] = useState("");
    let { rating, voteCount } = getRatingAggr(movieDetails.ratings);
    const streamClasses = [".size", ".audio", ".subtitles", ".resolution", ".codec", ".duration"]
    const [isLoadingUrl, setIsLoadingUrl] = useState(false);
    const movieTitle = displayDetails?.title || movieDetails.info_labels?.originaltitle;
    const storeKeyRef = useRef("");
    
    useEffect(() => {
        storeKeyRef.current = media._id + "__" + selectedSeason?._id;
    }, [media, selectedSeason])

    function onMediaCanLoad(event: any) {
        console.log(event)
    }

    function transformMediaUrl(originalUrl: string) {
        const modifiedUrl = originalUrl.replace(/https:\/\/\d+\.dl\.wsfiles\.cz/, proxyUrl);
        return modifiedUrl;
    }

    async function getEpisodes(season: SeriesObj) {
        try {
            const response = await axios.get(MEDIA_ENDPOINT + `/api/media/filter/v2/parent?sort=episode`, {
                params: {
                    value: season._id,
                    [TOKEN_PARAM_NAME]: TOKEN_PARAM_VALUE,
                }
            })
            console.log(response.data.hits.hits);
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
            if (movieDetails.info_labels.mediatype === "tvshow") {
                axios.get(MEDIA_ENDPOINT + `/api/media/filter/v2/parent?sort=episode`, {
                    params: {
                        value: media._id,
                        [TOKEN_PARAM_NAME]: TOKEN_PARAM_VALUE,
                    }
                })
                .then(function (response) {
                    console.log(response.data.hits.hits);
                    setSeasons((prevSeasons) => {
                        return {
                            ...prevSeasons,
                            [media._id]: response.data.hits.hits
                        }
                    });
                })
            } else {
                if (!media._streams) {
                    const mediaStreams = await getMediaStreams(media);
                    setStreams(mediaStreams);
                }
            }
        }
        fetchModalData();
    }, [media._id]) /* eslint-disable-line react-hooks/exhaustive-deps */

    useEffect(() => {
        streamClasses.forEach((streamClass) => setWidths(streamClass))
    }, [media._id, streams]) /* eslint-disable-line react-hooks/exhaustive-deps */

    async function handleStreamPlay(stream: StreamObj) {
        setIsLoadingUrl(true);
        setSelectedStream(stream);
        const mediaLink = await getStreamUrl(authToken, stream);
        if (mediaLink) {
            // console.log(mediaLink)
            setMediaUrl(mediaLink)
        };
        setIsLoadingUrl(false);
    }

    async function onSeasonClick(season: SeriesObj) {
        setShowEpisodes(true);
        setSelectedSeason(season);
        let seasonEpisodes = episodes[season._id];
        if (!seasonEpisodes) {
            seasonEpisodes = await getEpisodes(season);
            console.log(seasonEpisodes)
        }
        setEpisodes((prevEpisodes) => { 
            return { ...prevEpisodes, [season._id]: seasonEpisodes }
        });
    }

    async function getEpisodeStreams(episode: SeriesObj) {
        let epiStreams = episodeStreams[storeKeyRef.current]?.[episode?._id]
        console.log(epiStreams)
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
        console.log(episodeStreams)
    }

    function exitModal() {
        onExit();
        // setTimeout(() => {
        setSelectedSeason(undefined);
        setSelectedEpisode(undefined);
        setShowEpisodes(false);
        // }, 600)
    }

    // rating = ; // To get the rating as a fraction of 10. (Multiplying by 2 undoes the dividing by 2 in the getRatingAggr function)

    return (
        <div className={`modal-root fixed top-0 bottom-0 left-0 right-0 w-full h-full z-50 p-10 bg-black-1 ease-in-out duration-500 opacity-0 invisible -translate-x-20 ${show ? "!translate-x-0 !opacity-100 !visible" : ""}`}>
            <button className="absolute top-0 right-0 bg-yellow-300 text-black-1 w-14 h-14 flex items-center justify-center hover:bg-black-1 hover:text-yellow-300 border-[3px] border-yellow-300" onClick={exitModal}>
                <Back size={30} variant="Bold" />
            </button>

            <div className="flex justify-center gap-20 h-full">
                <div className="min-w-[500px] w-[500px] h-full relative bg-[#191919] rounded-[30px] bg-opacity-75">
                    {
                        displayDetails?.art?.poster ?
                        <img key={media._id} src={displayDetails.art.poster} className="w-full h-full object-cover rounded-[30px]" alt={movieTitle} /> || <Skeleton width={500} height="100%" /> /* eslint-disable-line @next/next/no-img-element */
                        : <ImageIcon size={170} className="text-yellow-300 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 fill-transparent group-hover:-fill-yellow-300 transition-all ease-linear duration-500" variant="Broken" />
                    }
                </div>

                <div className="modal-content min-w-[550px] py-10 text-gray-300 overflow-y-scroll hide-scrollbar relative duration-300 ease-in-out"> {/* max-w-[620px] */}
                    <div className="max-w-[620px]">
                        <h2 className="font-semibold text-white opacity-90 text-4xl mb-6">{ movieTitle }</h2>
                        <p className="max-w-[600px] leading-loose mb-8">
                            {
                                displayDetails?.plot
                            }
                        </p>
                        <div className="grid grid-cols-2 gap-7 text-[17px] mb-8">
                            <p className="flex flex-col gap-2">
                                <span className="text-[15px] opacity-40">Release Date: </span>
                                <span className="">{ formatDate(movieDetails.info_labels?.premiered) || "" }</span>
                            </p>
                            <p className="flex flex-col gap-2">
                                <span className="text-[15px] opacity-40">Genre(s): </span>
                                <span className="">{ movieDetails.info_labels.genre.join(", ") }</span>
                            </p>
                            {
                                movieDetails.info_labels.director.length ? (
                                    <p className="flex flex-col gap-2">
                                        <span className="text-[15px] opacity-40">{ movieDetails.info_labels.director.length > 1 ? "Directors:" : "Director:" } </span>
                                        <span className="">{ movieDetails.info_labels.director.join(", ") }</span>
                                    </p>
                                ) : ""
                            }
                            {
                                movieDetails.info_labels.studio.length ? (
                                    <p className="flex flex-col gap-2">
                                        <span className="text-[15px] opacity-40">{ movieDetails.info_labels.studio.length > 1 ? "Studios:" : "Studio:" } </span>
                                        <span className="">{ movieDetails.info_labels.studio.join(", ") }</span>
                                    </p>
                                ) : ""
                            }
                            <p className="flex flex-col gap-2">
                                <span className="text-[15px] opacity-40">Run Time: </span>
                                <span className="">{ convertSecondsToTime(movieDetails.info_labels.duration) }</span>
                            </p>
                            <p className="flex flex-col gap-2">
                                <span className="text-[15px] opacity-40">Rating: </span>
                                <div className="flex items-center gap-2">
                                    <span className="">{ (rating * 2) % 1 === 0 ? (rating * 2).toString() : (rating * 2).toFixed(1) }/10</span>
                                    <div className="flex items-center gap-0.5">
                                        {
                                            Array(Math.round(rating)).fill("").map((value, index) => {
                                                return (
                                                    <Star1 className="fill-yellow-300 text-yellow-300" key={index} size={16} />
                                                )
                                            })
                                        }
                                        {
                                            Array(5 - Math.round(rating)).fill("").map((value, index) => {
                                                return (
                                                    <Star1 className="fill-gray-300 text-gray-300 opacity-90" key={index} size={16} />
                                                )
                                            })
                                        }
                                    </div>
                                    <p className="text-[15px] text-gray-300 text-opacity-70 font-medium leading-normal ml-3">({ voteCount })</p>
                                </div>
                            </p>
                        </div>
                        {
                            movieDetails.cast.length ? (
                                <p className="flex flex-col gap-2">
                                    <span className="text-[15px] opacity-40">Cast: </span>
                                    <span className="leading-loose opacity-90">{ movieDetails.cast.map(actor => actor.name).join(", ") }</span>
                                </p>
                            ) : ""
                        }
                    </div>

                    {
                        movieDetails.info_labels.mediatype === "tvshow" ? "" : (
                            <div className={`mt-12 mb-6 ${streams?.length ? "" : "w-[600px]"}`}>
                                <p className="text-base opacity-60 text-center mb-5">Available Streams</p>
                                <div className="flex flex-col gap-10">
                                    {
                                        streams?.length ? streams.map((stream, index) => <MediaStreamOption key={index} stream={stream} onStreamClick={() => handleStreamPlay(stream)} />)
                                        : <HashLoader size={70} speedMultiplier={1.2} color="#fde047" loading={true} className="mt-5 relative left-1/2 -translate-x-1/2 -translate-y-1/2" />
                                    }
                                </div>
                            </div>
                        ) 
                    }

                    <div className="flex gap-12 mt-10">
                        <button className="px-10 py-3 bg-white text-black-1 rounded-xl text-[15px] tracking-wide font-bold border-2 border-transparent hover:bg-opacity-5 hover:border-white hover:text-white flex items-center gap-4">
                            <HeartAdd size={32} variant="Bold" />
                            Add to Favorites
                        </button>

                        <button className={`bg-yellow-300 text-black-1 w-14 h-14 rounded-xl flex items-center justify-center opacity-0 invisible ${showEpisodes && selectedSeason ? "!opacity-100 !visible" : ""}`} onClick={() => {setShowEpisodes(false);setSelectedSeason(undefined);}}>
                            <Backward size={28} variant="Bulk" />
                        </button>

                        {/* <button className="px-10 py-3 bg-yellow-300 text-black-1 rounded-xl text-base tracking-wide font-bold border-2 border-transparent hover:bg-black-1 hover:border-yellow-300 hover:text-yellow-300 flex items-center gap-4">
                            <PlayCircle size={32} variant="Bold" />
                            Watch
                        </button> */}
                    </div>

                    {
                        movieDetails.info_labels.mediatype === "tvshow" ? (
                            <div className={`mt-12 mb-6- ${seasons[media._id]?.length ? "" : "w-[600px]"}`}>
                                <p className="text-base opacity-60 text-center mb-5">Available {showEpisodes ? "Episodes" : "Seasons"}</p>
                                <div className="relative w-full min-h-[250px]">
                                    <div className={`max-w-full w-full absolute top-0 flex flex-wrap gap-8 duration-300 ease-in-out ${selectedSeason && seasons[media?._id]?.length ? "opacity-0 invisible -translate-y-16" : ""}`}>
                                        {
                                            seasons[media._id]?.length ? seasons[media._id].map((seriesMedia, index) =>
                                                seriesMedia._source.info_labels.mediatype === "season" ?
                                                <Season key={index} season={seriesMedia} onClick={() => onSeasonClick(seriesMedia)} />
                                                : <Episode key={index} episode={seriesMedia} onClick={() => getEpisodeStreams(seriesMedia)} episodeStreams={episodeStreams[storeKeyRef.current]?.[seriesMedia._id]} onEpisodeStreamClick={(stream) => handleStreamPlay(stream)} isLoadingStreams={isLoadingEpisodeStreams === seriesMedia._id} />
                                            )
                                            : <HashLoader size={70} speedMultiplier={1.2} color="#fde047" loading={true} className="mt-5 relative left-1/2 -translate-x-1/2 -translate-y-1/2" />
                                        }
                                    </div>
                                    <div className={`max-w-full absolute top-0 flex flex-col gap-10 opacity-0 invisible translate-y-16 duration-500 ease-in-out ${showEpisodes && selectedSeason && episodes[selectedSeason?._id]?.length ? "!opacity-100 !visible !translate-y-0" : ""}`}>
                                        <div className="flex flex-col gap-4 flex-wrap max-w-full">
                                            {
                                                episodes[selectedSeason?._id || ""]?.map((episode, index) => <Episode key={index} episode={episode} onClick={() => getEpisodeStreams(episode)} episodeStreams={episodeStreams[storeKeyRef.current]?.[episode?._id] || undefined} onEpisodeStreamClick={(stream) => handleStreamPlay(stream)} isLoadingStreams={isLoadingEpisodeStreams === episode?._id} />)
                                            }
                                        </div>
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

                <div className={`fixed w-full h-full top-0 bottom-0 duration-500 ease-linear opacity-0 invisible bg-black bg-opacity-90 ${mediaUrl.length ? "!visible !opacity-100" : ""}`}>
                    <MediaPlayer
                        title={displayDetails?.title || movieDetails.info_labels?.originaltitle}
                        src={mediaUrl.length ? "http://localhost:5000/video/"+mediaUrl : ""}
                        // src={[{
                        //         src: mediaUrl.length ? transformMediaUrl(mediaUrl) : "",
                        //         type: "video/mp4; codecs=avc1.42E01E, mp4a.40.2"
                        //     }
                        // ]}
                        poster={displayDetails.art.poster}
                        // thumbnails="https://media-files.vidstack.io/sprite-fight/thumbnails.vtt"
                        aspectRatio={selectedStream?.video[0].aspect || 16 / 9}
                        crossorigin="anonymous"
                        autoplay={true}
                        controls={true}
                        onCanLoad={onMediaCanLoad}
                    >
                        <MediaOutlet>
                            <MediaPoster
                                alt={displayDetails?.plot}
                            />
                        </MediaOutlet>
                        <MediaCommunitySkin />
                    </MediaPlayer>

                    {/* <video
                        id="my-video"
                        className="h-[calc(100%-10px)]"
                        controls
                        preload="auto"
                        width="100%"
                        data-setup="{}"
                        src={mediaUrl}
                    >
                    </video> */}
                        {/* <p className="vjs-no-js">
                        To view this video please enable JavaScript, and consider upgrading to a
                        web browser that
                            <a href="https://videojs.com/html5-video-support/" target="_blank">
                                supports HTML5 video
                            </a>
                    </p> */}

                    <button className="w-10 h-10 bg-yellow-200 absolute top-0 right-0 z-[99999] flex items-center justify-center" onClick={() => setMediaUrl("")}>
                        <Back variant="Bold" />
                    </button>
                </div>
            </div>
        </div>
    )
}