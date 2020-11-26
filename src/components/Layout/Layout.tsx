import * as React from 'react';
import { Typography, Layout as UILayout } from 'antd';

import style from './style.less';

const { Header, Content } = UILayout;

interface Props {
  title?: string;
}

const Layout: React.FC<Props> = (props) => {
  const { title, children } = props;

  return (
    <UILayout className={style.layout}>
      <Header className={style.header}>
        <Typography.Title level={3} className={style.title}>
          {title}
        </Typography.Title>
      </Header>
      <Content className={style.content}>{children}</Content>
    </UILayout>
  );
};

export default Layout;
