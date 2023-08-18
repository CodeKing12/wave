import { getDisplayDetails } from "./MediaCard";
import { MediaObj } from "./MediaTypes";
import { Back, ArrowLeft2 } from "iconsax-react";


interface MediaModalProps {
    show: boolean;
    media: MediaObj,
    onExit: () => void;
}

export default function MediaModal({ show, media, onExit }: MediaModalProps) {
    const displayDetails = getDisplayDetails(media._source.i18n_info_labels)

    return (
        <div className={`fixed top-0 bottom-0 left-0 right-0 w-full h-full z-50 p-10 bg-black-1 opacity-100 visible ease-linear duration-300 ${show ? "" : "!opacity-0 !invisible"}`}>
            <button className="absolute top-0 right-0 bg-yellow-300 w-12 h-12 flex items-center justify-center" onClick={onExit}>
                <Back size={30} variant="Bold" className="text-black-1 stroke-2 fill-black" />
            </button>

            <img src={displayDetails.art.poster} className="w-[500px] h-full object-cover rounded-3xl" />
        </div>
    )
}