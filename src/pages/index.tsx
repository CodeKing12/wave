import Image from 'next/image'
import { Inter } from 'next/font/google'
import Sidebar, { PageType } from '@/components/Sidebar'
import { SearchNormal1, ArrowLeft, ArrowRight } from "iconsax-react"
import axios from 'axios';
import { MEDIA_ENDPOINT, PATH_ANIMATED_MOVIES, PATH_ANIMATED_SERIES, PATH_CONCERTS, PATH_FAIRY_TALES, PATH_MOVIES, PATH_MOVIES_CZSK, PATH_SERIES, PATH_SERIES_CZSK, TOKEN_PARAM_NAME, TOKEN_PARAM_VALUE } from '@/components/constants';
import { useEffect, useState, useRef } from 'react';
import MovieList from '@/components/MediaList';
// import { BeatLoader, BounceLoader, ClipLoader, ClockLoader, ClimbingBoxLoader, FadeLoader, GridLoader, PuffLoader, PulseLoader, PropagateLoader, RingLoader, SquareLoader, SkewLoader, ScaleLoader, HashLoader, SyncLoader, RotateLoader } from 'react-spinners';
import { HashLoader } from 'react-spinners';
import { MediaObj } from '@/components/MediaTypes';
import Login from '@/components/Login';
import useAuthToken from '@/hooks/useAuthToken';
import { getUUID, uuidv4 } from '@/utils/general';

const inter = Inter({ subsets: ['latin'] })


export function parseXml(data: string, param: string) {
  const xml = new DOMParser().parseFromString(data, "application/xml");
  const processed = xml.getElementsByTagName("response")[0];

  return processed.getElementsByTagName(param)[0].textContent || "";
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

function Navbar() {
  return (
    <nav className="flex items-center justify-between">
      <div className="flex gap-12 items-center text-white text-opacity-80 font-medium">
        <a className="cursor-pointer">Favorites</a>
        <a className="cursor-pointer">Watched</a>
      </div>

      <form className="relative">
        <input className="w-[350px] h-14 px-4 pl-14 py-3 text-white text-sm bg-gray-700 bg-opacity-10 rounded-xl border border-[rgba(249,249,249,0.10)] placeholder:text-gray-300 placeholder:text-sm outline-none" placeholder="Search Movies or TV Shows" />
        <SearchNormal1 size={24} color="#AEAFB2" className="absolute top-1/2 -translate-y-1/2 left-4" />
      </form>
    </nav>
  )
}

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [openLogin, setOpenLogin] = useState(false);
  const [authToken, setAuthToken] = useState("");
  const [media, setMedia] = useState<MediaType>({});
  const [page, setPage] = useState<PageType>("movies");
  const [totals, setTotals] = useState<PaginationType>({} as PaginationType);
  const [pagination, setPagination] = useState<PaginationType>({} as PaginationType);
  const prevPagination = useRef(pagination)

  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');

    if (storedToken) {
      setAuthToken(storedToken);
      setIsAuthenticated(true);
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
    series_czsk: PATH_SERIES_CZSK
  }

  function updatePagination(page: PageType, increment?: number) {
    const prevPageValue = pagination[page] || 0
    setPagination((prevPagination) => ({
      ...prevPagination,
      [page]: increment ? prevPageValue + increment : 0
    }))
  }

  useEffect(() => {
    if (!pagination.hasOwnProperty(page)) {
      updatePagination(page)
    }
    // console.log("Got here")
    if (!media.hasOwnProperty(page) || pagination[page] > prevPagination.current[page]) {
      // console.log("Next Check")
      if (pagination[page] >= (media[page]?.length ?? 0)) {
        setLoading(true);
        // console.log("Passed all checks")
        axios.get(MEDIA_ENDPOINT + api_map[page], {
          params: {
            [TOKEN_PARAM_NAME]: TOKEN_PARAM_VALUE,
            from: pagination[page] > 0 ? mediaPerPage * pagination[page] : undefined ,
          }
        }).then(
          function (response) {
            setTotals((prevTotals) => ({
              ...prevTotals,
              [page]: response.data.hits.total.value
            }))
            const currentPage = media[page] || [];
            setMedia((prevMedia) => ({
              ...prevMedia,
              [page]: [...currentPage, response.data.hits.hits]
            }))
            setLoading(false);
            // console.log(response.data.hits.hits)
          }
        )
      }
    }
    prevPagination.current = pagination;
  }, [page, pagination])


  return (
    <main>
      <Sidebar current={page} onChange={setPage} />

      <section className="flex-1 min-h-screen ml-[270px] flex flex-col pt-10 pb-16 px-20 font-poppins" id="main-display">
        <Navbar />
        
        <div className="relative flex-1 mt-6">
          {/* {console.log(media[page])} */}
          {
            media[page] && media[page]?.[pagination[page]]?.length ? 
            <MovieList isAuthenticated={isAuthenticated} authToken={authToken} onMovieSelect={() => {console.log("Got here");setOpenLogin(true)}} page={page} media={media[page]?.[pagination[page]]} />
            : <HashLoader size={70} speedMultiplier={1.2} color="#fde047" loading={true} className="!absolute top-[37%] left-1/2 -translate-x-1/2 -translate-y-1/2" />
          }
        </div>
        <div className={`flex items-center justify-between mt-10 ${loading ? "opacity-40 pointer-events-none" : "opacity-100 pointer-events-auto"}`}>
          <button className="px-9 py-3 bg-yellow-300 text-black-1 rounded-xl text-lg font-semibold border-2 border-transparent hover:bg-black-1 hover:border-yellow-300 hover:text-yellow-300 flex items-center gap-4" onClick={() => updatePagination(page, -1)}>
              <ArrowLeft size={32} variant='Bold' />
              Previous
          </button>

          {
            pagination[page] ?
            <p className="text-lg font-semibold text-gray-300">Page: <span className="text-yellow-300 ml-2">{ pagination[page] + 1 }</span> / { Math.round(totals[page] / mediaPerPage) }</p>
            : ""
          }

          <button className="px-9 py-3 bg-yellow-300 text-black-1 rounded-xl text-lg font-semibold border-2 border-transparent hover:bg-black-1 hover:border-yellow-300 hover:text-yellow-300 flex items-center gap-4" onClick={() => updatePagination(page, +1)}>
              Next
              <ArrowRight size={32} variant='Bold' />
          </button>
        </div>
      </section>

      <Login show={openLogin && !isAuthenticated} onLogin={(isSuccess, token) => {setIsAuthenticated(isSuccess);setAuthToken(token)}} onClose={() => setOpenLogin(false)} />
    </main>
  )
}
