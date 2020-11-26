import * as React from 'react';

export default function useMountedRef(): React.MutableRefObject<boolean | null> {
  const mountedRef = React.useRef<boolean | null>(null);

  React.useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return mountedRef;
}
