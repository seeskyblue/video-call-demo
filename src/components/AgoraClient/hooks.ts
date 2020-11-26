import * as React from 'react';
import { ClientConfig, Stream } from 'agora-rtc-sdk';
import { IClientWithPromise } from 'agoran-awe/types/promisify';

import { EVENT } from '~/const';
import useMountedRef from '~/hooks/useMountedRef';
import AgoraRTC from '~/utils/agora-rtc-egine';

/*****************************************************************************
 * Constants
 *****************************************************************************/
const subscribeOptions = { video: true, audio: true };

/*****************************************************************************
 * Types
 *****************************************************************************/
type Callback = (evt: Event) => void;
type Event = {
  uid: string;
  stream?: Stream;
};

export interface State {
  joined: boolean;
  published: boolean;
  loading: boolean;
  info?: string;
  error?: string;
}

type Action =
  | { type: 'JOIN' }
  | { type: 'JOIN_SUCCESS'; info: string }
  | { type: 'JOIN_FAILURE'; error: string }
  | { type: 'LEAVE' }
  | { type: 'LEAVE_SUCCESS'; info: string }
  | { type: 'LEAVE_FAILURE'; error: string }
  | { type: 'PUBLISH' }
  | { type: 'PUBLISH_SUCCESS'; info: string }
  | { type: 'PUBLISH_FAILURE'; error: string }
  | { type: 'UNPUBLISH' }
  | { type: 'UNPUBLISH_SUCCESS'; info: string }
  | { type: 'UNPUBLISH_FAILURE'; error: string };

export interface JoinConfig {
  mode: ClientConfig['mode'];
  codec: ClientConfig['codec'];
  uid?: string | number;
  appId: string;
  token: string;
  channel: string;
  cameraId?: string;
  microphoneId?: string;
}

export interface API {
  join: (config: JoinConfig) => void;
  publish: (client?: IClientWithPromise, localStream?: Stream) => void;
  leave: (client?: IClientWithPromise, localStream?: Stream) => void;
  unpublish: (client?: IClientWithPromise, localStream?: Stream) => void;
}

/*****************************************************************************
 * Reducer
 *****************************************************************************/
const initialState: State = {
  joined: false,
  published: false,
  loading: false,
};

const reducer: React.Reducer<State, Action> = (state: State, action: Action) => {
  switch (action.type) {
    case 'JOIN':
    case 'PUBLISH':
    case 'LEAVE':
    case 'UNPUBLISH':
      return { ...state, loading: true, info: undefined, error: undefined };
    case 'JOIN_FAILURE':
    case 'PUBLISH_FAILURE':
    case 'LEAVE_FAILURE':
    case 'UNPUBLISH_FAILURE':
      return { ...state, loading: false, error: action.error };
    case 'JOIN_SUCCESS':
      return { ...state, loading: false, info: action.info, joined: true, published: true };
    case 'LEAVE_SUCCESS':
      return { ...state, loading: false, info: action.info, joined: false, published: false };
    case 'PUBLISH_SUCCESS':
      return { ...state, loading: false, info: action.info, published: true };
    case 'UNPUBLISH_SUCCESS':
      return { ...state, loading: false, info: action.info, published: false };
    default:
      return state;
  }
};

/*****************************************************************************
 * Hooks
 *****************************************************************************/
// Starts the video call
function useJoin(
  dispatch: React.Dispatch<Action>
): [IClientWithPromise | undefined, (config: JoinConfig) => void] {
  const mountedRef = useMountedRef();
  const [agoraClient, setAgoraClient] = React.useState<IClientWithPromise>();

  const join = React.useCallback(
    async (config: JoinConfig) => {
      const { mode, codec, uid, appId, token, channel, cameraId, microphoneId } = config;

      // Creates a new agora client with given parameters.
      // mode can be 'rtc' for real time communications or 'live' for live broadcasting.
      dispatch({ type: 'JOIN' });

      try {
        const client = AgoraRTC.createClient({ mode, codec });
        setAgoraClient(client);

        // initializes the client with appId
        await client.init(appId);
        // joins a channel with a token, channel, user id
        await client.join(token, channel, uid ?? null);
        // create a ne stream
        const stream = AgoraRTC.createStream({
          streamID: uid ?? undefined,
          video: true,
          audio: true,
          screen: false,
          cameraId,
          microphoneId,
        });
        // Initalize the stream
        await stream.init();
        // Publish the stream to the channel.
        await client.publish(stream);

        // Set the state appropriately
        if (mountedRef.current) {
          dispatch({ type: 'JOIN_SUCCESS', info: `Joined channel ${channel}` });
        }
      } catch (err) {
        if (mountedRef.current) {
          dispatch({ type: 'JOIN_FAILURE', error: `Failed to join, ${err}` });
        }
      }
    },
    [dispatch, mountedRef]
  );

  return [agoraClient, join];
}

// Publish function to publish the stream to Agora. No need to invoke this after join.
// This is to be invoke only after an unpublish
function usePublish(dispatch: React.Dispatch<Action>) {
  const mountedRef = useMountedRef();

  return React.useCallback(
    (client?: IClientWithPromise, localStream?: Stream) => async () => {
      if (client == null) {
        dispatch({ type: 'PUBLISH_FAILURE', error: 'Failed to publish, client not exists' });
        return;
      }

      if (localStream == null) {
        dispatch({ type: 'PUBLISH_FAILURE', error: 'Failed to publish, stream not exists' });
        return;
      }

      dispatch({ type: 'PUBLISH' });
      try {
        // Publish the stream to the channel.
        await client.publish(localStream);

        if (mountedRef.current) {
          dispatch({ type: 'PUBLISH_SUCCESS', info: 'Stream published' });
        }
      } catch (err) {
        if (mountedRef.current) {
          dispatch({ type: 'PUBLISH_FAILURE', error: `Failed to publish, ${err}` });
        }
      }
    },
    [dispatch, mountedRef]
  );
}

