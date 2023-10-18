import { memo, useRef, useEffect, useState, useCallback } from "react";
import VideoJS from "./VideoJS";
import FocusLeaf from "./FocusLeaf";
import { Back } from "iconsax-react";
import videojs from "video.js";
import { FocusContext, useFocusable } from "@noriginmedia/norigin-spatial-navigation";
import { fullscreenShortcut, handleEscape, handlePlayerShortcuts } from "@/utils/general";
import Player from "video.js/dist/types/player";
// import { MediaCommunitySkin, MediaOutlet, MediaPlayer, MediaPoster, MediaCaptions, type Props, type MediaCaptionsProps, type MediaPlayerProps, type MediaOutletProps } from '@vidstack/react';
import { I18nInfoLabel } from "./MediaTypes";
import {
    isHLSProvider,
    MediaPlayer,
    MediaProvider,
    Poster,
    Track,
    type MediaCanPlayDetail,
    type MediaCanPlayEvent, MediaPlayerInstance,
    type MediaProviderInstance,
    type MediaProviderAdapter,
    type MediaProviderChangeEvent,
    useStore,
    Time,
  } from '@vidstack/react';
  import {
    DefaultAudioLayout,
    defaultLayoutIcons,
    DefaultVideoLayout,
  } from '@vidstack/react/player/layouts/default';

import '@vidstack/react/player/styles/default/theme.css';
import '@vidstack/react/player/styles/default/layouts/video.css';

export interface PlayMediaProps {
    show: boolean,
    mediaUrl?: string,
    mediaFormat: string,
    mediaType: string,
    mediaDetails: I18nInfoLabel,
    onExit: () => void;
}

