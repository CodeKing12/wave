import { LeanMediaStream, StreamObj, VideoStream } from "@/components/MediaTypes";

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
    return source && source.toUpperCase() || "?";
}

export function setWidths(selector: string) {
    const items = document.querySelectorAll<HTMLElement>(selector);
    const maxWWidth = Math.max(...Array.from(items).map(item => {console.log(item.offsetWidth);return item.offsetWidth}));
    items.forEach(item => {
        item.style.width = (maxWWidth > 110 ? 110 : maxWWidth) + 'px';
        console.log(maxWWidth, item.style.width)
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