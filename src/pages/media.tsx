import { MediaObj } from "../components/MediaTypes";


interface MediaInfoProps {
    show: boolean;
    media: MediaObj
}

export default function MediaModal({ show, media }: MediaInfoProps) {
    return (
        <div className={`fixed top-0 bottom-0 left-0 right-0 w-full h-full z-50 bg-black-1 opacity-100 visible ease-linear duration-500 ${show ? "" : "!opacity-0 !invisible"}`}></div>
    )
}