// Leaves the channel on invoking the function call.
function useLeave(dispatch: React.Dispatch<Action>) {
  const mountedRef = useMountedRef();

  return React.useCallback(
    (client?: IClientWithPromise, localStream?: Stream) => async () => {
      if (client == null) {
        dispatch({ type: 'LEAVE_FAILURE', error: 'Failed to publish, client not exists' });
        return;
      }

      if (localStream == null) {
        dispatch({ type: 'LEAVE_FAILURE', error: 'Failed to publish, stream not exists' });
        return;
      }

      dispatch({ type: 'LEAVE' });
      try {
        // Closes the local stream. This de-allocates the resources and turns off the camera light
        localStream.close();
        // unpublish the stream from the client
        client.unpublish(localStream);
        // leave the channel
        await client.leave();

        if (mountedRef.current) {
          dispatch({ type: 'LEAVE_SUCCESS', info: 'Left channel' });
        }
      } catch (err) {
        if (mountedRef.current) {
          dispatch({ type: 'LEAVE_FAILURE', error: `Failed to leave, ${err}` });
        }
      }
    },
    [dispatch, mountedRef]
  );
}

// Used to unpublish the stream.
function useUnpublish(dispatch: React.Dispatch<Action>) {
  const mountedRef = useMountedRef();

  return React.useCallback(
    (client?: IClientWithPromise, localStream?: Stream) => async () => {
      if (client == null) {
        dispatch({ type: 'UNPUBLISH_FAILURE', error: 'Failed to publish, client not exists' });
        return;
      }

      if (localStream == null) {
        dispatch({ type: 'UNPUBLISH_FAILURE', error: 'Failed to publish, stream not exists' });
        return;
      }

      dispatch({ type: 'UNPUBLISH' });
      try {
        // unpublish the stream from the client
        await client.unpublish(localStream);

        if (mountedRef.current) {
          dispatch({ type: 'UNPUBLISH_SUCCESS', info: 'Stream unpublished' });
        }
      } catch (err) {
        if (mountedRef.current) {
          dispatch({ type: 'UNPUBLISH_FAILURE', error: `Failed to unpublish, ${err}` });
        }
      }
    },
    [dispatch, mountedRef]
  );
}

function useMediaStream(
  client: IClientWithPromise | undefined,
  filter?: (streamId: string | number) => boolean
): [Stream | undefined, Stream[]] {
  const [localStream, setLocalStream] = React.useState<Stream>();
  const [remoteStreamList, setRemoteStreamList] = React.useState<Stream[]>([]);

  React.useEffect(() => {
    let mounted = true;

    // add when subscribed
    const addRemote: Callback = (evt) => {
      if (!mounted) return;

      const { stream } = evt;
      if (!stream) return;

      setRemoteStreamList((streamList) => streamList.concat(stream));
    };

    // remove stream
    const removeRemote: Callback = (evt) => {
      if (!mounted) return;

      const { stream } = evt;
      if (!stream) return;

      const id = stream.getId();
      setRemoteStreamList((streamList) => {
        const index = streamList.findIndex((item) => item.getId() === id);

        if (index < 0) return streamList;

        return streamList.slice(0, index).concat(streamList.slice(index + 1));
      });
    };

    // subscribe when added
    const doSub: Callback = (evt) => {
      if (!client) return;
      if (!mounted) return;

      const { stream } = evt;
      if (!stream) return;

      if (!filter) {
        client.subscribe(stream, subscribeOptions);
      } else if (filter(stream.getId())) {
        client.subscribe(stream, subscribeOptions);
      }
    };

    // add when published
    const addLocal: Callback = (evt) => {
      if (!mounted) return;

      const { stream } = evt;
      if (!stream) return;

      const { stop } = stream;
      const { close } = stream;
      stream.close = ((func) => () => {
        func();
        setLocalStream(undefined);
      })(close);
      stream.stop = ((func) => () => {
        func();
        setLocalStream(undefined);
      })(stop);

      setLocalStream(stream);
    };

    if (client) {
      client.on(EVENT.STREAM_PUBLISHED, addLocal);
      client.on(EVENT.STREAM_ADDED, doSub);
      client.on(EVENT.STREAM_SUBSCRIBED, addRemote);
      client.on(EVENT.PEER_LEAVE, removeRemote);
      client.on(EVENT.STREAM_REMOVED, removeRemote);
    }

    return () => {
      mounted = false;
      // Maintains the list of users based on the various network events.
      if (client) {
        client.off(EVENT.STREAM_PUBLISHED, addLocal);
        client.off(EVENT.STREAM_ADDED, doSub);
        client.off(EVENT.STREAM_SUBSCRIBED, addRemote);
        client.off(EVENT.PEER_LEAVE, removeRemote);
        client.off(EVENT.STREAM_REMOVED, removeRemote);
      }
    };
  }, [client, filter]);

  return [localStream, remoteStreamList];
}

/*****************************************************************************
 * Default Export
 *****************************************************************************/
export default function useAgoraClient(): {
  state: State;
  api: API;
  localStream?: Stream;
  remoteStreamList: Stream[];
} {
  const [state, dispatch] = React.useReducer(reducer, initialState);

  const [client, join] = useJoin(dispatch);
  const [localStream, remoteStreamList] = useMediaStream(client);

  const publish = usePublish(dispatch)(client, localStream);
  const leave = useLeave(dispatch)(client, localStream);
  const unpublish = useUnpublish(dispatch)(client, localStream);

  const api = { join, publish, leave, unpublish };

  return { state, api, localStream, remoteStreamList };
}
