import Sidebar, { PageType } from '@/components/Sidebar'
import { SearchNormal1, ArrowLeft, ArrowRight, SearchNormal } from "iconsax-react"
import { MEDIA_ENDPOINT, PATH_ANIMATED_MOVIES, PATH_ANIMATED_SERIES, PATH_CONCERTS, PATH_FAIRY_TALES, PATH_MOVIES, PATH_MOVIES_CZSK, PATH_SEARCH_MEDIA, PATH_SERIES, PATH_SERIES_CZSK, TOKEN_PARAM_NAME, TOKEN_PARAM_VALUE } from '@/components/constants';
import { useEffect, useState, useRef, useCallback } from 'react';
import MediaList from '@/components/MediaList';
// import { BeatLoader, BounceLoader, ClipLoader, ClockLoader, ClimbingBoxLoader, FadeLoader, GridLoader, PuffLoader, PulseLoader, PropagateLoader, RingLoader, SquareLoader, SkewLoader, ScaleLoader, HashLoader, SyncLoader, RotateLoader } from 'react-spinners';
import { HashLoader } from 'react-spinners';
import { MediaObj } from '@/components/MediaTypes';
import Login from '@/components/Login';
import Alert, { AlertData, AlertInfo } from "@/components/Alert";
import { useFocusable, FocusContext } from "@noriginmedia/norigin-spatial-navigation";
import FocusLeaf from '@/components/FocusLeaf';
import MediaModal from '@/components/MediaModal';
import dummyMedia from "@/media.json";
import { useAlert } from "@/pages/AlertContext";
import axiosInstance from '@/utils/axiosInstance';


export function parseXml(data: string, param: string) {
  const xml = new DOMParser().parseFromString(data, "application/xml");
  const processed = xml.getElementsByTagName("response")[0];

  return processed.getElementsByTagName(param)[0]?.textContent || "";
}


interface ApiMapper {
  [key: string]: string
};

type PaginationType = {
  [page in PageType]: number;
};

interface MediaType {
  [page: string]: MediaObj[][] | undefined
};

interface NavProps {
  query: string;
  updateQuery: (value: string) => void;
  onSearch: () => void;
  showFavorites: () => void;
}

interface TokenObj {
  value: string,
  expiration: number
}

function Navbar({ query, updateQuery, onSearch, showFavorites }: NavProps) {
  const { ref, focusKey, focused, hasFocusedChild } = useFocusable()

  return (
    <FocusContext.Provider value={focusKey}>
      <nav className={`flex items-center justify-between ${focused ? "!duration-300 border-4 border-yellow-300" : ""}`} ref={ref}>
        <div className="flex gap-12 items-center text-white text-opacity-80 font-medium">
          <FocusLeaf focusedStyles="after:block animateUnderline">
            <a className="cursor-pointer" onClick={showFavorites}>Favorites</a>
          </FocusLeaf>
          <FocusLeaf focusedStyles="after:block animateUnderline">
            <a className="cursor-pointer">Watched</a>
          </FocusLeaf>
        </div>

        <FocusLeaf isForm className="text-[#AEAFB2]" focusedStyles="searchFocus" onEnterPress={onSearch}>
          <form className="relative group">
              <input className="w-[350px] h-14 px-14 py-3 text-white text-sm bg-gray-700 bg-opacity-10 rounded-xl border border-[rgba(249,249,249,0.10)] placeholder:text-gray-300 placeholder:text-sm outline-none" placeholder="Search Movies or TV Shows" onChange={(e) => updateQuery(e.target.value)} />
              <SearchNormal1 size={24} className="absolute top-1/2 -translate-y-1/2 left-4 icon ease-in-out duration-300" />
              <button className={`w-8 h-8 bg-yellow-300 rounded-lg absolute top-1/2 -translate-y-1/2 right-4 flex items-center justify-center opacity-0 invisible -group-hover:visible -group-hover:opacity-100 ease-in-out ${query ? "!visible !opacity-100" : ""}`} onClick={(e) => {e.preventDefault();onSearch()}}>
                <SearchNormal variant="Bold" color="#21201E" size={16} />
              </button>
          </form>
        </FocusLeaf>
      </nav>
    </FocusContext.Provider>
  )
}

