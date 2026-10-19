import { useEffect } from 'react';
import { useUnleashClient } from '@unleash/proxy-client-react';
import { setFlagSnapshot } from '../lib/analytics';

/** Keeps the analytics flag snapshot in step with what Unleash says is on for this user. */
export function FlagSnapshot() {
  const client = useUnleashClient();
  useEffect(() => {
    const sync = () =>
      setFlagSnapshot(
        Object.fromEntries(
          client
            .getAllToggles()
            .filter((t) => t.enabled)
            .map((t) => [t.name, t.variant?.enabled ? t.variant.name : 'on']),
        ),
      );
    client.on('ready', sync);
    client.on('update', sync);
    return () => {
      client.off('ready', sync);
      client.off('update', sync);
    };
  }, [client]);
  return null;
}
