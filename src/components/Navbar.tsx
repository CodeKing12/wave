import { memo } from "react";
import { useFocusable, FocusContext } from "@noriginmedia/norigin-spatial-navigation";
import FocusLeaf from "./FocusLeaf";
import { SearchNormal, SearchNormal1 } from "iconsax-react";

interface NavProps {
    query: string;
    updateQuery: (value: string) => void;
    onSearch: () => void;
    showFavorites: () => void;
}
 
const Navbar = memo(function Navbar({ query, updateQuery, onSearch, showFavorites }: NavProps) {
    // console.log("Navbar is re-rendering")
    const { ref, focusKey, focused, hasFocusedChild } = useFocusable()
  
    return (
      <FocusContext.Provider value={focusKey}>
        <nav className={`flex flex-col lg:flex-row gap-5 items-center justify-between ${focused ? "!duration-300 border-4 border-yellow-300" : ""}`} ref={ref}>
          <div className="flex gap-12 items-center text-white text-opacity-80 font-medium">
            <FocusLeaf focusedStyles="after:block animateUnderline">
              <a className="cursor-pointer" onClick={showFavorites}>Favorites</a>
            </FocusLeaf>
            <FocusLeaf focusedStyles="after:block animateUnderline">
              <a className="cursor-pointer">Watched</a>
            </FocusLeaf>
          </div>
  
          <FocusLeaf isForm className="w-full lg:w-fit text-[#AEAFB2]" focusedStyles="searchFocus" onEnterPress={onSearch}>
            <form className="relative group" onSubmit={(e) => {e.preventDefault();onSearch()}}>
                <input className="w-full lg:w-[350px] h-14 px-14 py-3 text-white text-sm bg-gray-700 bg-opacity-10 rounded-xl border border-[rgba(249,249,249,0.10)] placeholder:text-gray-300 placeholder:text-sm outline-none" placeholder="Search Movies or TV Shows" onChange={(e) => updateQuery(e.target.value)} />
                <SearchNormal1 size={24} className="absolute top-1/2 -translate-y-1/2 left-4 icon ease-in-out duration-300" />
                <button className={`w-8 h-8 bg-yellow-300 rounded-lg absolute top-1/2 -translate-y-1/2 right-4 flex items-center justify-center opacity-0 invisible -group-hover:visible -group-hover:opacity-100 ease-in-out ${query ? "!visible !opacity-100" : ""}`} onClick={(e) => {e.preventDefault();onSearch()}}>
                  <SearchNormal variant="Bold" color="#21201E" size={16} />
                </button>
            </form>
          </FocusLeaf>
        </nav>
      </FocusContext.Provider>
    )
})

export default Navbar