export default function Home() {
  const defaultAlert: AlertData = {
    type: "success",
    title: "",
  }

  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [openLogin, setOpenLogin] = useState(false);
  const [authToken, setAuthToken] = useState("");
  const [media, setMedia] = useState<MediaType>({});
  const [page, setPage] = useState<PageType>("movies");
  const [totals, setTotals] = useState<PaginationType>({} as PaginationType);
  const [pagination, setPagination] = useState<PaginationType>({} as PaginationType);
  const [hideSidebar, setHideSidebar] = useState(false);
  const prevPagination = useRef(pagination);
  const [query, setQuery] = useState("");
  const [searchHistory, setSearchHistory] = useState<String[]>([]);
  const { ref, focusKey, hasFocusedChild, focusSelf } = useFocusable({trackChildren: true, forceFocus: true})
  const [selectedMedia, setSelectedMedia] = useState<MediaObj | undefined>();
  const [openModal, setOpenModal] = useState(false);

  useEffect(() => {
    if (!openLogin && !openModal) {
      console.log("Focused self after login modal close")
      focusSelf();
    } 
    if (isAuthenticated && !openModal) {
      console.log("Quit media modal")
      focusSelf();
    }
  }, [focusSelf, openLogin, isAuthenticated, openModal])

  const { addAlert } = useAlert();

  useEffect(() => {
    let storedAuth = localStorage.getItem('authToken');
    const storedToken: TokenObj = JSON.parse(storedAuth || "{}");
    const currentTime = new Date().getTime();

    if (storedToken.expiration && (currentTime < storedToken.expiration)) {
      setAuthToken(storedToken.value);
      setIsAuthenticated(true);
    } else {
      localStorage.removeItem("authToken");
    }
  }, []);
  
  const mediaPerPage = 100
  const fetched = []

  const api_map: ApiMapper = {
    movies: PATH_MOVIES,
    series: PATH_SERIES,
    concerts: PATH_CONCERTS,
    fairy_tales: PATH_FAIRY_TALES,
    animated_movies: PATH_ANIMATED_MOVIES,
    animated_series: PATH_ANIMATED_SERIES,
    movies_czsk: PATH_MOVIES_CZSK,
    series_czsk: PATH_SERIES_CZSK,
    search: PATH_SEARCH_MEDIA
  }

  function updatePagination(page: PageType, increment?: number) {
    const prevPageValue = pagination[page] || 0
    setPagination((prevPagination) => ({
      ...prevPagination,
      [page]: increment ? prevPageValue + increment : 0
    }))
  }
// Modify the media or search_page storage to store based on search terms 
  useEffect(() => {
    const isSearch = searchHistory[searchHistory.length - 1] === query
    if (!pagination.hasOwnProperty(page)) {
      updatePagination(page)
    }
    if (!media.hasOwnProperty(page) || pagination[page] > prevPagination.current[page] || isSearch) {
      if ((pagination[page] >= (media[page]?.length ?? 0) || isSearch)) {
        setLoading(true);
        if (page === "search" && pagination[page] <= 0) {
          media[page] = []
        }
        axiosInstance.get(MEDIA_ENDPOINT + api_map[page], {
          params: {
            [TOKEN_PARAM_NAME]: TOKEN_PARAM_VALUE,
            from: pagination[page] > 0 ? mediaPerPage * pagination[page] : undefined,
            value: page === "search" ? query.trim() : undefined
          }
        }).then(
          function (response) {
            setTotals((prevTotals) => ({
              ...prevTotals,
              [page]: response.data.hits.total.value
            }))
            // const currentPage = page === "search" && pagination[page] <= 0 ? [] : media[page] || [];
            const currentPage = media[page] || [];
            setMedia((prevMedia) => ({
              ...prevMedia,
              [page]: [...currentPage, response.data.hits.hits]
            }))
            // console.log([response.data.hits.hits])
            setLoading(false);
          }
        )
      }
    }
    prevPagination.current = pagination;
  }, [page, pagination, searchHistory]) /* eslint-disable-line react-hooks/exhaustive-deps */

  function searchMedia() {
    console.log(query, searchHistory[searchHistory.length - 1])
    if (query.length && query !== searchHistory[searchHistory.length - 1]) {
      setSearchHistory([...searchHistory, query]);
      updatePagination("search");

      if (page !== "search") {
        setPage("search");
      }
    } else if (!query.length) {
      setPage("movies")
    }
  }

  function logOutWebshare() {
    setAuthToken("");
    setIsAuthenticated(false);
    localStorage.removeItem("authToken");
    addAlert({
      type: "success",
      title: "Logout Successful"
    })
  }

  function onLogin(isSuccess: boolean, token: string) {
    setIsAuthenticated(isSuccess);
    setAuthToken(token);
    setOpenLogin(false);
    addAlert({
      type: "success",
      title: "Authentication Successful"
    })
  }

  const mainRef = useRef<HTMLElement | null>(null);

  const onCardFocus = useCallback(
      ({ y }: { y: number }) => {
        console.log("Heree")
          if (mainRef.current) {
            mainRef.current.scrollTo({
                top: y,
                behavior: 'smooth'
            });
          }
      }, [mainRef]
  );

  function onMediaModalClose() {
      setOpenModal(false);
  }

  function onMediaCardClick(mediaInfo: MediaObj) {
    setOpenModal(true);
    setSelectedMedia(mediaInfo);
  }

  return (
    <main className="bg-[#191919]">
      <Sidebar current={page} onChange={setPage} isHidden={hideSidebar} isLoggedIn={isAuthenticated} onHide={setHideSidebar} onLogout={logOutWebshare} />

      <FocusContext.Provider value={focusKey}>
        <section className={`flex-1 min-h-screen ml-[270px] flex flex-col pt-10 pb-16 px-20 font-poppins duration-500 ease-in-out h-screen overflow-auto ${hideSidebar ? "!ml-0" : ""}`} id="main-display" ref={mainRef}>
          <Navbar query={query} updateQuery={setQuery} onSearch={searchMedia} showFavorites={() => console.log("Clicked Faves")} />
          
          <div className={`relative flex-1 mt-6 ${hasFocusedChild ? 'menu-expanded' : 'menu-collapsed'}`} ref={ref}>
            {
              media[page] && media[page]?.[pagination[page]]?.length ? 
              <MediaList isAuthenticated={isAuthenticated} authToken={authToken} onMovieSelect={() => setOpenLogin(true)} page={page} media={media[page]?.[pagination[page]]} onCardFocus={onCardFocus} onMediaModalOpen={onMediaCardClick} />
              : <HashLoader size={70} speedMultiplier={1.2} color="#fde047" loading={true} className="!absolute top-[37%] left-1/2 -translate-x-1/2 -translate-y-1/2" />
            }
          </div>
          <div className={`flex items-center justify-between mt-10 ${loading ? "opacity-40 pointer-events-none" : "opacity-100 pointer-events-auto"}`}>
            <div className={pagination[page] + 1 === 1 ? "cursor-not-allowed" : ""}>
              <button className={`px-9 py-3 bg-yellow-300 text-black-1 rounded-xl text-lg font-semibold border-2 border-transparent hover:bg-black-1 hover:border-yellow-300 hover:text-yellow-300 flex items-center gap-4 ${pagination[page] + 1 === 1 ? "opacity-40 pointer-events-none" : ""}`} onClick={() => updatePagination(page, -1)}>
                  <ArrowLeft size={32} variant='Bold' />
                  Previous
              </button>
            </div>

            {
              typeof pagination[page] == "number" && pagination[page] >= 0 ?
              <p className="text-lg font-semibold text-gray-300">Page: <span className="text-yellow-300 ml-2">{ pagination[page] + 1 }</span> / { Math.ceil(totals[page] / mediaPerPage) }</p>
              : ""
            }

            <div className={pagination[page] + 1 === Math.ceil(totals[page] / mediaPerPage) ? "cursor-not-allowed" : ""}>
              <button className={`px-9 py-3 bg-yellow-300 text-black-1 rounded-xl text-lg font-semibold border-2 border-transparent hover:bg-black-1 hover:border-yellow-300 hover:text-yellow-300 flex items-center gap-4 ${pagination[page] + 1 === Math.ceil(totals[page] / mediaPerPage) ? "opacity-40 pointer-events-none" : ""}`} onClick={() => updatePagination(page, +1)}>
                  Next
                  <ArrowRight size={32} variant='Bold' />
              </button>
            </div>
          </div>
        </section>
      </FocusContext.Provider>

      <Login show={openLogin && !isAuthenticated} onLogin={onLogin} onClose={() => setOpenLogin(false)} />

      {/* <Transition> */}
          <MediaModal show={openModal && isAuthenticated} media={selectedMedia || dummyMedia} authToken={authToken} onExit={onMediaModalClose} />
      {/* </Transition> */}
    </main>
  )
}


export async function getStaticProps() {
  return {
    props: {
      products: []
    }
  }
}