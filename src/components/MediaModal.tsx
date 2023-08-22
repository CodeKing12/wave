import { getDisplayDetails, getRatingAggr } from "./MediaCard";
import { MediaObj, StreamObj } from "./MediaTypes";
import { Back, Star1, HeartAdd, Play, PlayCircle, VolumeHigh, MessageText1, Size, Barcode, PlayCricle, Document, Clock } from "iconsax-react";
import { useState, useEffect } from "react";
import { AUTH_ENDPOINT, MEDIA_ENDPOINT, PATH_FILE_LINK, PATH_FILE_PASSWORD_SALT, PATH_FILE_PROTECTED, TOKEN_PARAM_NAME, TOKEN_PARAM_VALUE, authAxiosConfig } from "./constants";
import axios from "axios";
import Skeleton from "react-loading-skeleton";
import { HashLoader } from "react-spinners";
import { parseXml } from "@/pages";
import { sha1 } from "@/utils/Sha";
import { md5crypt } from "@/utils/MD5";
import { bytesToSize, convertSecondsToTime, formatDate, getUUID, secondsToHMS, setWidths, transformStreamObj } from "@/utils/general";
import { stream_p } from "@/utils/Stream";
import 'vidstack/styles/defaults.css';
import 'vidstack/styles/community-skin/video.css';
import { MediaCommunitySkin, MediaOutlet, MediaPlayer, MediaPoster } from '@vidstack/react';

interface MediaModalProps {
    show: boolean;
    media: MediaObj,
    authToken: string,
    onExit: () => void;
}

async function getFilePasswordSalt(ident: string): Promise<string> {
    try {
        const response = await axios.post(AUTH_ENDPOINT + PATH_FILE_PASSWORD_SALT, { ident }, authAxiosConfig);
        return parseXml(response.data, "salt");
    } catch (error) {
        console.log("An error occured while getting the salt: ", error);
        return ""; // Return an empty string or handle the error appropriately
    }
}


async function getVideoLink(ident: string, token: string, https: boolean, password?: string) {
    const UUID = getUUID();

    try {
        let response = await axios.post(AUTH_ENDPOINT + PATH_FILE_LINK, {
            ident,
            wst: token,
            device_uuid: UUID,
            force_https: https ? 1 : 0,
            download_type: "video_stream",
            device_vendor: "ymovie",
            password
        }, authAxiosConfig)

        const link = parseXml(response.data, "link")
        console.log(link);
        return link;
    } catch (error) {
        console.log(error);
        return "Unable to get video link";
        // const errorMsg = parseXml(response.data, "message");
        // console.log("File Link Error: ", errorMsg);
        // return errorMsg;
    }
}

async function getStreamUrl(token: string, stream: StreamObj) {
    const https = document.location.protocol === "https:";
    const ident = stream.ident;
    const leanStream = transformStreamObj(stream);

    try {
        const response = await axios.post(AUTH_ENDPOINT + PATH_FILE_PROTECTED, { ident }, authAxiosConfig);
        const isProtected = parseXml(response.data, "protected") === "1";
        console.log(parseXml(response.data, "protected"))
        console.log(parseXml(response.data, "protected") === "1")

        if (isProtected) {
            const salt = await getFilePasswordSalt(ident);
            const password = sha1(md5crypt(stream_p(leanStream), salt));
            const mediaUrl = await getVideoLink(ident, token, https, password)
            return mediaUrl;
        } else {
            const mediaUrl = await getVideoLink(ident, token, https);
            return mediaUrl;
        }

    } catch (error) {
        console.error("An error occurred:", error);
    }
}  


