import * as React from 'react';
import { IClientWithPromise } from 'agoran-awe/types/promisify';

import { EVENT } from '~/const';
import AgoraRTC from '~/utils/agora-rtc-egine';

// In order to get device from agora client API
const fakeClient = AgoraRTC.createClient({ mode: 'live', codec: 'vp8' });

export function useCamera(client: IClientWithPromise = fakeClient): MediaDeviceInfo[] {
  const [cameraList, setCameraList] = React.useState<MediaDeviceInfo[]>([]);

  React.useEffect(() => {
    let mounted = true;

    const resetCameraList = async () => {
      if (!client) return;

      try {
        const cameras = await client.getCameras();
        if (mounted) setCameraList(cameras);
      } catch {
        // noop
      }
    };

    client.on(EVENT.CAMERA_CHANGED, resetCameraList);

    resetCameraList();

    return () => {
      mounted = false;
      client.off(EVENT.CAMERA_CHANGED, resetCameraList);
    };
  }, [client]);

  return cameraList;
}

export function useMicrophone(client: IClientWithPromise = fakeClient): MediaDeviceInfo[] {
  const [microphoneList, setMicrophoneList] = React.useState<MediaDeviceInfo[]>([]);

  React.useEffect(() => {
    let mounted = true;

    const resetMicrophoneList = async () => {
      if (!client) return;

      try {
        const microphones = await client.getRecordingDevices();
        if (mounted) setMicrophoneList(microphones);
      } catch {
        // noop
      }
    };

    client.on(EVENT.RECORDING_DEVICE_CHANGED, resetMicrophoneList);

    resetMicrophoneList();

    return () => {
      mounted = false;
      client.off(EVENT.RECORDING_DEVICE_CHANGED, resetMicrophoneList);
    };
  }, [client]);

  return microphoneList;
}
