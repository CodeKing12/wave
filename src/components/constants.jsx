export const MEDIA_ENDPOINT = "https://plugin.sc2.zone";
export const PATH_SEARCH_MEDIA = "/api/media/filter/v2/search?order=desc&sort=score&type=*";
export const DEFAULT_ITEM_COUNT = 100;
export const PATH_MOVIES = "/api/media/filter/v2/news?type=movie&sort=dateAdded&order=desc&days=365";
export const PATH_SERIES = "/api/media/filter/v2/news?type=tvshow&sort=dateAdded&order=desc&days=365";
export const PATH_CONCERTS = "/api/media/filter/v2/concert?type=*&sort=dateAdded&order=desc&days=730";
export const PATH_FAIRY_TALES = "/api/media/filter/v2/genre?type=movie&sort=premiered&order=desc&value=Fairy Tale";
export const PATH_ANIMATED_MOVIES = "/api/media/filter/v2/genre?type=movie&sort=premiered&order=desc&days=365&value=Animated";
export const PATH_ANIMATED_SERIES = "/api/media/filter/v2/genre?type=tvshow&sort=premiered&order=desc&days=365&value=Animated";
export const PATH_MOVIES_CZSK = "/api/media/filter/v2/newsDubbed?type=movie&sort=langDateAdded&order=desc&lang=cs&lang=sk&days=730";
export const PATH_SERIES_CZSK = "/api/media/filter/v2/newsDubbed?type=tvshow&sort=langDateAdded&order=desc&lang=cs&lang=sk&days=730";
export const PATH_POPULAR_MOVIES = "/api/media/filter/v2/all?type=movie&sort=playCount&order=desc";
export const PATH_POPULAR_SERIES = "/api/media/filter/v2/all?type=tvshow&sort=playCount&order=desc";
export const PATH_MOVIES_ADDED = "/api/media/filter/v2/all?type=movie&sort=dateAdded&order=desc";
export const PATH_SERIES_ADDED = "/api/media/filter/v2/all?type=tvshow&sort=dateAdded&order=desc";

export const TOKEN_PARAM_NAME = "access_token"
// export const TOKEN_PARAM_VALUE = "th2tdy0no8v1zoh1fs59";  // This is the former token, gotten from the ymovie app.
export const TOKEN_PARAM_VALUE = "F4fdEDXKgsw7z3TxzSjaDpp3O";



export const AUTH_ENDPOINT = "https://webshare.cz";
export const PATH_SALT = "/api/salt/";
export const PATH_LOGIN = "/api/login/";
export const PATH_USER_DATA = "/api/user_data/";
export const PATH_FILE_LINK = "/api/file_link/";
export const PATH_FILE_PASSWORD_SALT = "/api/file_password_salt/";
export const PATH_FILE_PROTECTED = "/api/file_protected/";
export const PATH_SEARCH = "/api/search/";
export const PATH_FILE_INFO = "/api/file_info/";
export const authAxiosConfig = {
    headers: {'Content-Type': 'application/x-www-form-urlencoded'}
}

export const proxyUrl = "http://localhost:5000/video"