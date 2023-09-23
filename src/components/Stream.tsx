import { bytesToSize, secondsToHMS } from "@/utils/general";
import { Barcode, Clock, Document, MessageText1, PlayCircle, Size, VolumeHigh } from "iconsax-react";
import { StreamObj } from "./MediaTypes";
import { FocusDetails, useFocusable } from "@noriginmedia/norigin-spatial-navigation";

export default function MediaStreamOption({ stream, isEpisode, onFocus, onStreamClick }: { stream: StreamObj, isEpisode?: boolean, onFocus?: (focusDetails: FocusDetails) => void, onStreamClick: () => void }) {
    const { ref, focused } = useFocusable({
        onEnterPress: onStreamClick,
        onFocus
    });

    return (
        <div className={`flex items-center justify-between ${isEpisode ? "gap-10" : "gap-20"}`} ref={ref}>
            <div className={`flex gap-8 text-[15px] text-gray-300 text-opacity-50 ${focused ? "stream-focus" : ""}`}>
                {
                    stream.video.length ?
                    <div className="duration flex flex-col gap-1.5 items-center">
                        <Clock size={22} variant="Bold" className="icon-stream" />
                        <p>
                            {
                                secondsToHMS(stream.video[0].duration)
                            }
                        </p>
                    </div> : ""
                }
                {
                    !isEpisode ? (
                        <div className="size flex flex-col gap-1.5 items-center">
                            <Document size={22} variant="Bold" className="icon-stream" />
                            <p>
                                {
                                    bytesToSize(stream.size)
                                }
                            </p>
                        </div>
                    ) : ""
                }
                {
                    stream.audio.length ?
                    <div className="audio flex flex-col gap-1.5 items-center">
                        <VolumeHigh size={22} variant="Bold" className="icon-stream" />
                        <p>
                            {
                                stream.audio.map(audio => audio?.language?.toUpperCase() || "").join("/")
                            }
                        </p>
                    </div> : ""
                }
                {
                    stream.subtitles.length ?
                    <div className="subtitles flex flex-col gap-1.5 items-center">
                        <MessageText1 size={22} variant="Bold" className="icon-stream" />
                        <p>
                            {
                                stream.subtitles.map(subtitle => subtitle?.language?.toUpperCase()).join("/")
                            }
                        </p>
                    </div> : ""
                }
                {
                    stream.video.length ?
                    <div className="resolution flex flex-col gap-1.5 items-center">
                        <Size size={22} variant="Bold" className="icon-stream" />
                        <p>
                            {
                                stream.video.map(video => video.width + "×" + video.height).join(",")
                            }
                        </p>
                    </div> : ""
                }
                {
                    stream.video.length && stream.audio.length && !isEpisode ?
                    <div className="codec flex flex-col gap-1.5 items-center">
                        <Barcode size={22} variant="Bold" className="icon-stream" />
                        <p>
                            {
                                stream.video[0].codec + "+" + stream.audio[0].codec
                            }
                        </p>
                    </div> : ""
                }
            </div>

            {
                isEpisode ? 
                    <button onClick={() => {onStreamClick();}}>
                        <PlayCircle size={40} variant="Bold" className={`text-yellow-300 duration-300 ease-in-out ${focused ? "!text-white" : ""}`} />
                    </button>
                : (
                    <button className={`h-16 w-12 bg-yellow-300 text-black-1 rounded-md text-base tracking-wide font-bold border-2 border-transparent hover:bg-black-1 hover:border-yellow-300 hover:text-yellow-300 flex justify-center items-center gap-4 ${focused ? "!bg-black-1 !border-yellow-300 !text-yellow-300" : ""}`} onClick={() => onStreamClick()}>
                        <PlayCircle size={28} variant="Bold" />
                    </button>
                )
            }
        </div>
    )
}