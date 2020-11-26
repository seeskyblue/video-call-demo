import * as React from 'react';
import { ClientConfig, Stream } from 'agora-rtc-sdk';
import { IClientWithPromise } from 'agoran-awe/types/promisify';

import AgoraRTC from '../utils/agora-rtc-egine';

import useMountedRef from './useMountedRef';

/*****************************************************************************
 * Constants
 *****************************************************************************/
const ACTION_SET_CLIENT = 'ACTION_SET_CLIENT';
const ACTION_JOIN_REQUEST = 'ACTION_JOIN_REQUEST';
const ACTION_JOIN_SUCCESS = 'ACTION_JOIN_SUCCESS';
const ACTION_JOIN_FAILURE = 'ACTION_JOIN_FAILURE';
const ACTION_PUBLISH_REQUEST = 'ACTION_PUBLISH_REQUEST';
const ACTION_PUBLISH_SUCCESS = 'ACTION_PUBLISH_SUCCESS';
const ACTION_PUBLISH_FAILURE = 'ACTION_PUBLISH_FAILURE';
const ACTION_LEAVE_REQUEST = 'ACTION_LEAVE_REQUEST';
const ACTION_LEAVE_SUCCESS = 'ACTION_LEAVE_SUCCESS';
const ACTION_LEAVE_FAILURE = 'ACTION_LEAVE_FAILURE';
const ACTION_UNPUBLISH_REQUEST = 'ACTION_UNPUBLISH_REQUEST';
const ACTION_UNPUBLISH_SUCCESS = 'ACTION_UNPUBLISH_SUCCESS';
const ACTION_UNPUBLISH_FAILURE = 'ACTION_UNPUBLISH_FAILURE';

/*****************************************************************************
 * Types
 *****************************************************************************/
interface State {
  client?: IClientWithPromise;
  joined: boolean;
  published: boolean;
  left: boolean;
  unpublished: boolean;
  loading: boolean;
  info?: string;
  error?: string;
}

type ActionType =
  | typeof ACTION_SET_CLIENT
  | typeof ACTION_JOIN_REQUEST
  | typeof ACTION_JOIN_SUCCESS
  | typeof ACTION_JOIN_FAILURE
  | typeof ACTION_PUBLISH_REQUEST
  | typeof ACTION_PUBLISH_SUCCESS
  | typeof ACTION_PUBLISH_FAILURE
  | typeof ACTION_LEAVE_REQUEST
  | typeof ACTION_LEAVE_SUCCESS
  | typeof ACTION_LEAVE_FAILURE
  | typeof ACTION_UNPUBLISH_REQUEST
  | typeof ACTION_UNPUBLISH_SUCCESS
  | typeof ACTION_UNPUBLISH_FAILURE;

interface Action {
  type: ActionType;
  client?: IClientWithPromise;
  info?: string;
  error?: string;
}

interface JoinConfig {
  mode: ClientConfig['mode'];
  codec: ClientConfig['codec'];
  uid?: string | number;
  appId: string;
  token: string;
  channel: string;
  cameraId?: string;
  microphoneId?: string;
}

interface ActionDispatcher {
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
  left: false,
  unpublished: false,
  loading: false,
};

const reducer: React.Reducer<State, Action> = (state: State, action: Action) => {
  const { type, client, info, error } = action;

  switch (type) {
    case ACTION_JOIN_REQUEST:
      return { ...state, loading: true, client };
    case ACTION_JOIN_SUCCESS:
      return { ...state, loading: false, info, joined: true, published: true };
    case ACTION_JOIN_FAILURE:
      return { ...state, loading: false, error, joined: false, published: false };
    case ACTION_PUBLISH_REQUEST:
      return { ...state, loading: true };
    case ACTION_PUBLISH_SUCCESS:
      return { ...state, loading: false, info, published: true };
    case ACTION_PUBLISH_FAILURE:
      return { ...state, loading: false, error, published: false };
    case ACTION_LEAVE_REQUEST:
      return { ...state, loading: true };
    case ACTION_LEAVE_SUCCESS:
      return { ...state, loading: false, info, left: true };
    case ACTION_LEAVE_FAILURE:
      return { ...state, loading: false, error, left: false };
    case ACTION_UNPUBLISH_REQUEST:
      return { ...state, loading: true };
    case ACTION_UNPUBLISH_SUCCESS:
      return { ...state, loading: false, info, unpublished: true };
    case ACTION_UNPUBLISH_FAILURE:
      return { ...state, loading: false, error, unpublished: false };
    default:
      return state;
  }
};

/*****************************************************************************
 * Hooks
 *****************************************************************************/
