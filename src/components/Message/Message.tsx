import * as React from 'react';
import { message } from 'antd';

export interface Props {
  type: 'info' | 'error';
  message?: string;
}

const Message: React.FC<Props> = (props) => {
  const { type, message: text } = props;

  React.useEffect(() => {
    if (text) message[type](text);
  }, [type, text]);

  return null;
};

export default Message;
