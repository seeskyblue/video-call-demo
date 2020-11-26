import * as React from 'react';
import { ClientConfig } from 'agora-rtc-sdk';
import { Button, Card, Col, Form, Input, Radio, Row, Select } from 'antd';

import style from './style.less';

import { useCamera, useMicrophone } from '~/hooks/useDevice';

/*****************************************************************************
 * Constants
 *****************************************************************************/
const GUTTER = 10;

/*****************************************************************************
 * Types
 *****************************************************************************/
export type Config = {
  mode: ClientConfig['mode'];
  codec: ClientConfig['codec'];
  uid?: string | number;
  appId: string;
  channel: string;
  token: string;
  cameraId?: string;
  microphoneId?: string;
};

export interface Props {
  defaultConfig: Partial<Config>;
  joined?: boolean;
  published?: boolean;
  onJoin: (config: Config) => void;
  onLeave: () => void;
  onPublish: () => void;
  onUnpublish: () => void;
}

/*****************************************************************************
 * Default Export
 *****************************************************************************/
const AgoraClientConfig: React.FC<Props> = (props) => {
  const {
    defaultConfig: initialValues,
    joined = false,
    published = false,
    onJoin,
    onLeave,
    onPublish,
    onUnpublish,
  } = props;

  const cameras = useCamera();
  const microphones = useMicrophone();

  const [form] = Form.useForm();

  const handleJoin = () => {
    onJoin(form.getFieldsValue());
  };

  return (
    <Form form={form} initialValues={initialValues} layout="vertical">
      <Row gutter={[GUTTER, GUTTER]}>
        <Col span={24}>
          <Card
            className={style.card}
            title="Connect Settings"
            actions={[
              <Button
                key="joinleave"
                className={style.action}
                type="primary"
                size="large"
                block
                danger={joined}
                onClick={joined ? onLeave : handleJoin}
              >
                {joined ? 'Leave' : 'Join'}
              </Button>,
              <Button
                key="publishunpublish"
                className={style.action}
                type="text"
                size="large"
                block
                danger={published}
                onClick={published ? onUnpublish : onPublish}
              >
                {published ? 'Unpublish' : 'Publish'}
              </Button>,
            ]}
          >
            <Form.Item name="appId" label="App ID" required>
              <Input />
            </Form.Item>
            <Form.Item name="channel" label="Channel" required>
              <Input />
            </Form.Item>
            <Form.Item name="token" label="Token" required>
              <Input.TextArea />
            </Form.Item>
          </Card>
        </Col>
        <Col span={24}>
          <Card className={style.card}>
            <Form.Item name="uid" label="UID">
              <Input />
            </Form.Item>
            <Form.Item name="mode" label="Mode">
              <Radio.Group>
                <Radio value="live">live</Radio>
                <Radio value="rtc">rtc</Radio>
              </Radio.Group>
            </Form.Item>
            <Form.Item name="codec" label="Codec">
              <Radio.Group>
                <Radio value="vp8">vp8</Radio>
                <Radio value="h264">h264</Radio>
              </Radio.Group>
            </Form.Item>
            <Form.Item name="cameraId" label="Camera">
              <Select>
                {cameras.map((item) => (
                  <Select.Option key={item.deviceId} value={item.deviceId}>
                    {item.label}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name="microphoneId" label="Microphone">
              <Select>
                {microphones.map((item) => (
                  <Select.Option key={item.deviceId} value={item.deviceId}>
                    {item.label}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Card>
        </Col>
      </Row>
    </Form>
  );
};

export default AgoraClientConfig;
