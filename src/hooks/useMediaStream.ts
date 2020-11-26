import * as React from 'react';
import { Stream } from 'agora-rtc-sdk';
import { IClientWithPromise } from 'agoran-awe/types/promisify';

/*****************************************************************************
 * Constants
 *****************************************************************************/
const subscribeOptions = {
  video: true,
  audio: true,
};

/*****************************************************************************
 * Types
 *****************************************************************************/
type Callback = (evt: Event) => void;
type Event = {
  uid: string;
  stream?: Stream;
};

/*****************************************************************************
 * Default Export
 *****************************************************************************/
export default function useMediaStream(
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
      client.on('stream-published', addLocal);
      client.on('stream-added', doSub);
      client.on('stream-subscribed', addRemote);
      client.on('peer-leave', removeRemote);
      client.on('stream-removed', removeRemote);
    }

    return () => {
      mounted = false;
      // Maintains the list of users based on the various network events.
      if (client) {
        client.off('stream-published', addLocal);
        client.off('stream-added', doSub);
        client.off('stream-subscribed', addRemote);
        client.off('peer-leave', removeRemote);
        client.off('stream-removed', removeRemote);
      }
    };
  }, [client, filter]);

  return [localStream, remoteStreamList];
}
