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
import { checkWebshareStatus, getUsername } from '@/utils/general';
import Navbar from '@/components/Navbar';


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

interface TokenObj {
  value: string,
  expiration: number
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
      // console.log("Focused self after login modal close")
      focusSelf();
    } 
    if (isAuthenticated && !openModal) {
      // console.log("Quit media modal")
      focusSelf();
    }
  }, [focusSelf, openLogin, isAuthenticated, openModal])

  const { addAlert } = useAlert();

  useEffect(() => {
    async function retrieveToken() {
      let storedAuth = localStorage.getItem('authToken');
      const storedToken: TokenObj = JSON.parse(storedAuth || "{}");
      const currentTime = new Date().getTime();
      const isValid = await checkWebshareStatus(storedToken.value)
  
      if (isValid && storedToken.expiration && (currentTime < storedToken.expiration)) {
        setAuthToken(storedToken.value);
        setIsAuthenticated(true);
      } else {
        localStorage.removeItem("authToken");
      }
    }
    retrieveToken();
    
    if (window.screen.height < 1200) {
      setHideSidebar(true)
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
        <section className={`flex-1 min-h-screen ml-[270px] flex flex-col pt-10 pb-16 px-5 xs:px-6 xsm:px-8 md:px-14 xl:px-16 xxl:px-20 font-poppins duration-500 ease-in-out h-screen overflow-auto ${hideSidebar ? "!ml-0" : ""}`} id="main-display" ref={mainRef}>
          <Navbar query={query} updateQuery={setQuery} onSearch={searchMedia} showFavorites={() => console.log("Clicked Favorites")} />
          
          <div className={`relative flex-1 mt-6 ${hasFocusedChild ? 'menu-expanded' : 'menu-collapsed'}`} ref={ref}>
            {
              media[page] && media[page]?.[pagination[page]]?.length ? 
              <MediaList isAuthenticated={isAuthenticated} authToken={authToken} onMovieSelect={() => setOpenLogin(true)} page={page} media={media[page]?.[pagination[page]]} onCardFocus={onCardFocus} onMediaModalOpen={onMediaCardClick} isSidebarOpen={hideSidebar} />
              : <HashLoader size={70} speedMultiplier={1.2} color="#fde047" loading={true} className="!absolute top-[37%] left-1/2 -translate-x-1/2 -translate-y-1/2" />
            }
          </div>
          <div className={`flex flex-col gap-7 sm:gap-0 sm:flex-row items-center sm:justify-between mt-10 ${loading ? "opacity-40 pointer-events-none" : "opacity-100 pointer-events-auto"}`}>
              <FocusLeaf className={pagination[page] + 1 === 1 ? "cursor-not-allowed" : ""} focusedStyles="[&>button]:!bg-black-1 [&>button]:!border-yellow-300 [&>button]:!text-yellow-300" isFocusable={pagination[page] + 1 !== 1} onEnterPress={() => updatePagination(page, -1)}>
                <button className={`px-9 py-3 bg-yellow-300 text-black-1 rounded-xl text-lg font-semibold border-2 border-transparent hover:bg-black-1 hover:border-yellow-300 hover:text-yellow-300 flex items-center gap-4 ${pagination[page] + 1 === 1 ? "opacity-40 pointer-events-none" : ""}`} onClick={() => updatePagination(page, -1)}>
                    <ArrowLeft size={32} variant='Bold' />
                    Previous
                </button>
              </FocusLeaf>

            {
              typeof pagination[page] == "number" && pagination[page] >= 0 ?
              <p className="text-lg font-semibold text-gray-300">Page: <span className="text-yellow-300 ml-2">{ pagination[page] + 1 }</span> / { Math.ceil(totals[page] / mediaPerPage) }</p>
              : ""
            }

            <FocusLeaf className={pagination[page] + 1 === Math.ceil(totals[page] / mediaPerPage) ? "cursor-not-allowed" : ""} focusedStyles="[&>button]:!bg-black-1 [&>button]:!border-yellow-300 [&>button]:!text-yellow-300" isFocusable={pagination[page] + 1 !== Math.ceil(totals[page] / mediaPerPage)} onEnterPress={() => updatePagination(page, +1)}>
              <button className={`px-9 py-3 bg-yellow-300 text-black-1 rounded-xl text-lg font-semibold border-2 border-transparent hover:bg-black-1 hover:border-yellow-300 hover:text-yellow-300 flex items-center gap-4 ${pagination[page] + 1 === Math.ceil(totals[page] / mediaPerPage) ? "opacity-40 pointer-events-none" : ""}`} onClick={() => updatePagination(page, +1)}>
                  Next
                  <ArrowRight size={32} variant='Bold' />
              </button>
            </FocusLeaf>
          </div>
        </section>
      </FocusContext.Provider>

      <Login show={openLogin && !isAuthenticated} onLogin={onLogin} onClose={() => setOpenLogin(false)} />

      {/* <Transition> */}
        {
          selectedMedia && openModal && <MediaModal show={openModal && isAuthenticated} media={selectedMedia || dummyMedia} authToken={authToken} onExit={onMediaModalClose} />
        }
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