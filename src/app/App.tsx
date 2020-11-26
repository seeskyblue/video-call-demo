import * as React from 'react';
import { Card, Col, Row } from 'antd';
import StreamPlayer from 'agora-stream-player';

import Layout from '~/components/Layout';
import AgoraClient from '~/components/AgoraClient';
import AgoraClientConfig, { Config } from '~/components/AgoraClientConfig';
import Message from '~/components/Message';

/*****************************************************************************
 * Constants
 *****************************************************************************/
const DEFAULT_CONFIG: Partial<Config> = {
  mode: 'live',
  codec: 'vp8',
};

const GUTTER = 10;

/*****************************************************************************
 * Default Export
 *****************************************************************************/
export default function App(): ReturnType<React.FC> {
  return (
    <Layout title="Video Call">
      <AgoraClient>
        {(state, api, localStream, remoteStreamList) => (
          <>
            <Row gutter={[GUTTER, GUTTER]}>
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
                  {localStream && (
                    <StreamPlayer
                      stream={localStream}
                      fit="contain"
                      label={`locale(${localStream.getId()})`}
                    />
                  )}
                  {remoteStreamList.map((stream) => {
                    const uid = stream.getId();
                    return <StreamPlayer key={uid} stream={stream} fit="contain" label={uid} />;
                  })}
                </Card>
              </Col>
            </Row>
            <Message type="info" message={state.info} />
            <Message type="error" message={state.error} />
          </>
        )}
      </AgoraClient>
    </Layout>
  );
}
