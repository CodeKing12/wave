import Sidebar, { PageType } from '@/components/Sidebar'
import { SearchNormal1, ArrowLeft, ArrowRight, SearchNormal } from "iconsax-react"
import { MEDIA_ENDPOINT, PATH_ANIMATED_MOVIES, PATH_ANIMATED_SERIES, PATH_CONCERTS, PATH_FAIRY_TALES, PATH_MOVIES, PATH_MOVIES_CZSK, PATH_SEARCH_MEDIA, PATH_SERIES, PATH_SERIES_CZSK, TOKEN_PARAM_NAME, TOKEN_PARAM_VALUE } from '@/components/constants';
import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
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
  const { ref, focusKey, hasFocusedChild, focusSelf } = useFocusable({forceFocus: true})
  const [selectedMedia, setSelectedMedia] = useState<MediaObj | undefined>();
  const [openModal, setOpenModal] = useState(false);
  const [finishedLoading, setFinishedLoading] = useState(false);
  const [modalPlaceholder, setModalPlaceholder] = useState("");
  // const [keyInput, setKeyInput] = useState<any[]>([])

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
    
    if (window.screen.width < 1200) {
      setHideSidebar(true);
    }
    setFinishedLoading(true)

    // function displayInputs(event: KeyboardEvent) {
    //   setKeyInput([event.code, event.keyCode, event.key, event.which])
    // }
  
    // document.addEventListener("keydown", displayInputs)
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

  const updatePagination = useCallback((page: PageType, increment?: number) => {
    const prevPageValue = pagination[page] || 0
    setPagination((prevPagination) => ({
      ...prevPagination,
      [page]: increment ? prevPageValue + increment : 0
    }))
  }, [pagination])
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
            page === "search" ? "" : focusSelf();
          }
        )
      }
    }
    prevPagination.current = pagination;
  }, [page, pagination, searchHistory]) /* eslint-disable-line react-hooks/exhaustive-deps */

  const searchMedia = useCallback(() => {
    if (query.length && query !== searchHistory[searchHistory.length - 1]) {
      setSearchHistory([...searchHistory, query]);
      updatePagination("search");

      if (page !== "search") {
        setPage("search");
      }
    } else if (!query.length) {
      setPage("movies")
    }
  }, [query, searchHistory, page, updatePagination])

  const logoutWebshare = useCallback(() => {
    setAuthToken("");
    setIsAuthenticated(false);
    localStorage.removeItem("authToken");
    addAlert({
      type: "success",
      title: "Logout Successful"
    })
  }, [addAlert])

  const onLogin = useCallback((isSuccess: boolean, token: string) => {
    setIsAuthenticated(isSuccess);
    setAuthToken(token);
    setOpenLogin(false);
    addAlert({
      type: "success",
      title: "Authentication Successful"
    })
  }, [addAlert])

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

  const onMediaModalClose = useCallback(() => setOpenModal(false), []);

  const onMediaCardClick = useCallback((mediaInfo: MediaObj) => {
    setOpenModal(true);
    setSelectedMedia(mediaInfo);
    const placeholderUrl = document.getElementById(mediaInfo._id + "-poster")?.getAttribute("src");
    setModalPlaceholder(placeholderUrl || "")
  }, [])

  const navUpdateQuery = useCallback((query: string) => setQuery(query), [])
  const navShowFavorites = useCallback(() => console.log("Clicked Favorites"), [])
  const hideSidebarHandler = useCallback((isHidden: boolean) => setHideSidebar(isHidden), [])
  const openLoginHandler = useCallback(() => setOpenLogin(true), [])
  const closeLoginHandler = useCallback(() => setOpenLogin(false), [])
  const sbLogoutHandler = useCallback(() => logoutWebshare(), [logoutWebshare])
  const pageChangeHandler = useCallback((newPage: PageType) => setPage(newPage), [])

  const getPageMedia = useMemo(() => {
    return media[page]?.[pagination[page]] || []
  }, [media, page, pagination])


  return (
    <main className="bg-[#191919]">
      {/* <div className="fixed top-1 left-1/2 z-[10000] text-white">Keys: { keyInput.map((val, index) => (<span className='text-yellow-300 mr-2' key={index}>{ val }</span>)) }</div> */}
      <Sidebar current={page} onChange={pageChangeHandler} isHidden={hideSidebar} isLoggedIn={isAuthenticated} onHide={hideSidebarHandler} onLogout={sbLogoutHandler} finishedLoading={finishedLoading} onLoginClick={openLoginHandler} />

      <FocusContext.Provider value={focusKey}>
        <section className={`flex-1 min-h-screen lg:ml-[300px] flex flex-col pt-10 pb-16 px-3 xs:px-4 xsm:px-8 md:px-14 xl:px-16 xxl:px-[72px] font-poppins duration-500 ease-in-out h-screen overflow-auto ${hideSidebar ? "!ml-0" : ""}`} id="main-display" ref={mainRef}>
          <Navbar query={query} updateQuery={navUpdateQuery} onSearch={searchMedia} showFavorites={navShowFavorites} />
          
          <div className={`relative flex-1 mt-6 ${hasFocusedChild ? 'menu-expanded' : 'menu-collapsed'}`} ref={ref}>
            {
              media[page] && media[page]?.[pagination[page]]?.length ? 
              <MediaList media={getPageMedia} onCardFocus={onCardFocus} onMediaModalOpen={onMediaCardClick} isSidebarOpen={hideSidebar} />
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

      <Login show={openLogin && !isAuthenticated} onLogin={onLogin} onClose={closeLoginHandler} />

      {/* <Transition> */}
        {
          // selectedMedia && openModal && <MediaModal show={openModal} media={selectedMedia || dummyMedia} placeholderImg={modalPlaceholder} authToken={authToken} onAuth={() => setOpenLogin(true)} onExit={onMediaModalClose} />
          <MediaModal show={openModal} media={selectedMedia || dummyMedia} placeholderImg={modalPlaceholder} authToken={authToken} onAuth={openLoginHandler} onExit={onMediaModalClose} />
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