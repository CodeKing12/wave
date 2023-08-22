import MediaCard from "./MediaCard";
import MediaModal from "./MediaModal";
import { MediaObj } from "./MediaTypes";
import { useState } from "react";
import DemoMedia from "@/media.json"

export default function MediaList({ media, isAuthenticated, authToken, onMovieSelect }: any) {
    console.log(media)
    const [selectedMedia, setSelectedMedia] = useState<MediaObj>(DemoMedia);
    const [openModal, setOpenModal] = useState(false);

    function displayMediaInfo(mediaInfo: MediaObj) {
        setSelectedMedia(mediaInfo)
        setOpenModal(true);
    }

    return (
        <>
            <div className={`flex flex-wrap gap-4 ${openModal ? "hidden" : ""}`}>
                {
                    media.length ? media.map((show: MediaObj, index: number) => (
                        <MediaCard key={index} media={show?._source} showMediaInfo={() => isAuthenticated ? displayMediaInfo(show) : onMovieSelect(true)} />
                    )) : "Nothing"
                }
            </div>

            { openModal && <MediaModal show={openModal && isAuthenticated} media={selectedMedia} authToken={authToken} onExit={() => setOpenModal(false)} /> }
        </>
    )
} 