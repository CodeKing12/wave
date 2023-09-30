import MediaCard from "./MediaCard";
import MediaModal from "./MediaModal";
import { MediaObj } from "./MediaTypes";
import { useState, useCallback } from "react";
import Transition from "./Transition";
import { useFocusable, FocusContext } from "@noriginmedia/norigin-spatial-navigation";

export default function MediaList({ media, isAuthenticated, authToken, onMovieSelect, onCardFocus, onMediaModalOpen, isModalOpen, isSidebarOpen }: any) {
    // const { ref, focusKey, hasFocusedChild } = useFocusable()

    const displayMediaInfo = useCallback(
        (mediaInfo: MediaObj) => {
            // setSelectedMedia(mediaInfo);
            onMediaModalOpen(mediaInfo);
        }, [onMediaModalOpen]
    )

    const onCardSelect = useCallback(
        (mediaInfo: MediaObj) => {
            isAuthenticated ? displayMediaInfo(mediaInfo) : onMovieSelect(true)
        }, [displayMediaInfo, isAuthenticated, onMovieSelect]
    )

    const onCardPress = useCallback((mediaInfo: MediaObj) => {
        // console.log("Card Pressed")
        onCardSelect(mediaInfo);
    }, [onCardSelect]);


    return (
        <>
            {/* <FocusContext.Provider value={focusKey}> */}
                {/* <div className={`${hasFocusedChild ? 'menu-expanded' : 'menu-collapsed'}`} ref={ref}> */}
                <div>
                    {/* <div className={`flex justify-center flex-wrap gap-4 ${isModalOpen ? "!overflow-hidden" : ""}`}> */}
                    <div id="media-list" className={`grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 justify-center flex-wrap gap-y-4 gap-x-1 md:gap-x-2 ${isModalOpen ? "!overflow-hidden" : ""} ${isSidebarOpen ? "lg:!grid-cols-4 xl:!grid-cols-5 2xl:!grid-cols-6" : "listIsHidden"}`}>
                    {/* grid-cols-1 sm:grid-cols-2 */}
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