// Starts the video call
function useJoin(dispatch: React.Dispatch<Action>) {
  const mountedRef = useMountedRef();

  return React.useCallback(
    async ({ mode, codec, uid: uidConfig, appId, token, channel }: JoinConfig) => {
      const uid = isNaN(Number(uidConfig)) ? null : Number(uidConfig);

      // Creates a new agora client with given parameters.
      // mode can be 'rtc' for real time communications or 'live' for live broadcasting.
      const client = AgoraRTC.createClient({ mode, codec });
      dispatch({ type: ACTION_JOIN_REQUEST, client });
      try {
        // initializes the client with appId
        await client.init(appId);
        // joins a channel with a token, channel, user id
        await client.join(token, channel, uid);
        // create a ne stream
        const stream = AgoraRTC.createStream({
          streamID: uid ?? undefined,
          video: true,
          audio: true,
          screen: false,
        });
        // Initalize the stream
        await stream.init();
        // Publish the stream to the channel.
        await client.publish(stream);

        // Set the state appropriately
        if (mountedRef.current) {
          dispatch({ type: ACTION_JOIN_SUCCESS, info: `Joined channel ${channel}` });
        }
      } catch (err) {
        if (mountedRef.current) {
          dispatch({ type: ACTION_JOIN_FAILURE, error: `Failed to join, ${err}` });
        }
      }
    },
    [dispatch, mountedRef]
  );
}

// Publish function to publish the stream to Agora. No need to invoke this after join.
// This is to be invoke only after an unpublish
function usePublish(dispatch: React.Dispatch<Action>) {
  const mountedRef = useMountedRef();

  return React.useCallback(
    async (client?: IClientWithPromise, localStream?: Stream) => {
      if (client == null) {
        dispatch({ type: ACTION_PUBLISH_FAILURE, error: 'Failed to publish, client not exists' });
        return;
      }

      if (localStream == null) {
        dispatch({ type: ACTION_PUBLISH_FAILURE, error: 'Failed to publish, stream not exists' });
        return;
      }

      dispatch({ type: ACTION_PUBLISH_REQUEST });
      try {
        // Publish the stream to the channel.
        await client.publish(localStream);

        if (mountedRef.current) {
          dispatch({ type: ACTION_PUBLISH_SUCCESS, info: 'Stream published' });
        }
      } catch (err) {
        if (mountedRef.current) {
          dispatch({ type: ACTION_PUBLISH_FAILURE, error: `Failed to publish, ${err}` });
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
    async (client?: IClientWithPromise, localStream?: Stream) => {
      if (client == null) {
        dispatch({ type: ACTION_LEAVE_FAILURE, error: 'Failed to publish, client not exists' });
        return;
      }

      if (localStream == null) {
        dispatch({ type: ACTION_LEAVE_FAILURE, error: 'Failed to publish, stream not exists' });
        return;
      }

      dispatch({ type: ACTION_LEAVE_REQUEST });
      try {
        // Closes the local stream. This de-allocates the resources and turns off the camera light
        localStream.close();
        // unpublish the stream from the client
        client.unpublish(localStream);
        // leave the channel
        await client.leave();

        if (mountedRef.current) {
          dispatch({ type: ACTION_LEAVE_SUCCESS, info: 'Left channel' });
        }
      } catch (err) {
        if (mountedRef.current) {
          dispatch({ type: ACTION_LEAVE_FAILURE, error: `Failed to leave, ${err}` });
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
    async (client?: IClientWithPromise, localStream?: Stream) => {
      if (client == null) {
        dispatch({ type: ACTION_UNPUBLISH_FAILURE, error: 'Failed to publish, client not exists' });
        return;
      }

      if (localStream == null) {
        dispatch({ type: ACTION_UNPUBLISH_FAILURE, error: 'Failed to publish, stream not exists' });
        return;
      }

      dispatch({ type: ACTION_UNPUBLISH_REQUEST });
      try {
        // unpublish the stream from the client
        await client.unpublish(localStream);

        if (mountedRef.current) {
          dispatch({ type: ACTION_UNPUBLISH_SUCCESS, info: 'Stream unpublished' });
        }
      } catch (err) {
        if (mountedRef.current) {
          dispatch({ type: ACTION_UNPUBLISH_FAILURE, error: `Failed to unpublish, ${err}` });
        }
      }
    },
    [dispatch, mountedRef]
  );
}

/*****************************************************************************
 * Default Export
 *****************************************************************************/
export default function useClient(): [State, ActionDispatcher] {
  const [state, dispatch] = React.useReducer(reducer, initialState);

  const join = useJoin(dispatch);
  const publish = usePublish(dispatch);
  const leave = useLeave(dispatch);
  const unpublish = useUnpublish(dispatch);
  const api = { join, publish, leave, unpublish };

  return [state, api];
}
