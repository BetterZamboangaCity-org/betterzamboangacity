import { fetchEmergencyFacilities, type EmergencyFacility } from '../lib/supabase';

let leafletLoading: Promise<any> | null = null;

function loadLeaflet(): Promise<any> {
  if ((window as any).L) return Promise.resolve((window as any).L);
  if (leafletLoading) return leafletLoading;
  leafletLoading = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    const timeout = window.setTimeout(() => finish(new Error('Map loading timed out.')), 15000);
    function finish(error?: Error) {
      window.clearTimeout(timeout);
      script.onload = null;
      script.onerror = null;
      if (error || !(window as any).L) {
        script.remove();
        reject(error || new Error('Map library is unavailable.'));
      } else resolve((window as any).L);
    }
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
    script.crossOrigin = '';
    script.onload = () => finish();
    script.onerror = () => finish(new Error('Map library could not load.'));
    document.head.append(script);
  }).catch(error => {
    leafletLoading = null;
    throw error;
  });
  return leafletLoading;
}

function element(tag: string, className = '', text?: string): HTMLElement {
  const node = document.createElement(tag);
  node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function hasCoordinates(f: { lat: number; lng: number }): boolean {
  return Number.isFinite(f.lat) && Number.isFinite(f.lng) && Math.abs(f.lat) <= 90 &&
    Math.abs(f.lng) <= 180 && (f.lat !== 0 || f.lng !== 0);
}

function directionsUrl(f: { lat: number; lng: number }, origin: { lat: number; lng: number } | null): string | null {
  if (!hasCoordinates(f)) return null;
  const url = new URL('https://www.google.com/maps/dir/');
  url.searchParams.set('api', '1');
  url.searchParams.set('destination', `${f.lat},${f.lng}`);
  if (origin && hasCoordinates(origin)) url.searchParams.set('origin', `${origin.lat},${origin.lng}`);
  return url.href;
}

function phoneUrl(phone: string): string | null {
  if (!/^[+\d\s().-]+$/.test(phone)) return null;
  const number = phone.replace(/[^+\d]/g, '');
  return /^\+?\d+$/.test(number) ? `tel:${number}` : null;
}

function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const radians = Math.PI / 180;
  const value = Math.sin((b.lat - a.lat) * radians / 2) ** 2 +
    Math.cos(a.lat * radians) * Math.cos(b.lat * radians) * Math.sin((b.lng - a.lng) * radians / 2) ** 2;
  return Math.round(6371 * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value)) * 10) / 10;
}

function getCategoryPinSvg(cat: string): string {
  switch(cat) {
    case 'hospital':
      return `<svg style="width:14px;height:14px;fill:white;" viewBox="0 0 24 24"><path d="M19 10.5h-5.5V5h-3v5.5H5v3h5.5V19h3v-5.5H19v-3z"/></svg>`;
    case 'police':
      return `<svg style="width:14px;height:14px;fill:none;stroke:white;stroke-width:2.2;" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>`;
    case 'fire':
      return `<svg style="width:14px;height:14px;fill:none;stroke:white;stroke-width:2.2;" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"/></svg>`;
    case 'rescue':
      return `<svg style="width:14px;height:14px;fill:none;stroke:white;stroke-width:2.2;" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"/></svg>`;
    default:
      return `<svg style="width:14px;height:14px;fill:white;" viewBox="0 0 24 24"><circle cx="12" cy="12" r="6"/></svg>`;
  }
}

const categoryColors: Record<string, string> = {
  hospital: '#e11d48', police: '#2563eb', fire: '#dc2626', rescue: '#059669',
};

