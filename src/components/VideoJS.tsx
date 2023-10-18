import { fullscreenShortcut, handlePlayerShortcuts } from '@/utils/general';
import { useFocusable } from '@noriginmedia/norigin-spatial-navigation';
import React from 'react';
import videojs from 'video.js';
import Player from 'video.js/dist/types/player';
import 'video.js/dist/video-js.css';

export interface VideoPlayerProps {
    options: any;
    quitPlayer: () => void;
    onReady: (player: any) => void;
}

export const VideoJS = ({options, onReady, quitPlayer}: VideoPlayerProps) => {
//   const ref = React.useRef(null);
  // console.log("VideoJS is re-rendering")
  const playerRef = React.useRef<Player | null>(null);
  const { ref, focused, focusSelf } = useFocusable();

  React.useEffect(() => {

    console.log("PlayerRef: ", playerRef.current)
    // Make sure Video.js player is only initialized once
    if (!playerRef.current) {
      // The Video.js player needs to be _inside_ the component el for React 18 Strict Mode. 
      const videoElement = document.createElement("video-js");

      videoElement.classList.add('vjs-big-play-centered');
      ref.current.appendChild(videoElement);

      
      let keyTimestamps = {
          arrowUpTimestamp: 0
      }

      if (videoElement) {
        const player = playerRef.current = videojs(videoElement, {...options, ...{
          userActions: {
              hotkeys: function(event: KeyboardEvent) {
                // `this` is the player in this context
                console.log("Hotkey,", event.key, event.keyCode)
                if (event.key === 'ArrowUp') {
                  // keyTimestamps.arrowUpTimestamp = fullscreenShortcut(keyTimestamps.arrowUpTimestamp, player);
                  const currentTimestamp = Date.now();
                  const timeSinceLastEnter = currentTimestamp - keyTimestamps.arrowUpTimestamp;

                  if (timeSinceLastEnter < 1000) {
                  // The user pressed Enter twice within 1 second (adjust the time threshold as needed).
                      if (document.fullscreenEnabled) {
                          // Request full-screen mode
                          try {
                              if (player.isFullscreen()) {
                                  player.exitFullscreen();
                              } else {
                                  player.requestFullscreen();
                              }
                          } catch(error) {
                              console.log(error)
                          }
                      }

                  // Reset the timestamp to avoid multiple triggers for the same double Enter key press.
                  keyTimestamps.arrowUpTimestamp = 0;

                  } else {
                      // Set the timestamp of the first Enter key press.
                      keyTimestamps.arrowUpTimestamp = currentTimestamp;
                  }
                } else {
                    console.log("VideoJS shortcut handler")
                    handlePlayerShortcuts(event, player, keyTimestamps)
                }
              }
          }
        }}, () => {
          // focusSelf();
          videojs.log('player is ready');
          player.focus()
          onReady && onReady(player);
        });
      }

    // You could update an existing player in the `else` block here
    // on prop change, for example:
    } else {
      const player: Player = playerRef.current;
      // console.log(options.sources)

      // if (player) {
        player.autoplay(options.autoplay);
        player.src(options.sources);
      // }
    }
  }, [options, ref, onReady, quitPlayer, focusSelf]);

  // Dispose the Video.js player when the functional component unmounts
  React.useEffect(() => {
    // if (playerRef.current) {
        const player: Player | null = playerRef.current;
        
      // }
    return () => {
      if (player && !player.isDisposed()) {
        console.log("Disposing Player")
        player.dispose();
        playerRef.current = null;
      }
    };

  }, [playerRef]);

  return (
    <div data-vjs-player>
      {/* <video-js id="video-js" className="vjs-big-play-centered"></video-js> */}
      <div ref={ref} className={focused ? "spatial-is-focused" : "is-not-focused-spatial"}>
      </div>
    </div>
  );
}

export default VideoJS;