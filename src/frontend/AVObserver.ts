import AudioVideoObserver from "amazon-chime-sdk-js/build/audiovideoobserver/AudioVideoObserver";
import MeetingSessionStatus from "amazon-chime-sdk-js/build/meetingsession/MeetingSessionStatus";
import MeetingSessionStatusCode from "amazon-chime-sdk-js/build/meetingsession/MeetingSessionStatusCode";
import VideoTileState from "amazon-chime-sdk-js/build/videotile/VideoTileState";
import MeetingSessionVideoAvailability from "amazon-chime-sdk-js/build/meetingsession/MeetingSessionVideoAvailability";
import ClientVideoStreamReceivingReport
    from "amazon-chime-sdk-js/build/clientmetricreport/ClientVideoStreamReceivingReport";
import ClientMetricReport from "amazon-chime-sdk-js/build/clientmetricreport/ClientMetricReport";
import {tileOrganizer} from "./TileOrganizer";


const log = (...args) => console.log(args);


export class AVObserver implements AudioVideoObserver {
    audioVideoDidStartConnecting(reconnecting: boolean): void {
        log(`--AVObserver-1--- ${reconnecting}`);
    }

    audioVideoDidStart(): void {
        log('--AVObserver-2--- session started');
    }

    audioVideoDidStop(sessionStatus: MeetingSessionStatus): void {
        log(`--AVObserver-3--- session stopped from ${JSON.stringify(sessionStatus)}`);
    }

    videoTileDidUpdate(tileState: VideoTileState): void {
        log(`--AVObserver-4--- video tile updated: ${JSON.stringify(tileState, null, '  ')}`);
    }

    videoTileWasRemoved(tileId: number): void {
        log(`--AVObserver-5--- : ${ tileId }`);
    }

    videoAvailabilityDidChange(availability: MeetingSessionVideoAvailability): void {
        log(`--AVObserver-6--- : ${ JSON.stringify(availability) }`);
    }

    estimatedDownlinkBandwidthLessThanRequired(estimatedDownlinkBandwidthKbps: number, requiredVideoDownlinkBandwidthKbps: number ): void {
        log(`--AVObserver-7--- : Estimated downlink bandwidth is ${estimatedDownlinkBandwidthKbps} is less than required bandwidth for video ${requiredVideoDownlinkBandwidthKbps}`);
    }

    videoNotReceivingEnoughData(videoReceivingReports: ClientVideoStreamReceivingReport[]): void {
        log(`--AVObserver-8--- : One or more video streams are not receiving expected amounts of data ${JSON.stringify(videoReceivingReports)}`);
    }

    metricsDidReceive(clientMetricReport: ClientMetricReport): void {
        log(`--AVObserver-9--- : ${ JSON.stringify(clientMetricReport) } `);
    }

    connectionDidBecomePoor(): void {
        log('--AVObserver-10--- : connection is poor');
    }

    connectionDidSuggestStopVideo(): void {
        log('--AVObserver-11--- : suggest turning the video off');
    }

    connectionDidBecomeGood(): void {
        log('--AVObserver-12--- : suggest turning the video off');
    }

    videoSendDidBecomeUnavailable(): void {
        log('--AVObserver-13--- : sending video is not available');
    }

}
