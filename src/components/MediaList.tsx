import MediaCard from "./MediaCard";
import MediaModal from "./MediaModal";
import { MediaObj } from "./MediaTypes";
import { useState, useCallback } from "react";
import Transition from "./Transition";
import { useFocusable, FocusContext } from "@noriginmedia/norigin-spatial-navigation";

export default function MediaList({ media, isAuthenticated, authToken, onMovieSelect, onCardFocus, onMediaModalOpen, isModalOpen }: any) {
    // const { ref, focusKey, hasFocusedChild } = useFocusable()

    function displayMediaInfo(mediaInfo: MediaObj) {
        // setSelectedMedia(mediaInfo);
        onMediaModalOpen(mediaInfo);
    }

    function onCardSelect(mediaInfo: MediaObj) {
        isAuthenticated ? displayMediaInfo(mediaInfo) : onMovieSelect(true)
    }

    const onCardPress = useCallback((mediaInfo: MediaObj) => {
        onCardSelect(mediaInfo);
    }, []);


    return (
        <>
            {/* <FocusContext.Provider value={focusKey}> */}
                {/* <div className={`${hasFocusedChild ? 'menu-expanded' : 'menu-collapsed'}`} ref={ref}> */}
                <div>
                    <div className={`flex justify-center flex-wrap gap-4 ${isModalOpen ? "!overflow-hidden" : ""}`}>
                        {
                            media.length ? media.map((show: MediaObj, index: number) => (
                                <MediaCard key={index} media={show?._source} showMediaInfo={() => onCardSelect(show)} onEnterPress={() => onCardPress(show)} onFocus={onCardFocus} />
                            )) : "Nothing"
                        }
                    </div>
                </div>
            {/* </FocusContext.Provider> */}

            {/* { 
                openModal ? 
                <Transition>
                    <MediaModal show={openModal && isAuthenticated} media={selectedMedia} authToken={authToken} onExit={() => setOpenModal(false)} />
                </Transition>
                : ""
            } */}
        </>
    )
} 