function createDirectory(root: HTMLElement): () => void {
  const controller = new AbortController();
  const { signal } = controller;
  const current = () => !signal.aborted && root.isConnected;
  const status = root.querySelector<HTMLElement>('#directory-status')!;
  const list = root.querySelector<HTMLElement>('#facility-sidebar-list')!;
  const counter = root.querySelector<HTMLElement>('#map-counter-text')!;
  const geoStatus = root.querySelector<HTMLElement>('#user-geo-status')!;
  const geoButton = root.querySelector<HTMLButtonElement>('#geo-locate-btn')!;
  const timers = new Set<number>();
  let facilities: EmergencyFacility[] = [];
  let map: any = null;
  let library: any = null;
  let userMarker: any = null;
  const markers = new Map<string, any>();
  let category = 'all';
  let query = '';
  let policeSector = 'all';
  let fireSector = 'all';
  let userPosition: { lat: number; lng: number } | null = null;
  let locationRequest = 0;

  function matches(f: EmergencyFacility): boolean {
    return (category === 'all' || f.category === category) &&
      (!query || [f.name, f.address, f.phone].some(value => String(value || '').toLowerCase().includes(query)));
  }

  function facilityContent(f: EmergencyFacility, popup = false): HTMLElement {
    const card = element('div', popup ? 'space-y-2 p-1 font-sans' :
      'facility-card p-3 rounded-xl bg-white border border-slate-200 shadow-xs space-y-2');
    card.dataset.facId = String(f.id);
    const title = element(popup || !map || !hasCoordinates(f) ? 'div' : 'button',
      'text-left text-xs font-bold text-slate-900 break-words', String(f.name || 'Unnamed facility'));
    if (title instanceof HTMLButtonElement) {
      title.type = 'button';
      title.dataset.facility = String(f.id);
      title.classList.add('hover:text-blue-600', 'cursor-pointer');
      title.setAttribute('aria-label', `Show ${f.name} on map`);
    }
    card.append(title);
    card.append(element('div', 'text-[10px] uppercase font-semibold text-slate-500', String(f.catLabel || f.category || 'Facility')));
    card.append(element('div', 'text-[11px] text-slate-600 break-words', String(f.address || 'Address unavailable')));
    if (userPosition && hasCoordinates(f)) {
      card.append(element('div', 'text-[10px] text-emerald-800 font-mono', `${distanceKm(userPosition, f)} km away`));
    }
    const actions = element('div', 'flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-2');
    const phone = String(f.phone || '');
    const call = phoneUrl(phone);
    const contact = element(call ? 'a' : 'span', 'text-[11px] font-mono text-slate-700 break-all', phone || 'Phone unavailable');
    if (contact instanceof HTMLAnchorElement && call) contact.href = call;
    actions.append(contact);
    const url = directionsUrl(f, userPosition);
    if (url) {
      const link = element('a', 'px-2.5 py-1 rounded bg-slate-900 text-white text-[11px] font-semibold', 'Directions') as HTMLAnchorElement;
      link.href = url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      actions.append(link);
    } else actions.append(element('span', 'text-[11px] text-slate-500', 'Location unavailable'));
    card.append(actions);
    return card;
  }

  function render() {
    if (!current()) return;
    const visible = facilities.filter(matches);
    if (userPosition) visible.sort((a, b) =>
      (hasCoordinates(a) ? distanceKm(userPosition!, a) : Infinity) -
      (hasCoordinates(b) ? distanceKm(userPosition!, b) : Infinity));
    list.replaceChildren(...visible.map(f => facilityContent(f)));
    if (!visible.length) list.append(element('p', 'p-4 text-center text-xs text-slate-500', 'No matching facilities found.'));
    counter.textContent = `Showing ${visible.length} of ${facilities.length} emergency facilities`;
    for (const f of facilities) {
      const marker = markers.get(String(f.id));
      if (!marker) continue;
      if (matches(f)) {
        if (!map.hasLayer(marker)) marker.addTo(map);
        marker.setPopupContent(facilityContent(f, true));
      } else if (map.hasLayer(marker)) map.removeLayer(marker);
    }
  }

  function initMap() {
    if (!current() || !library || map) return;
    map = library.map(root.querySelector('#leaflet-emergency-map'), {
      zoomControl: false, maxBounds: [[6.75, 121.80], [7.45, 122.35]],
      maxBoundsViscosity: 1, minZoom: 10, maxZoom: 18,
    }).setView([6.9214, 122.0790], 12);
    library.control.zoom({ position: 'topright' }).addTo(map);
    library.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);
    for (const f of facilities) {
      if (!hasCoordinates(f)) continue;
      const color = Object.hasOwn(categoryColors, f.category) ? categoryColors[f.category] : '#475569';
      const icon = library.divIcon({
        className: 'custom-leaflet-marker',
        html: `<div style="background:${color};width:26px;height:26px;border-radius:50%;border:2px solid white;box-shadow:0 2px 6px #0004;display:flex;align-items:center;justify-content:center">${getCategoryPinSvg(f.category)}</div>`,
        iconSize: [26, 26], iconAnchor: [13, 13], popupAnchor: [0, -13],
      });
      markers.set(String(f.id), library.marker([f.lat, f.lng], { icon }).addTo(map).bindPopup(facilityContent(f, true)));
    }
    showUserLocation();
    render();
  }

  function showUserLocation() {
    if (!map || !userPosition) return;
    if (userMarker) map.removeLayer(userMarker);
    userMarker = library.marker([userPosition.lat, userPosition.lng]).addTo(map).bindPopup(element('div', '', 'Your current location'));
    map.flyTo([userPosition.lat, userPosition.lng], 14);
  }

  function filterStations(kind: 'police' | 'fire') {
    const search = root.querySelector<HTMLInputElement>(`#${kind}-search`)!.value.toLowerCase().trim();
    const sector = kind === 'police' ? policeSector : fireSector;
    root.querySelectorAll<HTMLElement>(`.${kind}-card`).forEach(card => {
      card.hidden = !((!search || card.textContent?.toLowerCase().includes(search)) &&
        (sector === 'all' || card.dataset.sector === sector));
    });
  }

  function selectButton(button: HTMLElement, selector: string, activeClasses: string[], inactiveClasses: string[]) {
    root.querySelectorAll<HTMLElement>(selector).forEach(item => {
      const selected = item === button;
      item.classList.remove(...activeClasses, ...inactiveClasses);
      item.classList.add(...(selected ? activeClasses : inactiveClasses));
      item.setAttribute('aria-pressed', String(selected));
    });
  }

  root.addEventListener('input', event => {
    const input = event.target;
    if (!(input instanceof HTMLInputElement)) return;
    if (input.id === 'map-search-input') { query = input.value.toLowerCase().trim(); render(); }
    if (input.id === 'police-search') filterStations('police');
    if (input.id === 'fire-search') filterStations('fire');
  }, { signal });

  root.addEventListener('click', async event => {
    if (!(event.target instanceof Element)) return;
    const button = event.target.closest<HTMLElement>('button');
    if (!button) return;
    if (button.matches('.map-filter-btn')) {
      category = button.dataset.mapFilter || 'all';
      selectButton(button, '.map-filter-btn', ['bg-slate-900', 'text-white', 'border-slate-900'], ['bg-white', 'text-slate-700', 'border-slate-200']);
      render();
    }
    if (button.matches('.police-filter-btn, .fire-filter-btn')) {
      const kind = button.matches('.police-filter-btn') ? 'police' : 'fire';
      if (kind === 'police') policeSector = button.dataset.filter || 'all';
      else fireSector = button.dataset.filter || 'all';
      const color = kind === 'police' ? 'blue' : 'red';
      selectButton(button, `.${kind}-filter-btn`, [`bg-${color}-600`, 'text-white', `border-${color}-600`], ['bg-white', 'text-slate-600', 'border-slate-200']);
      filterStations(kind);
    }
    if (button.dataset.facility && map) {
      const f = facilities.find(item => String(item.id) === button.dataset.facility);
      if (f && hasCoordinates(f)) { map.flyTo([f.lat, f.lng], 15); markers.get(String(f.id))?.openPopup(); }
    }
    if (button.hasAttribute('data-copy-phone')) {
      const phone = button.dataset.copyPhone;
      if (!phone) return;
      try {
        await navigator.clipboard.writeText(phone);
        if (!current()) return;
        status.textContent = 'Phone number copied.';
        button.querySelector('.copy-icon')?.classList.add('hidden');
        button.querySelector('.check-icon')?.classList.remove('hidden');
        const timer = window.setTimeout(() => {
          timers.delete(timer);
          if (!current()) return;
          button.querySelector('.copy-icon')?.classList.remove('hidden');
          button.querySelector('.check-icon')?.classList.add('hidden');
        }, 2000);
        timers.add(timer);
      } catch {
        if (current()) status.textContent = 'Could not copy. Select and copy the phone number.';
      }
    }
  }, { signal });

  geoButton.addEventListener('click', () => {
    if (!navigator.geolocation) { geoStatus.textContent = 'Location is not supported by this browser.'; return; }
    const request = ++locationRequest;
    geoButton.disabled = true;
    geoStatus.textContent = 'Locating…';
    navigator.geolocation.getCurrentPosition(position => {
      if (!current() || request !== locationRequest) return;
      geoButton.disabled = false;
      const location = { lat: position.coords.latitude, lng: position.coords.longitude };
      if (!hasCoordinates(location)) { geoStatus.textContent = 'Your location is unavailable.'; return; }
      userPosition = location;
      geoStatus.textContent = 'Nearest facilities listed first.';
      showUserLocation();
      render();
    }, error => {
      if (!current() || request !== locationRequest) return;
      geoButton.disabled = false;
      geoStatus.textContent = error.code === 1 ? 'Location access denied. Use search instead.' :
        error.code === 3 ? 'Location request timed out. Try again.' : 'Your location is unavailable. Use search instead.';
    }, { timeout: 10000, maximumAge: 60000 });
  }, { signal });

  // Static contacts and search remain usable while either dependency loads.
  const facilitiesReady = fetchEmergencyFacilities(signal).then(result => {
    if (!current()) return;
    facilities = result.data;
    render();
  });
  const mapReady = loadLeaflet().then(result => { if (current()) library = result; });
  Promise.all([facilitiesReady, mapReady]).then(() => initMap()).catch(() => {
    if (current()) status.textContent = 'Map unavailable. Use the facility list and emergency phone numbers below.';
  });

  return () => {
    controller.abort();
    locationRequest++;
    timers.forEach(timer => window.clearTimeout(timer));
    timers.clear();
    map?.remove();
    map = null;
    markers.clear();
  };
}

let directoryRoot: HTMLElement | null = null;
let dispose: (() => void) | null = null;
function cleanup() {
  dispose?.();
  dispose = null;
  directoryRoot = null;
}
export function initDisasterInteractive() {
  const root = document.getElementById('disaster-directory');
  if (root && root === directoryRoot) return;
  cleanup();
  if (!root) return;
  directoryRoot = root;
  dispose = createDirectory(root);
}
document.addEventListener('astro:before-swap', cleanup);
document.addEventListener('astro:page-load', initDisasterInteractive);
if (document.readyState !== 'loading') initDisasterInteractive();
