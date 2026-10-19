import { useFlag, useFlagsStatus, type IConfig } from '@unleash/proxy-client-react';
import { userId } from './identity';

const url = import.meta.env.VITE_UNLEASH_URL as string | undefined;
const clientKey = import.meta.env.VITE_UNLEASH_CLIENT_KEY as string | undefined;

/** Null when Unleash isn't configured: main.tsx then mounts no FlagProvider and every flag reads as off. */
export const unleashConfig: IConfig | null =
  url && clientKey ? { url, clientKey, appName: 'aidlc-coffee', refreshInterval: 15, context: { userId } } : null;

// Chosen once at load so hook order never changes between renders; useFlag needs a FlagProvider.
export const useFeature: (name: string) => boolean = unleashConfig ? (name) => useFlag(name) : () => false;
export const useFlagsReady: () => boolean = unleashConfig ? () => useFlagsStatus().flagsReady : () => true;

/** "Your usual" reorder card. Read once in App.tsx; off means the shop behaves exactly like main. */
export const REORDER_USUAL_FLAG = 'coffee-reorder-usual';
export const useReorderUsual = (): boolean => useFeature(REORDER_USUAL_FLAG);
