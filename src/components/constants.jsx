export const ENDPOINT = "https://plugin.sc2.zone";
export const PATH_SEARCH = "/api/media/filter/v2/search?order=desc&sort=score&type=*";
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
export const TOKEN_PARAM_VALUE = "th2tdy0no8v1zoh1fs59";