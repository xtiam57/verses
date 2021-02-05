import { useContext } from 'react';
import { PresenterContext } from 'providers/presenter';

export function usePresenter() {
  const { toggle, close, presenter, setLastBroadcast } = useContext(
    PresenterContext
  );
  return { toggle, close, presenter, setLastBroadcast };
}
