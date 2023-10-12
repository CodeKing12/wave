import { useRef, useEffect } from "react";
import VideoJS from "./VideoJS";
import FocusLeaf from "./FocusLeaf";
import { Back } from "iconsax-react";
import videojs from "video.js";
import { FocusContext, useFocusable } from "@noriginmedia/norigin-spatial-navigation";
import { fullscreenShortcut, handleEscape, handlePlayerShortcuts } from "@/utils/general";

export interface PlayMediaProps {
    show: boolean,
    mediaUrl: string,
    mediaFormat: string,
    mediaType: string,
    onExit: () => void;
}

export default function PlayMedia({ show, mediaUrl, mediaFormat, mediaType, onExit }: PlayMediaProps) {
    const {
        ref,
        focusSelf,
        hasFocusedChild,
        focusKey,
        focused
    } = useFocusable({
        trackChildren: true,
        isFocusBoundary: true,
        focusable: Boolean(mediaUrl.length),
        // focusBoundaryDirections: ["left", "right"]
    });
    const playerRef = useRef(null);

    useEffect(() => {
        if (mediaUrl.length) {
            // console.log("Focused Myself")
            focusSelf();
        }

        let keyTimestamps = {
            arrowUpTimestamp: 0
        }

        function playerShortcuts(event: KeyboardEvent) {
            if (show) {
                if (event.key === "Escape" || event.keyCode === 27) {
                    onExit();
                }    
    
                if (playerRef.current) {
                    handlePlayerShortcuts(event, playerRef.current, keyTimestamps)
                }
            }
        }

        document.addEventListener("keydown", (event) => playerShortcuts(event))

        return () => {
            document.removeEventListener("keydown", (event) => playerShortcuts(event))
        }
    }, [mediaUrl, focusSelf, onExit, playerRef, show])

    const playerOptions = {
        autoplay: true,
        controls: true,
        responsive: true,
        // fluid: true,
        sources: [{
        src: mediaUrl.length ? `${mediaUrl}.${mediaFormat}` : undefined,
        type: mediaType
        }],
        html5: {
            nativeTextTracks: true,
            nativeAudioTracks: true
        },
        controlBar: {
            skipButtons: {
                backward: 10,
                forward: 10
            }
        },
        userActions: {
            hotkeys: true
        },
    };

    const handlePlayerReady = (player: any) => {
        playerRef.current = player;

        // You can handle player events here, for example:
        player.on('waiting', () => {
            videojs.log('player is waiting');
        });

        player.on('dispose', () => {
            videojs.log('player will dispose');
        });
    };


    return (
        <FocusContext.Provider value={focusKey}>
            <div className={`fixed w-full h-full top-0 bottom-0 duration-500 ease-linear opacity-0 invisible bg-black -bg-opacity-90 ${mediaUrl.length ? "!visible !opacity-100" : ""} ${focused ? "player-is-focused" : "naa-not-focused"}`} ref={ref}>
                {/* <MediaPlayer
                    className="h-full"
                    title={displayDetails?.title || movieDetails.info_labels?.originaltitle}
                    // src={mediaUrl.length ? "http://localhost:5000/video/"+mediaUrl : ""}
                    src={`${mediaUrl}.mp4`}
                    // src={[{
                    //         src: mediaUrl.length ? transformMediaUrl(mediaUrl) : "",
                    //         type: "video/mp4; codecs=avc1.42E01E, mp4a.40.2"
                    //     }
                    // ]}
                    cap
                    poster={displayDetails.art.poster || ""}
                    // thumbnails="https://media-files.vidstack.io/sprite-fight/thumbnails.vtt"
                    // aspectRatio={selectedStream?.video[0].aspect || 16 / 9}
                    crossorigin={true}
                    autoplay={true}
                >
                    <MediaOutlet>
                        <MediaPoster
                            alt={displayDetails?.plot}
                        />
                    </MediaOutlet>
                    <MediaCaptions asChild={true} />
                    <MediaCommunitySkin />
                </MediaPlayer> */}

                <VideoJS options={playerOptions} onReady={handlePlayerReady} quitPlayer={onExit} />

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

                <FocusLeaf className="absolute top-0 right-0 z-[99999]" focusedStyles="[&>button]:!bg-black-1 [&>button]:!text-yellow-300 [&>button]:!border-yellow-300" isFocusable={Boolean(mediaUrl.length)} onEnterPress={onExit}>
                    <button className="w-10 h-10 bg-yellow-300 border-[3px] border-transparent flex items-center justify-center hover:bg-black-1 hover:text-yellow-300 hover:border-yellow-300" onClick={onExit}>
                        <Back variant="Bold" />
                    </button>
                </FocusLeaf>
            </div>
        </FocusContext.Provider>
    )
}