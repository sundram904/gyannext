let loadPromise = null;

export function loadJitsiScript() {
  if (window.JitsiMeetExternalAPI) return Promise.resolve();
  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://meet.jit.si/external_api.js';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Could not load the live class service. Check your connection.'));
    document.body.appendChild(script);
  });

  return loadPromise;
}
