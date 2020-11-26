import * as React from 'react';
import { Stream } from 'agora-rtc-sdk';

import useAgoraClient, { API, State } from './hooks';

type RenderProps = (
  state: State,
  api: API,
  localStream: Stream | undefined,
  remoteStreamList: Stream[]
) => React.ReactElement | null;

export interface Props {
  children: RenderProps;
}

const AgoraClient: React.FC<Props> = (props) => {
  const { children } = props;
  const { state, api, localStream, remoteStreamList } = useAgoraClient();

  return children(state, api, localStream, remoteStreamList);
};

export default AgoraClient;
