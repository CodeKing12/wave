// @ts-nocheck

import { memo, useEffect, useRef } from "react";

export interface AVPlayProps {
    mediaUrl?: string,
	onPlaybackComplete: () => void;
}

const AVPlay = memo(function AVPlay({ mediaUrl, onPlaybackComplete }: AVPlayProps) {
    // console.log("Here is the mediaUrl: ", mediaUrl)
	// console.log("Re-rendering AVPlay")
    const avRef = useRef<HTMLElement | null>(null);

    useEffect(() => {
		if (avRef.current?.childElementCount <= 1) {
			// var objElem = document.createElement('object');
			// objElem.type = 'application/avplayer';

			//Adjust the size and position of the media display area 
			//by changing the CSS style attribute
			avRef.current.style.left = 0 + 'px';
			avRef.current.style.top = 0 + 'px';
			avRef.current.style.width = 1920 + 'px';
			avRef.current.style.height = 1080 + 'px';

			var viewPortHeight = 1080;
            var viewPortWidth = 1920;
			var resolutionWidth = 0;
			var resolutionHeight = 0
			// x: playerEl.offsetLeft,
            // y: playerEl.offsetTop,
            // width: playerEl.offsetWidth,
            // height: playerEl.offsetHeight
            // playerCoords.x *= screenWidth / viewPortWidth;
            // playerCoords.y *= screenHeight / viewPortHeight;
            // playerCoords.width *= screenWidth / viewPortWidth;
            // playerCoords.height *= screenHeight / viewPortHeight;

			tizen.systeminfo.getPropertyValue(
				'DISPLAY',
				function successHandler(data) {
					resolutionWidth = data.resolutionWidth;
					resolutionHeight = data.resolutionHeight;
					playerLeft = avRef.current.offsetLeft * (resolutionWidth / viewPortWidth),
					playerTop = avRef.current.offsetTop * (resolutionHeight / viewPortHeight),
					playerWidth = avRef.current.offsetWidth * (resolutionWidth / viewPortWidth),
					playerHeight = avRef.current.offsetHeight * (resolutionHeight / viewPortHeight)
					// webapis.avplay.setDisplayRect(playerLeft, playerTop, playerWidth, playerHeight);
				},
				function errorHandler() {
					resolutionWidth = window.innerWidth;
					resolutionHeight = window.innerHeight;
					playerLeft = avRef.current.offsetLeft * (resolutionWidth / viewPortWidth),
					playerTop = avRef.current.offsetTop * (resolutionHeight / viewPortHeight),
					playerWidth = avRef.current.offsetWidth * (resolutionWidth / viewPortWidth),
					playerHeight = avRef.current.offsetHeight * (resolutionHeight / viewPortHeight)
					// webapis.avplay.setDisplayRect(playerLeft, playerTop, playerWidth, playerHeight);
				}
			);

	
			//Append the object element to your document
			// avRef.current?.appendChild(objElem);
		}

		// webapis.avplay.open('https://0.dl.wsfiles.cz/8238/SMiX3zJ3ic/524288000/eJw1js1qw0AMhN9Fh5wW2_u_XgghhFJIqHtoSnMwhI0tk4U2NmvHBZe+e9VCLxrpYzTSFwTwwAuRuTKTKlMCGETwBYMJPDel1do5bRjMNDK4Uy2F4or68Y8M4Kd0RwY3Ctpfj2mLu_nxQR9vw0BZLdGLtaEVDTcN50a50irVCVKptLbGdDxgEUJnf+10FebYYn8ep4Thg1gi9ImX8RoSZs1S5118xzp_eYonuexlbOp8gyn1af1aHarnt2rVr2ltSv+fjQt4J6UrnNH6+weWx0LQ/528ffc2a2a60d948f93aa4624dd8c7561759da33/JhTrAeCvGE5Tnpp.mp4');
        if (mediaUrl) {
            webapis.avplay.open(mediaUrl);
			playerLeft = avRef.current.offsetLeft * (resolutionWidth / viewPortWidth),
			playerTop = avRef.current.offsetTop * (resolutionHeight / viewPortHeight),
			playerWidth = 1920,
			playerHeight = 1080
			webapis.avplay.setDisplayRect(playerLeft, playerTop, playerWidth, playerHeight);
			// webapis.avplay.setDisplayMethod('PLAYER_DISPLAY_MODE_AUTO_ASPECT_RATIO');
        }
		
		
		var listener = {
			onbufferingstart: function() {
				console.log("Buffering start.");
			},

			onbufferingprogress: function(percent) {
				console.log("Buffering progress data : " + percent);
			},

			onbufferingcomplete: function() {
				console.log("Buffering complete.");
			},
			onstreamcompleted: function() {
				console.log("Stream Completed");
				webapis.avplay.stop();
			},

			oncurrentplaytime: function(currentTime) {
				console.log("Current playtime: " + currentTime);
			},

			onerror: function(eventType) {
				console.log("event type error : " + eventType);
			},

			onevent: function(eventType, eventData) {
				console.log("event type: " + eventType + ", data: " + eventData);
			},

			onsubtitlechange: function(duration, text, data3, data4) {
				console.log("subtitleText: " + text);
			},
			ondrmevent: function(drmEvent, drmData) {
				console.log("DRM callback: " + drmEvent + ", data: " + drmData);
			}
		};

		webapis.avplay.setListener(listener);

		var successCallback = function() {
			console.log('The media has finished preparing');
			webapis.avplay.play(); 
		}

		var errorCallback = function() {
			console.log('The media has failed to prepare');
		}
		
        if (mediaUrl) {
            webapis.avplay.prepareAsync(successCallback,errorCallback);
        } else {
			webapis.avplay.stop();
		}
    }, [mediaUrl])

    return (
        <section id="avplay" className={`avplay absolute top-0 opacity-0 invisible ${mediaUrl ? "!opacity-100 !visible z-[9999]" : ""}`} ref={avRef}>
			<object id="av-player" type="application/avplayer"></object>
        </section>
    )
})

export default AVPlay