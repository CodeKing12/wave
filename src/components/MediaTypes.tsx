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

export type InfoLabels = {
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
    status: string;
    duration: number;
};

export interface I18nInfoLabel {
    lang: string;
    title: string;
    plot: string;
    tagline: string;
    art: Art;
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

export interface ApiSource {
    original_language: string;
    languages: string[];
    networks: string[];
    collections: any[]; // Update with the correct type if needed
    ratings: RatingObj;
    // ... other properties
    cast: Person[];
    i18n_info_labels: I18nInfoLabel[];
    info_labels: InfoLabels;
    available_streams: AvailableStreams;
}

export interface MediaObj {
    _index: string;
    _id: string;
    _score: null;
    _source: ApiSource;
    sort: number[];
}
