import { registerSW } from 'virtual:pwa-register';

registerSW({
  immediate: true,
  onRegisteredSW(swScriptUrl?: string) {
    console.log('SW registered:', swScriptUrl);
  },
  onOfflineReady() {
    console.log('Nexus Captions ready to work offline');
  },
  onNeedRefresh() {
    console.log('New content available');
  }
});
