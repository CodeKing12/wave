import { convertSecondsToTime, formatDate } from "@/utils/general";
import { MediaSource, I18nInfoLabel } from "./MediaTypes";
import FocusLeaf from "./FocusLeaf";
import { Star1 } from "iconsax-react";
import { FocusContext, useFocusable } from "@noriginmedia/norigin-spatial-navigation";

export interface MediaDetailsProps {
    movieTitle: string,
    displayDetails: I18nInfoLabel,
    movieDetails: MediaSource,
    rating: number,
    voteCount: number,
    onFocus: ({ y }: {y: number}) => void;
}

export default function MediaDetails({ movieTitle, displayDetails, movieDetails, rating, voteCount, onFocus }: MediaDetailsProps) {
    const {
        ref,
        focusSelf,
        hasFocusedChild,
        focusKey,
    } = useFocusable({
        autoRestoreFocus: true,
        // onFocus
    });


    return (
        <FocusContext.Provider value={focusKey}>
            <div className="media-details xl:max-w-[780px] mr-8" ref={ref}>
            {/* xl:max-w-[620px] */}
                <FocusLeaf className="content" focusedStyles="on-focus" onFocus={onFocus}>
                    <h2 className="font-semibold text-white opacity-90 text-4xl mb-6">{ movieTitle }</h2>
                </FocusLeaf>

                {
                    displayDetails?.plot ? (
                        <FocusLeaf className="content" focusedStyles="on-focus" onFocus={onFocus}>
                            <p className="xl:max-w-[750px] leading-loose mb-8">
                            {/* xl:max-w-[600px] */}
                                {
                                    displayDetails?.plot
                                }
                            </p>
                        </FocusLeaf>
                    ) : ""
                }

                <FocusLeaf className="content" focusedStyles="on-focus" onFocus={onFocus}>
                    <div className="grid md:grid-cols-2 gap-7 text-[17px] mb-8">
                        <p className="flex flex-col gap-2">
                            <span className="text-[15px] opacity-40">Release Date: </span>
                            <span className="">{ formatDate(movieDetails.info_labels?.premiered) || "" }</span>
                        </p>
                        <p className="flex flex-col gap-2">
                            <span className="text-[15px] opacity-40">Genre(s): </span>
                            <span className="">{ movieDetails.info_labels.genre.join(", ") }</span>
                        </p>
                        {
                            movieDetails.info_labels.director.length ? (
                                <p className="flex flex-col gap-2">
                                    <span className="text-[15px] opacity-40">{ movieDetails.info_labels.director.length > 1 ? "Directors:" : "Director:" } </span>
                                    <span className="">{ movieDetails.info_labels.director.join(", ") }</span>
                                </p>
                            ) : ""
                        }
                        {
                            movieDetails.info_labels.studio.length ? (
                                <p className="flex flex-col gap-2">
                                    <span className="text-[15px] opacity-40">{ movieDetails.info_labels.studio.length > 1 ? "Studios:" : "Studio:" } </span>
                                    <span className="">{ movieDetails.info_labels.studio.join(", ") }</span>
                                </p>
                            ) : ""
                        }
                    </div>
                </FocusLeaf>

                <FocusLeaf className="content" focusedStyles="on-focus" onFocus={onFocus}>
                    <div className="grid md:grid-cols-2 gap-7 text-[17px] mb-8">
                        <p className="flex flex-col gap-2">
                            <span className="text-[15px] opacity-40">Run Time: </span>
                            <span className="">{ convertSecondsToTime(movieDetails.info_labels.duration) }</span>
                        </p>
                        <div className="flex flex-col gap-2">
                            <span className="text-[15px] opacity-40">Rating: </span>
                            <div className="flex items-center gap-2">
                                <span className="">{ (rating * 2) % 1 === 0 ? (rating * 2).toString() : (rating * 2).toFixed(1) }/10</span>
                                <div className="flex items-center gap-0.5">
                                    {
                                        Array(Math.round(rating)).fill("").map((value, index) => {
                                            return (
                                                <Star1 className="fill-yellow-300 text-yellow-300" key={index} size={16} />
                                            )
                                        })
                                    }
                                    {
                                        Array(5 - Math.round(rating)).fill("").map((value, index) => {
                                            return (
                                                <Star1 className="fill-gray-300 text-gray-300 opacity-90" key={index} size={16} />
                                            )
                                        })
                                    }
                                </div>
                                <p className="text-[15px] text-gray-300 text-opacity-70 font-medium leading-normal ml-3">({ voteCount })</p>
                            </div>
                        </div>
                    </div>
                </FocusLeaf>
                {
                    movieDetails.cast.length ? (
                        <FocusLeaf className="content" focusedStyles="on-focus" onFocus={onFocus}>
                            <p className="flex flex-col gap-2">
                                <span className="text-[15px] opacity-40">Cast: </span>
                                <span className="leading-loose opacity-90">{ movieDetails.cast.map(actor => actor.name).join(", ") }</span>
                            </p>
                        </FocusLeaf>
                    ) : ""
                }
            </div>
        </FocusContext.Provider>
    )
}