const PlayMedia = memo(function PlayMedia({ show, mediaUrl, mediaFormat, mediaType, mediaDetails, onExit }: PlayMediaProps) {
    const {
        ref,
        focusSelf,
        hasFocusedChild,
        focusKey,
        focused
    } = useFocusable({
        trackChildren: true,
        isFocusBoundary: true,
        focusable: Boolean(mediaUrl?.length),
        // focusBoundaryDirections: ["left", "right"]
    });
    const providerRef = useRef<MediaProviderInstance>(null)
    // console.log("PlayMedia is re-rendering")
    const playerRef = useRef<Player | null>(null);
    const player = useRef<MediaPlayerInstance>(null);
    // const { canPlay, currentSrc, duration, crossorigin, error } = useStore(MediaPlayerInstance, player);
    // const [src, setSrc] = useState("")
    // const [key, setKey] = useState(1)
    // const [isSet, setIsSet] = useState(false)

    // useEffect(() => {
    //     if (mediaUrl) {
    //         // const source = document.createElement("video")
    //         const mediaPlayer = document.querySelector<HTMLVideoElement>("#media-player video")
    //         const mediaClone = mediaPlayer?.cloneNode(true)
    //         if (mediaPlayer && mediaClone) {
    //             console.log("Replacing Media")
    //             mediaPlayer?.replaceWith(mediaClone)
    //         }
    //         // source.preload = "metadata"
    //         // source.ariaHidden = "true"
    //         // source.src = mediaUrl + ".mp4"
    //         // providerRef.current?.$el?.appendChild(source)
    //         // console.log("Appending Video to Provider")
    //         // player.current?.startLoading();
    //     }
    // }, [mediaUrl])

    // useEffect(() => {
    //     console.log("SET SRC", mediaUrl)
    //     const mediaPlayer = document.querySelector<HTMLVideoElement>("#media-player video")
    //     console.log(currentSrc, canPlay, duration, error)
    //     // setIsSet(false)

    //     if (mediaPlayer && canPlay && duration === 0 && !isSet) {
    //         console.log("Re-adding Source")
    //         setKey((prevKey) => prevKey + 1)
    //         setIsSet(true)
    //         // player.current?.destroy()
    //         // mediaPlayer.src = `${mediaUrl}.${mediaFormat}` || ""
    //         // console.log(mediaPlayer.src)
    //         // player.current?.startLoading()
    //     } else {
    //         console.log("Didnt find Media Player")
    //         console.log(mediaPlayer, canPlay, duration, isSet)
    //     }
    // }, [show, mediaUrl, mediaFormat, canPlay, duration, error, crossorigin, currentSrc, isSet])

    useEffect(() => {
        if (!show && !mediaUrl) {
            // playerRef.current?.dispose()
            document.removeEventListener("keydown", (event) => playerShortcuts(event))
        }
        // if (mediaUrl?.length) {
            // console.log("Focused Myself")
            // focusSelf();
        // }

        // let keyTimestamps = {
        //     arrowUpTimestamp: 0
        // }

        function playerShortcuts(event: KeyboardEvent) {
            // console.log("Doing Shortcuts")
            if (show) {
                if (event.code === "Escape" || event.keyCode === 27) {
                    onExit();
                }    
    
                // if (playerRef.current) {
                //     // if (event.key === 'ArrowUp') {
                //     //     // keyTimestamps.arrowUpTimestamp = fullscreenShortcut(keyTimestamps.arrowUpTimestamp, playerRef.current);
                //     //     const currentTimestamp = Date.now();
                //     //     const timeSinceLastEnter = currentTimestamp - keyTimestamps.arrowUpTimestamp;

                //     //     if (timeSinceLastEnter < 1000) {
                //     //     // The user pressed Enter twice within 1 second (adjust the time threshold as needed).
                //     //         if (document.fullscreenEnabled) {
                //     //             // Request full-screen mode
                //     //             try {
                //     //                 if (playerRef.current.isFullscreen()) {
                //     //                     playerRef.current.exitFullscreen();
                //     //                 } else {
                //     //                     playerRef.current.requestFullscreen();
                //     //                 }
                //     //             } catch(error) {
                //     //                 console.log("Here is the error", error)
                //     //             }
                //     //         }

                //     //     // Reset the timestamp to avoid multiple triggers for the same double Enter key press.
                //     //     keyTimestamps.arrowUpTimestamp = 0;

                //     //     } else {
                //             // Set the timestamp of the first Enter key press.
                //     //         keyTimestamps.arrowUpTimestamp = currentTimestamp;
                //     //     }
                //     // } else {
                //         console.log("PlayMedia shortcut handler")
                //         handlePlayerShortcuts(event, playerRef.current, keyTimestamps)
                //     // }
                // }
            }
        }

        if (show && mediaUrl) {
            document.addEventListener("keydown", (event) => playerShortcuts(event))
        }

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
        src: mediaUrl?.length ? `${mediaUrl}.${mediaFormat}` : undefined,
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

    function onProviderChange(
        provider: MediaProviderAdapter | null,
        nativeEvent: MediaProviderChangeEvent,
      ) {
        console.log("Provider changed", provider, nativeEvent)
        // We can configure provider's here.
        if (isHLSProvider(provider)) {
          provider.config = {};
        }
      }
    
      // We can listen for the `can-play` event to be notified when the player is ready.
      const onCanPlay = (detail: MediaCanPlayDetail, nativeEvent: MediaCanPlayEvent) => {
        // ...
        console.log(detail, nativeEvent)
        // console.log(duration)
      }
    

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
            <div className={`fixed w-full h-full top-0 bottom-0 left-0 duration-500 ease-linear opacity-0 invisible bg-black -bg-opacity-90 ${show ? "!visible !opacity-100" : ""} ${focused ? "player-is-focused" : "naa-not-focused"}`} ref={ref}>
                {/* <MediaPlayer
                    className="h-full"
                    title={mediaDetails?.title}
                    // src={mediaUrl.length ? "http://localhost:5000/video/"+mediaUrl : ""}
                    src={`${mediaUrl}.mp4`}
                    // src={[{
                    //         src: mediaUrl.length ? transformMediaUrl(mediaUrl) : "",
                    //         type: "video/mp4; codecs=avc1.42E01E, mp4a.40.2"
                    //     }
                    // ]}
                    cap
                    poster={mediaDetails?.art.poster || ""}
                    // thumbnails="https://media-files.vidstack.io/sprite-fight/thumbnails.vtt"
                    // aspectRatio={selectedStream?.video[0].aspect || 16 / 9}
                    crossorigin={true}
                    autoplay={true}
                >
                    <MediaOutlet>
                        <MediaPoster
                            alt={mediaDetails?.plot}
                        />
                    </MediaOutlet>
                    <MediaCaptions asChild={true} />
                    <MediaCommunitySkin />
                </MediaPlayer> */}

                {
                    // mediaUrl && mediaUrl?.length && 
                    <MediaPlayer
                    onCanPlay={onCanPlay} id={`media-player`} src={mediaUrl ? `${mediaUrl}.${mediaFormat}` : ""} className="h-full" title={mediaDetails?.title} poster={mediaDetails?.art.poster || ""} keyShortcuts={{togglePaused: "Space Enter", seekBackward: "ArrowLeft", seekForward: "ArrowRight", toggleFullscreen: "ArrowUp", toggleCaptions: "ArrowDown"}} keyTarget={show ? "document" : "player"} autoplay={true} ref={player}>
                        <MediaProvider ref={providerRef} />
                        <DefaultVideoLayout icons={defaultLayoutIcons} />
                        {/* <Time type="duration" /> */}
                    </MediaPlayer>
                    // : ""
                }

                {/* <VideoJS options={playerOptions} onReady={handlePlayerReady} quitPlayer={onExit} /> */}

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

                <FocusLeaf className="quitPlayer absolute top-0 right-0 z-[99999]" focusedStyles="[&>button]:!bg-black-1 [&>button]:!text-yellow-300 [&>button]:!border-yellow-300" isFocusable={Boolean(mediaUrl?.length)} onEnterPress={onExit}>
                    <button className="w-10 h-10 bg-yellow-300 border-[3px] border-transparent flex items-center justify-center hover:bg-black-1 hover:text-yellow-300 hover:border-yellow-300" onClick={onExit}>
                        <Back variant="Bold" />
                    </button>
                </FocusLeaf>
            </div>
        </FocusContext.Provider>
    )
})

export default PlayMedia