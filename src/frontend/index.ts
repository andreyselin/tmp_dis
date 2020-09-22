// declare const window: any;

import {Meeting} from "./Meeting";

window.onload = async () => {
    const meeting = new Meeting();
    (window as any).meeting = meeting;

    meeting.initialize();
    (window as any).showTiles = () => {
        meeting.audioVideo?.startLocalVideoTile();
    };
};
