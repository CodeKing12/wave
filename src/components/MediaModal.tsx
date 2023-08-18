import { getDisplayDetails, getRatingAggr } from "./MediaCard";
import { MediaObj } from "./MediaTypes";
import { Back, Star1, HeartAdd, Play, PlayCircle } from "iconsax-react";

interface MediaModalProps {
    show: boolean;
    media: MediaObj,
    onExit: () => void;
}

function convertSecondsToTime(seconds: number) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    const hoursString = hours > 0 ? `${hours}hr` : '';
    const minutesString = minutes > 0 ? `${minutes}min` : '';

    if (hoursString && minutesString) {
        return `${hoursString} ${minutesString}`;
    } else {
        return hoursString || minutesString || '0min';
    }
}

function formatDate(dateString: string) {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', options);
}

export default function MediaModal({ show, media, onExit }: MediaModalProps) {
    const displayDetails = getDisplayDetails(media._source.i18n_info_labels)
    const movieDetails = media._source;
    let { rating, voteCount } = getRatingAggr(movieDetails.ratings);
    // rating = ; // To get the rating as a fraction of 10. (Multiplying by 2 undoes the dividing by 2 in the getRatingAggr function)

    return (
        <div className={`fixed top-0 bottom-0 left-0 right-0 w-full h-full z-50 p-10 bg-black-1 ease-linear duration-300 opacity-0 invisible ${show ? "!opacity-100 !visible" : ""}`}>
            <button className="absolute top-0 right-0 bg-yellow-300 text-black-1 w-14 h-14 flex items-center justify-center hover:bg-black-1 hover:text-yellow-300 border-[3px] border-yellow-300" onClick={onExit}>
                <Back size={30} variant="Bold" />
            </button>

            <div className="flex justify-center gap-20 h-full">
                <img src={displayDetails.art.poster} className="w-[500px] h-full object-cover rounded-[30px]" />

                <div className="py-10 text-gray-300 max-w-[620px] overflow-y-scroll hide-scrollbar">
                    <h2 className="font-semibold text-white opacity-90 text-4xl mb-6">{ displayDetails?.title || movieDetails.info_labels?.originaltitle }</h2>
                    <p className="max-w-[600px] leading-loose mb-8">
                        {
                            displayDetails?.plot
                        }
                    </p>
                    <div className="grid grid-cols-2 gap-7 text-[17px] mb-8">
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
                        <p className="flex flex-col gap-2">
                            <span className="text-[15px] opacity-40">Run Time: </span>
                            <span className="">{ convertSecondsToTime(movieDetails.info_labels.duration) }</span>
                        </p>
                        <p className="flex flex-col gap-2">
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
                        </p>
                    </div>
                    {
                        movieDetails.cast.length ? (
                            <p className="flex flex-col gap-2">
                                <span className="text-[15px] opacity-40">Cast: </span>
                                <span className="leading-loose opacity-90">{ movieDetails.cast.map(actor => actor.name).join(", ") }</span>
                            </p>
                        ) : ""
                    }

                    <div className="flex gap-10 mt-10">
                        <button className="px-10 py-3 bg-white text-black-1 rounded-xl text-[15px] tracking-wide font-bold border-2 border-transparent hover:bg-opacity-5 hover:border-white hover:text-white flex items-center gap-4">
                            <HeartAdd size={32} variant="Bold" />
                            Add to Favorites
                        </button>

                        <button className="px-10 py-3 bg-yellow-300 text-black-1 rounded-xl text-base tracking-wide font-bold border-2 border-transparent hover:bg-black-1 hover:border-yellow-300 hover:text-yellow-300 flex items-center gap-4">
                            <PlayCircle size={32} variant="Bold" />
                            Watch
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}