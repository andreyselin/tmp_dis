import DefaultMeetingSession from "amazon-chime-sdk-js/build/meetingsession/DefaultMeetingSession";
import AudioVideoFacade from "amazon-chime-sdk-js/build/audiovideofacade/AudioVideoFacade";
import MeetingSession from "amazon-chime-sdk-js/build/meetingsession/MeetingSession";
import MeetingSessionConfiguration from "amazon-chime-sdk-js/build/meetingsession/MeetingSessionConfiguration";
import {api} from "./api";
import {createLogger, MyDeviceChangeObserver} from "./logger";
import DefaultDeviceController from "amazon-chime-sdk-js/build/devicecontroller/DefaultDeviceController";
import {AVObserver} from "./AVObserver";
import DefaultModality from "amazon-chime-sdk-js/build/modality/DefaultModality";
import DefaultActiveSpeakerPolicy from "amazon-chime-sdk-js/build/activespeakerpolicy/DefaultActiveSpeakerPolicy";
import VideoTile from "amazon-chime-sdk-js/build/videotile/VideoTile";
import VideoTileState from "amazon-chime-sdk-js/build/videotile/VideoTileState";
import {tileOrganizer} from "./TileOrganizer";

export class Meeting extends AVObserver {

    roster = {};

    meetingSession: MeetingSession | null = null;
    audioVideo: AudioVideoFacade | null = null;


    async initialize () {
        try {
            const joinInfo = (await api.join()).JoinInfo;
            console.log({ joinInfo });
            const configuration = new MeetingSessionConfiguration(joinInfo.Meeting, joinInfo.Attendee);
            this.supplementConfig(configuration);

            // original: initializeMeetingSession

            const logger = createLogger(configuration);
            const deviceController = new DefaultDeviceController(logger);
            this.meetingSession = new DefaultMeetingSession(configuration, logger, deviceController);
            this.audioVideo = this.meetingSession.audioVideo;


            this.audioVideo.addDeviceChangeObserver(new MyDeviceChangeObserver());
            this.setupDeviceLabelTrigger();

            // await this.populateAllDeviceLists();
            this.setupSubscribeToAttendeeIdPresenceHandler();
            this.audioVideo.addObserver(this);


            // Mute me and turn off speaker connections (not sure if it is connected initially)
            // this.audioVideo.realtimeMuteLocalAudio();
            // this.audioVideo.unbindAudioElement();

            this.audioVideo.start();
            await this.turnVideo(true);


        } catch (e) {
            console.log('error ==>', e);
        }

    }




    videoTileDidUpdate(tileState: VideoTileState): void {
        this.log(`video tile updated: ${JSON.stringify(tileState, null, '  ')}`);
        if (!tileState.boundAttendeeId) {
            return;
        }
        const tileIndex = tileOrganizer.acquireTileIndex(tileState.tileId as number, tileState.localTile) ;
        const tileElement = document.getElementById(`tile-${tileIndex}`) as HTMLDivElement;
        const videoElement = document.getElementById(`video-${tileIndex}`) as HTMLVideoElement;

        console.log('tileIndex-tileIndex', tileIndex);

        this.log(`binding video tile ${tileState.tileId} to ${videoElement.id}`);
        this.audioVideo?.bindVideoElement(tileState.tileId as number, videoElement);

        // this.tileIndexToTileId[tileIndex] = tileState.tileId;
        // this.tileIdToTileIndex[tileState.tileId] = tileIndex;

        tileElement.style.display = 'block';
        this.layoutVideoTiles();
    }




    async turnVideo (mode) {
        if (mode === true) {
            const cameras = await (this.audioVideo as AudioVideoFacade).listVideoInputDevices();
            await this.audioVideo?.chooseVideoInputDevice(cameras[0]);
        }
    }



    setupSubscribeToAttendeeIdPresenceHandler(): void {
        const handler = (
            attendeeId: string,
            present: boolean,
            externalUserId?: string,
            dropped?: boolean
        ): void => {
            this.log(`${attendeeId} present = ${present} (${externalUserId})`);

            if (!present) {
                delete this.roster[attendeeId];
                this.log(`${attendeeId} dropped = ${dropped} (${externalUserId})`);
                return;
            }

            if (!this.roster[attendeeId]) {
                this.roster[attendeeId] = {
                    name: externalUserId?.split('#').slice(-1)[0]
                };
            }

            this.audioVideo?.realtimeSubscribeToVolumeIndicator(
                attendeeId,
                async (attendeeId: string, volume: number | null, muted: boolean | null, signalStrength: number | null) => {
                    if (!this.roster[attendeeId]) {
                        return;
                    }
                    if (volume !== null) {
                        this.roster[attendeeId].volume = Math.round(volume * 100);
                    }
                    if (muted !== null) {
                        this.roster[attendeeId].muted = muted;
                    }
                    if (signalStrength !== null) {
                        this.roster[attendeeId].signalStrength = Math.round(signalStrength * 100);
                    }
                }
            );

        };

        this.audioVideo?.realtimeSubscribeToAttendeeIdPresence(handler);
    }



    layoutVideoTiles(): void {
        // @ts-ignore
        // document.getElementById('console').innerHTML = document.getElementById('console').innerHTML + '<div>layoutVideoTiles called</div>'
    }




    ////////////////////////
    //                    //
    //                    //
    //     Misc below     //
    //                    //
    //                    //
    ////////////////////////





    setupDeviceLabelTrigger(): void {
        this.audioVideo?.setDeviceLabelTrigger(
            async (): Promise<MediaStream> =>
                await navigator.mediaDevices.getUserMedia({ audio: true, video: true })
        );
    }

    log(str: string): void {
        console.log(`[DEMO] ${str}`);
    }



    supplementConfig(configuration) {
        configuration.enableWebAudio = false;
        configuration.enableUnifiedPlanForChromiumBasedBrowsers = true;
        configuration.attendeePresenceTimeoutMs = 5000;
        configuration.enableSimulcastForUnifiedPlanChromiumBasedBrowsers = false;
    }
}
