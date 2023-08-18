import { Video, VideoVertical, MusicCircle, MagicStar, VideoOctagon, Magicpen, UserTag, Slider } from "iconsax-react"
import { Icon } from "next/dist/lib/metadata/types/metadata-types"
import { ReactNode } from "react"


export type PageType = "" | "movies" | "series" | "concerts" | "fairy_tales" | "animated_movies" | "animated_series" | "movies_czsk" | "series_czsk";

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
    onChange: (newVal: PageType) => void
}

function NavItem({ icon, text, page, current, onItemClick }: SidebarItemProps) {
    return (
        <a 
            className={`flex gap-5 items-center text-base active:font-semibold cursor-pointer py-2 px-8 w-full border-r-2 border-yellow-300 border-opacity-0 hover:border-opacity-100 hover:text-yellow-300 hover:fill-yellow-300 opacity-80 ${page === current ? "text-yellow-300 fill-yellow-300 opacity-100 border-r-4 border-opacity-100" : ""}`} 
            onClick={() => onItemClick(page)}
        >
            {icon}
            <span>{ text }</span>
        </a>
    )
}

export default function Sidebar({ current, onChange }: SidebarProps) {
    return (
        <aside className="w-[300px] bg-black-1 h-full min-h-screen fixed top-0 bottom-0 left-0 py-20">
            <p className="font-semibold text-[rgba(249,249,249,0.67)] text-opacity-[67] mb-5 px-8">Categories</p>
            <div className="text-white fill-white flex flex-col gap-5">
                <NavItem icon={<Video size={30} variant="Linear" />} text="Movies" page="movies" current={current} onItemClick={onChange} />
                <NavItem icon={<VideoVertical size={30} variant="Linear" />} text="Series" page="series" current={current} onItemClick={onChange} />
                <NavItem icon={<MusicCircle size={30} variant="Linear" />} text="Concerts" page="concerts" current={current} onItemClick={onChange} />
                <NavItem icon={<MagicStar size={30} variant="Linear" />} text="Fairy Tales" page="fairy_tales" current={current} onItemClick={onChange} />
                <NavItem icon={<VideoOctagon size={30} variant="Linear" />} text="Animated Movies" page="animated_movies" current={current} onItemClick={onChange} />
                <NavItem icon={<Magicpen size={30} variant="Linear" />} text="Animated Series" page="animated_series" current={current} onItemClick={onChange} />
                <NavItem icon={<UserTag size={30} variant="Linear" />} text="Movies CZ/SK" page="movies_czsk" current={current} onItemClick={onChange} />
                <NavItem icon={<Slider size={30} variant="Linear" />} text="Series CZ/SK" page="series_czsk" current={current} onItemClick={onChange} />
            </div>
        </aside>
    )
}