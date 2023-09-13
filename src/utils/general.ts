import { LeanMediaStream, MediaObj, SeriesObj, StreamObj, VideoStream } from "@/components/MediaTypes";
import { AUTH_ENDPOINT, MEDIA_ENDPOINT, PATH_FILE_LINK, PATH_FILE_PASSWORD_SALT, PATH_FILE_PROTECTED, TOKEN_PARAM_NAME, TOKEN_PARAM_VALUE, authAxiosConfig } from "@/components/constants";
import { parseXml } from "@/pages";
import axios from "axios";
import { stream_p } from "./Stream";
import { md5crypt } from "./MD5";
import { sha1 } from "./Sha";

export function uuidv4():string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}


export function getUUID() {
    let device_uuid = localStorage.getItem('UUID');

    if (!device_uuid) {
      device_uuid = uuidv4();
      localStorage.setItem("UUID", device_uuid);
    }
    
    return device_uuid;
}

export function normalizeLanguage(source?: string):string {
    return source && source?.toUpperCase() || "?";
}

export function setWidths(selector: string) {
    const items = document.querySelectorAll<HTMLElement>(selector);
    const maxWWidth = Math.max(...Array.from(items).map(item => item.offsetWidth));
    items.forEach(item => {
        item.style.width = (maxWWidth > 110 ? 110 : maxWWidth) + 'px';
    });
}

export function transformStreamObj(source: StreamObj): LeanMediaStream | undefined {
    if(!source.video || !source.video.length)
        return undefined;
    const video: VideoStream = source.video[0];
    const result: LeanMediaStream = {
        size: source.size,
        language: source.audio
            ?.map(item => normalizeLanguage(item.language))
            ?.filter((value, index, self) => self.indexOf(value) === index)
            ?.sort()
            ?.join("/"),
        /** mapped to video.textTracks, must remain unsorted */
        subtitleList: source.subtitles
            ?.map(item => normalizeLanguage(item.language)),
        subtitles: source.subtitles
            ?.map(item => normalizeLanguage(item.language))
            ?.filter((value, index, self) => self.indexOf(value) === index)
            ?.sort()
            ?.join("/"),
        width: video.width,
        height: video.height,
        videoCodec: source.video
            ?.map(item => item.codec)
            ?.filter((value, index, self) => self.indexOf(value) === index)
            ?.join("/"),
        audioCodec: source.audio
            ?.map(item => item.codec)
            ?.filter((value, index, self) => self.indexOf(value) === index)
            ?.join("/"),
        duration: video.duration,
        ident: source.ident,
        name: source.name,
        media: source.media,
        hdr: video.hdr ? video.hdr.toString() : undefined
    };
    result.is3d = !!source.video.find((item: VideoStream) => (<any>item)['3d']);
    return result;
}


export function convertSecondsToTime(seconds: number) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    const hoursString = hours > 0 ? `${hours}hr` : '';
    const minutesString = minutes > 0 ? `${minutes}min` : '';

    if (hoursString && minutesString) {
        return `${hoursString} ${minutesString}`;
    } else {
        return hoursString || minutesString || '0min';
    }
}

export function bytesToSize(bytes: number) {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Byte';
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)).toString());
    return parseFloat((bytes / Math.pow(1024, i)).toFixed(1)) + sizes[i];
}  

export function formatDate(dateString: string) {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', options);
}

export function secondsToHMS(seconds: number) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    
    const formattedTime = `${hours}:${minutes < 10 ? '0' : ''}${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    return formattedTime;
}


export async function getFilePasswordSalt(ident: string): Promise<string> {
    try {
        const response = await axios.post(AUTH_ENDPOINT + PATH_FILE_PASSWORD_SALT, { ident }, authAxiosConfig);
        return parseXml(response.data, "salt");
    } catch (error) {
        console.log("An error occured while seasoning: ", error);
        return ""; // Return an empty string or handle the error appropriately
    }
}


export async function getVideoLink(ident: string, token: string, https: boolean, password?: string) {
    const UUID = getUUID();

    try {
        let response = await axios.post(AUTH_ENDPOINT + PATH_FILE_LINK, {
            ident,
            wst: token,
            device_uuid: UUID,
            force_https: https ? 1 : 0,
            download_type: "video_stream",
            device_vendor: "ymovie",
            password
        }, authAxiosConfig)

        const link = parseXml(response.data, "link")
        // console.log(link);
        return link;
    } catch (error) {
        console.log(error);
        return "Unable to get video link";
    }
}

export async function getStreamUrl(token: string, stream: StreamObj) {
    const https = document.location.protocol === "https:";
    const ident = stream.ident;
    const leanStream = transformStreamObj(stream);

    try {
        const response = await axios.post(AUTH_ENDPOINT + PATH_FILE_PROTECTED, { ident }, authAxiosConfig);
        const isProtected = parseXml(response.data, "protected") === "1";

        if (isProtected) {
            const salt = await getFilePasswordSalt(ident);
            const password = sha1(md5crypt(stream_p(leanStream), salt));
            const mediaUrl = await getVideoLink(ident, token, https, password)
            return mediaUrl;
        } else {
            const mediaUrl = await getVideoLink(ident, token, https);
            return mediaUrl;
        }

    } catch (error) {
        console.error("An error occurred:", error);
    }
}

export async function getMediaStreams(media: MediaObj | SeriesObj) {
    try {
        let response = await axios.get(MEDIA_ENDPOINT + `/api/media/${media._id}/streams`, {
            params: {
                [TOKEN_PARAM_NAME]: TOKEN_PARAM_VALUE,
            }
        })
        return response.data;
    } catch(error) {
        console.log(error)
        return undefined;
    }
}

export function generateUniqueId(prefix = '') {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5); // Adjust the length as needed

    return `${prefix}${timestamp}${random}`;
}

export function formatStringAsId(input: string) {
    // Replace non-alphanumeric characters with underscores
    const formattedString = input.replace(/[^a-zA-Z0-9]+/g, '-');
    
    // Remove underscores from the beginning and end
    const trimmedString = formattedString.replace(/^_+|_+$/g, '');
  
    return trimmedString;
}