function MediaStreamOption({ stream, onStreamClick }: { stream: StreamObj, onStreamClick: () => void }) {
    return (
        <div className="flex items-center justify-between gap-20">
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
                <div className="size flex flex-col gap-1.5 items-center">
                    <Document size={22} variant="Bold" className="text-white text-opacity-70" />
                    <p>
                        {
                            bytesToSize(stream.size)
                        }
                    </p>
                </div>
                {
                    stream.audio.length ?
                    <div className="audio flex flex-col gap-1.5 items-center">
                        <VolumeHigh size={22} variant="Bold" className="text-white text-opacity-70" />
                        <p>
                            {
                                stream.audio.map(audio => audio.language.toUpperCase()).join("/")
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
                    stream.video.length && stream.audio.length ?
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

            <button className="h-16 w-12 bg-yellow-300 text-black-1 rounded-md text-base tracking-wide font-bold border-2 border-transparent hover:bg-black-1 hover:border-yellow-300 hover:text-yellow-300 flex justify-center items-center gap-4" onClick={() => {onStreamClick();}}>
                <PlayCircle size={28} variant="Bold" />
            </button>
        </div>
    )
}

export default function MediaModal({ show, media, authToken, onExit }: MediaModalProps) {
    const displayDetails = getDisplayDetails(media._source.i18n_info_labels)
    const movieDetails = media._source;
    const [streams, setStreams] = useState([]);
    const [selectedStream, setSelectedStream] = useState<StreamObj | undefined>();
    const [mediaUrl, setMediaUrl] = useState("");
    let { rating, voteCount } = getRatingAggr(movieDetails.ratings);
    const streamClasses = [".size", ".audio", ".subtitles", ".resolution", ".codec", ".duration"]
    const [isLoadingUrl, setIsLoadingUrl] = useState(false);
    const movieTitle = displayDetails?.title || movieDetails.info_labels?.originaltitle;

    useEffect(() => {
        if (!media._streams) {
            axios.get(MEDIA_ENDPOINT + `/api/media/${media._id}/streams`, {
                params: {
                    [TOKEN_PARAM_NAME]: TOKEN_PARAM_VALUE,
                }
            })
            .then(function (response) {
                console.log(response.data);
                setStreams(response.data);
            })
        }
    }, [])

    useEffect(() => {
        streamClasses.forEach((streamClass) => setWidths(streamClass))
    }, [streams])

    async function handleStreamPlay(stream: StreamObj) {
        setIsLoadingUrl(true);
        setSelectedStream(stream);
        const mediaLink = await getStreamUrl(authToken, stream);
        if (mediaLink) {
            console.log(mediaLink)
            setMediaUrl(mediaLink)
        };
        setIsLoadingUrl(false);
    }


    // rating = ; // To get the rating as a fraction of 10. (Multiplying by 2 undoes the dividing by 2 in the getRatingAggr function)

    return (
        <div className={`fixed top-0 bottom-0 left-0 right-0 w-full h-full z-50 p-10 bg-black-1 ease-linear duration-300 opacity-0 invisible ${show ? "!opacity-100 !visible" : ""}`}>
            <button className="absolute top-0 right-0 bg-yellow-300 text-black-1 w-14 h-14 flex items-center justify-center hover:bg-black-1 hover:text-yellow-300 border-[3px] border-yellow-300" onClick={onExit}>
                <Back size={30} variant="Bold" />
            </button>

            <div className="flex justify-center gap-20 h-full">
                { <img src={displayDetails.art.poster} className="w-[500px] h-full object-cover rounded-[30px]" /> || <Skeleton width={500} height="100%" /> }

                <div className="py-10 text-gray-300 overflow-y-scroll hide-scrollbar relative"> {/* max-w-[620px] */}
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

                    <div className="mt-12 mb-16">
                        <p className="text-base opacity-60 text-center mb-5">Available Streams</p>
                        <div className="flex flex-col gap-10">
                            {
                                streams.length ? streams.map((stream, index) => <MediaStreamOption key={index} stream={stream} onStreamClick={() => handleStreamPlay(stream)} />)
                                : <HashLoader size={45} speedMultiplier={1.2} color="#fde047" loading={true} className="relative left-1/2 -translate-x-1/2 -translate-y-1/2" />
                            }
                        </div>
                    </div>

                    <div className="flex gap-12 mt-10">
                        <button className="px-10 py-3 bg-white text-black-1 rounded-xl text-[15px] tracking-wide font-bold border-2 border-transparent hover:bg-opacity-5 hover:border-white hover:text-white flex items-center gap-4">
                            <HeartAdd size={32} variant="Bold" />
                            Add to Favorites
                        </button>

                        {/* <button className="px-10 py-3 bg-yellow-300 text-black-1 rounded-xl text-base tracking-wide font-bold border-2 border-transparent hover:bg-black-1 hover:border-yellow-300 hover:text-yellow-300 flex items-center gap-4">
                            <PlayCircle size={32} variant="Bold" />
                            Watch
                        </button> */}
                    </div>
                </div>

                <div className={`absolute w-full h-full top-0 bottom-0 bg-black bg-opacity-40 backdrop-blur-md flex items-center justify-center duration-300 ease-linear opacity-0 invisible ${isLoadingUrl ? "!opacity-100 !visible" : ""}`}>
                    <HashLoader size={70} speedMultiplier={1.2} color="#fde047" loading={isLoadingUrl} />
                </div>

                <div className={`fixed w-full h-full top-0 bottom-0 duration-500 ease-linear opacity-0 invisible ${mediaUrl.length ? "!visible !opacity-100" : ""}`}>
                    <MediaPlayer
                        title={displayDetails?.title || movieDetails.info_labels?.originaltitle}
                        src={mediaUrl}
                        poster={displayDetails.art.poster}
                        // thumbnails="https://media-files.vidstack.io/sprite-fight/thumbnails.vtt"
                        aspectRatio={selectedStream?.video[0].aspect || 16 / 9}
                        crossorigin="anonymous"
                        autoplay={true}
                    >
                        <MediaOutlet>
                            <MediaPoster
                                alt={displayDetails?.plot}
                            />
                            <track
                                src="https://media-files.vidstack.io/sprite-fight/subs/english.vtt"
                                label="English"
                                srcLang="en-US"
                                kind="subtitles"
                                default
                            />
                        </MediaOutlet>
                        <MediaCommunitySkin />
                    </MediaPlayer>
                </div>
            </div>
        </div>
    )
}