import {
    Logger,
    ConsoleLogger,
    LogLevel,
    MeetingSessionPOSTLogger
} from "amazon-chime-sdk-js";
import MultiLogger from "amazon-chime-sdk-js/build/logger/MultiLogger";
import {env} from "./env";
import DeviceChangeObserver from "amazon-chime-sdk-js/build/devicechangeobserver/DeviceChangeObserver";


export const createLogger = (configuration) => {
    let logger: Logger;
    const logLevel = LogLevel.INFO;
    const consoleLogger = logger = new ConsoleLogger('SDK', logLevel);
    if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
        logger = consoleLogger;
    } else {
        logger = new MultiLogger(
            consoleLogger,
            new MeetingSessionPOSTLogger(
                'SDK',
                configuration,
                env.logger.batchSize,
                env.logger.intervalMs,
                `${env.baseUrl}logs`,
                logLevel
            ),
        );
    }
    return logger;
};

export class MyDeviceChangeObserver implements DeviceChangeObserver {
    audioInputsChanged(_freshAudioInputDeviceList: MediaDeviceInfo[]): void {
        console.log('--myDeviceChangeObserver-1--');
    }

    videoInputsChanged(_freshVideoInputDeviceList: MediaDeviceInfo[]): void {
        console.log('--myDeviceChangeObserver-2--');
    }

    audioOutputsChanged(_freshAudioOutputDeviceList: MediaDeviceInfo[]): void {
        console.log('--myDeviceChangeObserver-3--');
    }

    audioInputStreamEnded(deviceId: string): void {
        console.log('--myDeviceChangeObserver-4--');
    }

    videoInputStreamEnded(deviceId: string): void {
        console.log('--myDeviceChangeObserver-5--');
    }
}
