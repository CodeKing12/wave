import { Heart, Star1, Image as ImageIcon } from "iconsax-react";
import { I18nInfoLabel, RatingObj } from "./MediaTypes";
import { useFocusable } from "@noriginmedia/norigin-spatial-navigation";


export function getDisplayDetails(mediaI18n: I18nInfoLabel[]) {
    let selectedDetails;

    selectedDetails = mediaI18n?.find((obj: I18nInfoLabel) => obj.lang === "en")
    if (!selectedDetails || !selectedDetails.hasOwnProperty("art") || !selectedDetails.art.hasOwnProperty("poster") || !selectedDetails.title) {
        let selectedObject = null;

        for (const info of mediaI18n) {
            if (info.art && info.art.poster && info.title) {
                selectedObject = info;
                break; // Exit the loop once a poster is found
            }
        }
        
        // If no object with a poster is found, select the first object
        if (!selectedObject) {
            selectedObject = mediaI18n[0];
        }

        selectedDetails = selectedObject;
    }

    if (selectedDetails?.art?.poster && selectedDetails?.art?.poster.startsWith("//")) {
        selectedDetails.art.poster = "https:" + selectedDetails?.art?.poster
    }

    return selectedDetails;
}

export function getRatingAggr(ratings: RatingObj) {
    let aggrRating: number = 0
    let voteCount: number = 0;

    if (Object.keys(ratings).length) {
        for (const source in ratings) {
            const ratingData = ratings[source];
            aggrRating += ratingData.rating;
            voteCount += ratingData.votes;
        }
        
        aggrRating = (aggrRating / Object.keys(ratings).length) / 2
    }
    
    return { rating: aggrRating, voteCount };
}

export default function MediaCard({ media, showMediaInfo, onEnterPress, onFocus }: any) {
    let genres: string;
    let { rating, voteCount } = getRatingAggr(media?.ratings);
    const premiere_date = new Date(media.info_labels?.premiered);
    const displayDetails = getDisplayDetails(media.i18n_info_labels);
    const { ref, focused } = useFocusable({
        onEnterPress,
        onFocus
    });

    // if (!displayDetails) {
    //     if (media && media.i18n_info_labels) {
    //         displayDetails = media.i18n_info_labels[media.i18n_info_labels?.length - 1]
    //     }
    // }

    if (media?.info_labels?.genre.length > 1) {
        genres = media?.info_labels.genre[0] + "/" + media.info_labels.genre[1]
    } else {
        genres = media?.info_labels?.genre[0]
    }

    return (
      <div className={`w-[240px] h-[330px] rounded-xl bg-black-1 backdrop-blur-2xl bg-opacity-60 cursor-pointer group relative overflow-clip duration-[400ms] ease-in-out border-4 border-transparent ${focused ? "!duration-300 border-yellow-300" : ""}`} ref={ref}>
        {
            /* eslint-disable @next/next/no-img-element */
            displayDetails?.art?.poster ?
            <img width={240} height={330} className="w-full h-[330px] object-cover rounded-xl opacity-75" src={displayDetails?.art.poster} alt={displayDetails?.plot} />
            : <ImageIcon size={85} className="text-yellow-300 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 fill-transparent group-hover:-fill-yellow-300 transition-all ease-linear duration-500" variant="Broken" />
            /* eslint-enable @next/next/no-img-element */
        }
        <div className={`w-full h-full absolute bottom-0 py-5 px-3 text-gray-100 bg-black bg-opacity-80 rounded-[11px] opacity-0 group-hover:opacity-100 invisible group-hover:visible ease-in-out duration-[400ms] ${focused ? "!duration-300 !visible !opacity-100" : ""}`} onClick={() => showMediaInfo(true)}>
            <div className="flex flex-col justify-between h-full">
                <div>
                    <h5 className="text-[17px] font-medium mb-1 group-hover:text-yellow-300 duration-300 ease-linear">{ displayDetails?.title || media.info_labels?.originaltitle }</h5>
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-400">{genres}</p>
                        <p className="text-sm text-gray-400 text-opacity-80">{premiere_date.getFullYear() || ""}</p>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                        <div className="flex gap-0.5">
                            {
                                Array(Math.round(rating)).fill("").map((value, index) => {
                                    return (
                                        <Star1 className="fill-yellow-300 text-yellow-300" key={index} size={18} />
                                    )
                                })
                            }
                            {
                                Array(5 - Math.round(rating)).fill("").map((value, index) => {
                                    return (
                                        <Star1 className="fill-gray-300 text-gray-300 opacity-90" key={index} size={18} />
                                    )
                                })
                            }
                        </div>
                        <p className="text-sm text-gray-300 text-opacity-70 font-medium leading-normal">({ voteCount })</p>
                    </div>
                </div>
                <div className="flex items-center justify-between">
                    <button className="p-3 flex items-center gap-4 bg-[rgba(249,249,249,0.20)] backdrop-blur-[5px] rounded-2xl text-[#F9F9F9] text-lg tracking-wide font-bold border-none !outline-none hover:bg-[#F9F9F9] hover:text-black-1 group">
                        <Heart width={20} className="group-hover:-fill-black-1" />
                    </button>

                    <button className="px-10 py-3 bg-yellow-300 text-black-1 rounded-xl text-sm tracking-wide font-semibold border-2 border-transparent hover:bg-black-1 hover:border-yellow-300 hover:text-yellow-300">
                        Watch
                    </button>
                </div>
            </div>
        </div>
      </div>
    )
  }