/* eslint-disable @typescript-eslint/no-explicit-any */
declare module '*.less' {
  const classes: { [key: string]: string };
  export default classes;
}

declare module 'agora-stream-player' {
  const StreamPlayer: any;
  export default StreamPlayer;
}
