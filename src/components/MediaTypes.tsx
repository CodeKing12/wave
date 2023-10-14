export interface AudioStream {
    language: string;
    codec: string;
    channels: number;
};

export interface VideoStream {
    width: number;
    height: number;
    codec: string;
    aspect: number;
    "3d": boolean;
    duration: number;
    hdr: any;
};

export interface Subtitle {
    _id: string;
    language: string;
    forced: boolean;
};

export interface StreamObj {
    _id: string;
    name: string;
    media: string;
    provider: string;
    date_added: string;
    ident: string;
    size: number;
    audio: AudioStream[];
    video: VideoStream[];
    subtitles: Subtitle[];
};

export interface LeanMediaStream {
    size: number;
    language: string;
    subtitleList: string[];
    subtitles: string;
    width: number;
    height: number;
    videoCodec: string;
    audioCodec: string;
    duration: number;
    ident: string;
    name: string;
    media: string;
    hdr?: number;
    is3d?: boolean;
}

export interface Rating {
    rating: number;
    votes: number;
}

export interface RatingObj {
    [trakt: string]: Rating;
};

export interface Video {
    name: string | null;
    size: number | null;
    type: string;
    url: string;
    lang?: string | null;
    subtitles?: any[]; // Update with the correct type if needed
}

export interface Cast {
    name: string;
    role: string;
    thumbnail: string;
    order: number;
}

export interface Art {
    poster?: string;
    fanart?: string;
    banner?: string;
}

export interface BaseInfoLabels {
    originaltitle: string;
    genre: string[];
    year: number;
    director: string[];
    studio: string[];
    writer: string[];
    premiered: string;
    dateadded: string;
    mediatype: string;
    country: (string | null)[];
    duration: number;
};

export interface MediaInfoLabels extends BaseInfoLabels {
    status: string;
}

export interface SeriesInfoLabels extends BaseInfoLabels {
    aired: string;
    season?: number;
    episode?: number;
}

export interface I18nInfoLabel {
    lang: string;
    title: string;
    plot: string;
    tagline: string;
    art: Art;
}

export interface SeriesI18nInfoLabel extends I18nInfoLabel {
    parent_titles: string[];
}

export interface LanguageInfo {
    lang: string;
    date_added: string;
}

export interface AvailableStreams {
    languages: {
        audio: {
            items: LanguageInfo[];
            map: string[];
        };
        subtitles: {
            items: LanguageInfo[];
            map: string[];
        };
    };
    count: number;
}

export interface Person {
    name: string;
    role?: string;
    order: number;
};

export interface MediaSource {
    original_language: string;
    languages: string[];
    networks: string[];
    collections: any[]; // Update with the correct type if needed
    ratings: RatingObj;
    // ... other properties
    cast: Person[];
    i18n_info_labels: I18nInfoLabel[];
    info_labels: MediaInfoLabels;
    available_streams: AvailableStreams;
}

export interface MediaStream {

}

export interface MediaObj {
    _index: string;
    _id: string;
    _score: null;
    _source: MediaSource;
    _streams?: StreamObj[];
    sort: number[];
}

export interface SeriesParentInfoLabel {
    originaltitle: string[];
}

export interface SeasonSource {
    parent_id: string;
    networks: string[];
    cast: Cast[];
    i18n_info_labels: SeriesI18nInfoLabel[];
    info_labels: SeriesInfoLabels;
    available_streams: AvailableStreams;
    children_count: number;
    collections: any[];
    languages: string[];
    parent_info_labels: SeriesParentInfoLabel;
    play_count: number;
    popularity: number;
    premieres: any[];
    ratings: RatingObj;
    root_parent: string;
    services: {
        [name: string]: string
    };
    stream_info: {
        audio: AudioStream[];
        video: VideoStream[];
        subtitles: Subtitle[];
    };
    tags: any[];
    total_children_count: number;
    trending: number;
    videos: any[];
}

export interface SeriesObj {
    _index: string;
    _id: string;
    _score: null;
    _source: SeasonSource;
    sort: number[];
}

export type Info2 = {
    title: string;
    plot: string;
}