import * as React from 'react';
import { Card, Col, Row, message } from 'antd';
import StreamPlayer from 'agora-stream-player';

// import { useCamera, useMicrophone } from '~/hooks/useDevice';
import useMediaStream from '~/hooks/useMediaStream';
import useArgoraClient from '~/hooks/useArgoraClient';
import AgoraRTC from '~/utils/agora-rtc-egine';
import Layout from '~/components/Layout';
import AgoraClientConfig, { Config } from '~/components/AgoraClientConfig';

/*****************************************************************************
 * Constants
 *****************************************************************************/
const DEFAULT_CONFIG: Config = {
  appId: 'e9bb530bcd13499cbbfe965bce9443cc',
  channel: '1',
  token:
    '006e9bb530bcd13499cbbfe965bce9443ccIADjDwgd0TzsZ3CseaWVjEurpLZTDEzll4AC7JDXY5+hhrfv3IMAAAAAEACVypXNEB/BXwEAAQAPH8Ff',
  mode: 'live',
  codec: 'vp8',
};

/*****************************************************************************
 * Default Export
 *****************************************************************************/
export default function App(): ReturnType<React.FC> {
  const [state, api] = useArgoraClient();
  const [localStream, remoteStreamList] = useMediaStream(state.client);

  React.useEffect(() => {
    if (state.info) message.info(state.info);
  }, [state.info]);

  React.useEffect(() => {
    if (state.error) message.error(state.error);
  }, [state.error]);

  return (
    <Layout>
      <Row gutter={[16, 16]}>
        <Col xs={24} md={6}>
          <AgoraClientConfig
            defaultConfig={DEFAULT_CONFIG}
            joined={state.joined}
            published={state.published}
            onJoin={api.join}
            onPublish={api.publish}
            onLeave={api.leave}
            onUnpublish={api.unpublish}
          />
        </Col>
        <Col xs={24} md={18}>
          <Card>
            {localStream && <StreamPlayer stream={localStream} fit="contain" label="local" />}
            {remoteStreamList.map((stream) => (
              <StreamPlayer
                key={stream.getId()}
                stream={stream}
                fit="contain"
                label={stream.getId()}
              />
            ))}
          </Card>
        </Col>
      </Row>
    </Layout>
  );
}
