import { memo } from "react";
import { useFocusable, FocusContext } from "@noriginmedia/norigin-spatial-navigation";
import { Video, VideoVertical, MusicCircle, MagicStar, VideoOctagon, Magicpen, UserTag, Slider, ArrowLeft2, ArrowRight2, SidebarLeft, SidebarRight, Logout } from "iconsax-react"
import { ReactNode, useEffect } from "react"
import FocusLeaf from "./FocusLeaf";


export type PageType = "" | "movies" | "series" | "concerts" | "fairy_tales" | "animated_movies" | "animated_series" | "movies_czsk" | "series_czsk" | "search";

interface SidebarItemProps { 
    icon: ReactNode,
    text: string,
    page: PageType,
    // Remove the props below in the future and find a better way to do this without passing it into the component individually
    current: PageType,
    onItemClick: (page: PageType) => void
}

interface SidebarProps {
    current: PageType,
    isHidden: boolean,
    isLoggedIn: boolean;
    finishedLoading: boolean;
    onHide: (isHidden: boolean) => void,
    onChange: (newVal: PageType) => void,
    onLoginClick: () => void,
    onLogout: () => void,
}

const NavItem = memo(function NavItem({ icon, text, page, current, onItemClick }: SidebarItemProps) {
    // console.log("Nav Item is re-rendering")
    const { ref, focused } = useFocusable({onEnterPress: () => onItemClick(page)});

    return (
        <a 
            ref={ref}
            className={`flex gap-5 items-center text-base active:font-semibold cursor-pointer py-2 px-8 w-full border-r-2 border-yellow-300 border-opacity-0 hover:border-opacity-100 hover:text-yellow-300 hover:fill-yellow-300 opacity-80 ${page === current ? "text-yellow-300 fill-yellow-300 opacity-100 border-r-4 border-opacity-100" : ""} ${focused ? "!border-x-4 !border-yellow-300 [&>svg]:!text-yellow-300" : ""}`} 
            onClick={() => onItemClick(page)}
        >
            {icon}
            <span>{ text }</span>
        </a>
    )
})

const Sidebar = memo(function Sidebar({ current, finishedLoading, isHidden, isLoggedIn, onHide, onChange, onLogout, onLoginClick }: SidebarProps) {
    // console.log("Sidebar is re-rendering")
    const {
        ref,
        focusSelf,
        hasFocusedChild,
        focusKey
        // setFocus, -- to set focus manually to some focusKey
        // navigateByDirection, -- to manually navigate by direction
        // pause, -- to pause all navigation events
        // resume, -- to resume all navigation events
        // updateAllLayouts, -- to force update all layouts when needed
        // getCurrentFocusKey -- to get the current focus key
    } = useFocusable({
        focusable: !isHidden,
        autoRestoreFocus: true,
        onArrowPress: () => true,
    });

    useEffect(() => {
        focusSelf();
    }, [focusSelf]);

    return (
        // <FocusContext.Provider value={focusKey}>
            <aside id="sidenav" className={`sidenav z-[100] w-[300px] bg-black-1 h-full min-h-screen fixed top-0 bottom-0 left-0 pt-20 pb-6 duration-500 ease-in-out ${isHidden ? "!-left-[300px]" : ""} ${finishedLoading ? "" : "is-loading"}`}>
                <FocusLeaf className={`absolute top-0 right-0 opacity-60 hover:opacity-100 duration-300 ease-in-out ${isHidden ? "!-right-10 opacity-80" : ""}`} focusedStyles="!opacity-100" onEnterPress={() => onHide(!isHidden)}>
                    {/* The right-[260px] is gotten by subtracting the width of the button from the width of the sidebar */}
                    <button className="bg-yellow-300 w-10 h-10 flex justify-center items-center outline-none" onClick={() => onHide(!isHidden)}>
                        {
                            isHidden ?
                            <SidebarRight size={28} variant="Bulk" />
                            : <SidebarLeft size={28} variant="Bulk" />
                        }
                    </button>
                </FocusLeaf>
                <div className={`duration-500 ease-in-out ${isHidden ? "opacity-0" : ""}`}>
                    <p className="font-semibold text-[rgba(249,249,249,0.67)] text-opacity-[67] mb-5 px-8 text-[15px]">Categories</p>
                    <FocusContext.Provider value={focusKey}>
                        <div className="text-white fill-white flex flex-col gap-5" ref={ref}>
                            <NavItem icon={<Video size={30} variant="Linear" />} text="Movies" page="movies" current={current} onItemClick={onChange} />
                            <NavItem icon={<VideoVertical size={30} variant="Linear" />} text="Series" page="series" current={current} onItemClick={onChange} />
                            <NavItem icon={<MusicCircle size={30} variant="Linear" />} text="Concerts" page="concerts" current={current} onItemClick={onChange} />
                            <NavItem icon={<MagicStar size={30} variant="Linear" />} text="Fairy Tales" page="fairy_tales" current={current} onItemClick={onChange} />
                            <NavItem icon={<VideoOctagon size={30} variant="Linear" />} text="Animated Movies" page="animated_movies" current={current} onItemClick={onChange} />
                            <NavItem icon={<Magicpen size={30} variant="Linear" />} text="Animated Series" page="animated_series" current={current} onItemClick={onChange} />
                            <NavItem icon={<UserTag size={30} variant="Linear" />} text="Movies CZ/SK" page="movies_czsk" current={current} onItemClick={onChange} />
                            <NavItem icon={<Slider size={30} variant="Linear" />} text="Series CZ/SK" page="series_czsk" current={current} onItemClick={onChange} />
                        </div>
                    </FocusContext.Provider>
                </div>
                {
                    isLoggedIn ? (
                        <FocusLeaf className="absolute bottom-[18px] logout-btn" focusedStyles="logout-btn-onfocus" onEnterPress={onLogout}>
                            <button className="mt-auto text-opacity-70 text-white font-medium flex items-center gap-3 py-2 px-8 text-[17px] hover:text-yellow-300 group duration-500 ease-in-out" onClick={onLogout}>
                                Logout
                                <Logout className="text-yellow-300 group-hover:text-white duration-500 ease-in-out" />
                            </button>
                        </FocusLeaf>
                    ) : (
                        <FocusLeaf className="absolute bottom-[18px] login-btn" focusedStyles="login-btn-onfocus" onEnterPress={onLoginClick}>
                            <button className="py-2.5 px-8 bg-yellow-300 bg-opacity-90 hover:bg-transparent text-black-1 mt-auto font-semibold flex items-center gap-3 hover:text-yellow-300 group border-2 border-l-0 border-yellow-300 duration-500 ease-in-out" onClick={onLoginClick}>
                                Login
                                <Logout className="text-black group-hover:text-yellow-300 duration-500 ease-in-out" variant="Bold" />
                            </button>
                        </FocusLeaf>
                    )
                }
            </aside>
        // </FocusContext.Provider>
    )
})

export default Sidebar