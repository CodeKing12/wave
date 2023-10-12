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
  const playerRef = React.useRef(null);
  const { ref, focused, focusSelf } = useFocusable();

  React.useEffect(() => {

    // Make sure Video.js player is only initialized once
    if (!playerRef.current) {
      // The Video.js player needs to be _inside_ the component el for React 18 Strict Mode. 
      const videoElement = document.createElement("video-js");

      videoElement.classList.add('vjs-big-play-centered');
      ref?.current.appendChild(videoElement);
      
    let keyTimestamps = {
        arrowUpTimestamp: 0
    }

      const player = playerRef.current = videojs(videoElement, {...options, ...{
        userActions: {
            hotkeys: function(event: KeyboardEvent) {
              // `this` is the player in this context
              handlePlayerShortcuts(event, player, keyTimestamps)
            }
        }
      }}, () => {
        // focusSelf();
        videojs.log('player is ready');
        onReady && onReady(player);
      });

    // You could update an existing player in the `else` block here
    // on prop change, for example:
    } else {
      const player: Player = playerRef.current;

      player.autoplay(options.autoplay);
      player.src(options.sources);
    }
  }, [options, ref, onReady, quitPlayer, focusSelf]);

  // Dispose the Video.js player when the functional component unmounts
  React.useEffect(() => {
    if (playerRef.current) {
        const player: Player = playerRef.current;
        
        return () => {
          if (player && !player.isDisposed()) {
            player.dispose();
            playerRef.current = null;
          }
        };
    }

  }, [playerRef]);

  return (
    <div data-vjs-player>
      <div ref={ref} className={focused ? "spatial-is-focused" : "is-not-focused-spatial"} />
    </div>
  );
}

export default VideoJS;