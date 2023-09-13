import MediaCard from "./MediaCard";
import MediaModal from "./MediaModal";
import { MediaObj } from "./MediaTypes";
import { useState, useCallback } from "react";
import Transition from "./Transition";
import { useFocusable, FocusContext } from "@noriginmedia/norigin-spatial-navigation";

export default function MediaList({ media, isAuthenticated, authToken, onMovieSelect, onCardFocus }: any) {
    // console.log(media)
    const [selectedMedia, setSelectedMedia] = useState<MediaObj>(media[0]);
    const [openModal, setOpenModal] = useState(false);
    // const { ref, focusKey, hasFocusedChild } = useFocusable()

    function displayMediaInfo(mediaInfo: MediaObj) {
        setSelectedMedia(mediaInfo)
        setOpenModal(true);
    }

    const onCardPress = useCallback((mediaInfo: MediaObj) => {
        displayMediaInfo(mediaInfo);
    }, []);

    return (
        <>
            {/* <FocusContext.Provider value={focusKey}> */}
                {/* <div className={`${hasFocusedChild ? 'menu-expanded' : 'menu-collapsed'}`} ref={ref}> */}
                <div>
                    <div className={`flex justify-center flex-wrap gap-4 ${openModal ? "!overflow-hidden" : ""}`}>
                        {
                            media.length ? media.map((show: MediaObj, index: number) => (
                                <MediaCard key={index} media={show?._source} showMediaInfo={() => isAuthenticated ? displayMediaInfo(show) : onMovieSelect(true)} onEnterPress={() =>onCardPress(show)} onFocus={onCardFocus} />
                            )) : "Nothing"
                        }
                    </div>
                </div>
            {/* </FocusContext.Provider> */}

            <Transition>
                <MediaModal show={openModal && isAuthenticated} media={selectedMedia} authToken={authToken} onExit={() => setOpenModal(false)} />
            </Transition>
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