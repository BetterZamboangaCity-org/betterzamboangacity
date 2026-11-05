import { fetchEmergencyFacilities, type EmergencyFacility } from '../lib/supabase';

let emergencyFacilities: EmergencyFacility[] = [];

async function loadDynamicFacilities() {
  const res = await fetchEmergencyFacilities();
  if (res.data && res.data.length > 0) {
    emergencyFacilities = res.data;
  }
}

let map: any = null;
let mapMarkers: Record<string, any> = {};
let userMarker: any = null;
let activeMapCategory = 'all';
let mapSearchQuery = '';
let userPos: { lat: number; lng: number } | null = null;

function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

function getCategoryPinColor(cat: string): string {
  switch(cat) {
    case 'hospital': return '#e11d48'; // rose-600
    case 'police': return '#2563eb'; // blue-600
    case 'fire': return '#dc2626'; // red-600
    case 'rescue': return '#059669'; // emerald-600
    default: return '#475569';
  }
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

function getBadgeColor(cat: string): string {
  switch(cat) {
    case 'hospital': return 'bg-rose-50 text-rose-700 border-rose-200';
    case 'police': return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'fire': return 'bg-red-50 text-red-700 border-red-200';
    case 'rescue': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    default: return 'bg-slate-100 text-slate-700 border-slate-200';
  }
}

function renderSidebarList() {
  const listContainer = document.getElementById('facility-sidebar-list');
  const counterText = document.getElementById('map-counter-text');
  if (!listContainer) return;

  let items = emergencyFacilities.filter(f => {
    const matchesCat = activeMapCategory === 'all' || f.category === activeMapCategory;
    const matchesQuery = !mapSearchQuery || 
      f.name.toLowerCase().includes(mapSearchQuery) || 
      f.address.toLowerCase().includes(mapSearchQuery) ||
      f.phone.toLowerCase().includes(mapSearchQuery);
    return matchesCat && matchesQuery;
  });

  if (userPos) {
    items = items.map(f => ({
      ...f,
      distance: calculateDistanceKm(userPos!.lat, userPos!.lng, f.lat, f.lng)
    })).sort((a, b) => (a.distance || 0) - (b.distance || 0));
  }

  if (counterText) {
    counterText.textContent = `Showing ${items.length} of ${emergencyFacilities.length} emergency facilities`;
  }

  if (items.length === 0) {
    listContainer.innerHTML = `<div class="p-4 text-center text-xs text-slate-500">No matching facilities found.</div>`;
    return;
  }

  listContainer.innerHTML = items.map(f => {
    const badgeClass = getBadgeColor(f.category);
    const distBadge = (f as any).distance !== undefined ? 
      `<span class="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">${(f as any).distance} km away</span>` : '';

    const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${f.lat},${f.lng}${userPos ? `&origin=${userPos.lat},${userPos.lng}` : ''}`;

    return `
      <div 
        class="facility-card p-3 rounded-xl bg-white hover:bg-slate-100/80 border border-slate-200 transition-all cursor-pointer shadow-2xs group"
        data-fac-id="${f.id}"
        data-lat="${f.lat}"
        data-lng="${f.lng}"
      >
        <div class="flex items-start justify-between gap-2 mb-1">
          <span class="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
            ${f.name}
          </span>
          ${distBadge}
        </div>
        
        <div class="flex items-center gap-2 text-[11px] text-slate-500 mb-2">
          <span class="px-1.5 py-0.5 rounded text-[10px] uppercase font-mono font-medium border ${badgeClass}">
            ${f.catLabel}
          </span>
          <span class="truncate">${f.address}</span>
        </div>

        <div class="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
          <div class="text-[11px] font-mono text-slate-700 flex items-center gap-1">
            <svg class="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
            </svg>
            <span>${f.phone}</span>
          </div>

          <a
            href="${directionsUrl}"
            target="_blank"
            rel="noopener noreferrer"
            class="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-semibold transition-colors flex items-center gap-1 shrink-0"
            onclick="event.stopPropagation();"
          >
            <svg class="w-3 h-3 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
            </svg>
            <span>Directions</span>
          </a>
        </div>
      </div>
    `;
  }).join('');
}

function updateMapMarkers() {
  if (!map || !(window as any).L) return;

  emergencyFacilities.forEach(f => {
    const matchesCat = activeMapCategory === 'all' || f.category === activeMapCategory;
    const matchesQuery = !mapSearchQuery || 
      f.name.toLowerCase().includes(mapSearchQuery) || 
      f.address.toLowerCase().includes(mapSearchQuery);

    const marker = mapMarkers[f.id];
    if (marker) {
      if (matchesCat && matchesQuery) {
        if (!map.hasLayer(marker)) marker.addTo(map);
      } else {
        if (map.hasLayer(marker)) map.removeLayer(marker);
      }
    }
  });

  renderSidebarList();
}

function initLeafletMap() {
  const L = (window as any).L;
  if (!L || map) return;

  const mapContainer = document.getElementById('leaflet-emergency-map');
  if (!mapContainer) return;

  const zamboangaBounds = L.latLngBounds(
    [6.75, 121.80],
    [7.45, 122.35]
  );

  map = L.map('leaflet-emergency-map', {
    zoomControl: false,
    maxBounds: zamboangaBounds,
    maxBoundsViscosity: 1.0,
    minZoom: 10,
    maxZoom: 18
  }).setView([6.9214, 122.0790], 12);

  L.control.zoom({ position: 'topright' }).addTo(map);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    minZoom: 10,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);

  emergencyFacilities.forEach((f) => {
    const pinColor = getCategoryPinColor(f.category);
    const iconSvg = getCategoryPinSvg(f.category);

    const customIcon = L.divIcon({
      className: 'custom-leaflet-marker',
      html: `
        <div style="
          background-color: ${pinColor};
          width: 26px;
          height: 26px;
          border-radius: 50%;
          border: 2px solid white;
          box-shadow: 0 2px 6px rgba(0,0,0,0.25);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          ${iconSvg}
        </div>
      `,
      iconSize: [26, 26],
      iconAnchor: [13, 13],
      popupAnchor: [0, -13]
    });

    const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${f.lat},${f.lng}`;

    const popupContent = `
      <div style="font-family: system-ui, sans-serif; padding: 4px; max-width: 220px;">
        <div style="font-weight: 700; font-size: 13px; color: #0f172a; margin-bottom: 2px;">
          ${f.name}
        </div>
        <div style="font-size: 11px; color: #64748b; margin-bottom: 6px;">
          ${f.address}
        </div>
        <div style="font-size: 11px; font-weight: 600; color: #334155; font-family: monospace; margin-bottom: 8px;">
          Contact: ${f.phone}
        </div>
        <a
          href="${directionsUrl}"
          target="_blank"
          rel="noopener noreferrer"
          style="
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 4px;
            width: 100%;
            text-align: center;
            padding: 6px 10px;
            background-color: #0f172a;
            color: white;
            border-radius: 6px;
            font-size: 11px;
            font-weight: 600;
            text-decoration: none;
          "
        >
          <svg style="width:12px;height:12px;fill:none;stroke:white;stroke-width:2;" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
          </svg>
          <span>Get Directions</span>
        </a>
      </div>
    `;

    const marker = L.marker([f.lat, f.lng], { icon: customIcon })
      .addTo(map)
      .bindPopup(popupContent);

    mapMarkers[f.id] = marker;
  });

  renderSidebarList();
}

function loadLeafletScript(callback: () => void) {
  if ((window as any).L) {
    callback();
    return;
  }
  const script = document.createElement('script');
  script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
  script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
  script.crossOrigin = '';
  script.onload = callback;
  document.head.appendChild(script);
}

function setupMapInteractivity() {
  document.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest('.map-filter-btn') as HTMLElement | null;
    if (!btn) return;

    const filterBtns = document.querySelectorAll('.map-filter-btn');
    filterBtns.forEach(b => {
      b.classList.remove('bg-slate-900', 'text-white', 'border-slate-900');
      b.classList.add('bg-white', 'text-slate-700', 'border-slate-200');
    });
    btn.classList.remove('bg-white', 'text-slate-700', 'border-slate-200');
    btn.classList.add('bg-slate-900', 'text-white', 'border-slate-900');

    activeMapCategory = btn.getAttribute('data-map-filter') || 'all';
    updateMapMarkers();
  });

  document.addEventListener('input', (e) => {
    const target = e.target as HTMLElement;
    if (target && target.id === 'map-search-input') {
      mapSearchQuery = (target as HTMLInputElement).value.toLowerCase().trim();
      updateMapMarkers();
    }
  });

  document.addEventListener('click', (e) => {
    const card = (e.target as HTMLElement).closest('.facility-card') as HTMLElement | null;
    if (!card) return;

    const facId = card.getAttribute('data-fac-id');
    const lat = parseFloat(card.getAttribute('data-lat') || '0');
    const lng = parseFloat(card.getAttribute('data-lng') || '0');

    if (map && lat && lng) {
      map.flyTo([lat, lng], 15, { duration: 1.2 });
      if (facId && mapMarkers[facId]) {
        mapMarkers[facId].openPopup();
      }
    }
  });

  const geoBtn = document.getElementById('geo-locate-btn');
  const geoStatus = document.getElementById('user-geo-status');

  if (geoBtn) {
    geoBtn.addEventListener('click', () => {
      if (!navigator.geolocation) {
        alert('Geolocation is not supported by your browser.');
        return;
      }

      if (geoStatus) geoStatus.textContent = 'Locating...';

      navigator.geolocation.getCurrentPosition((pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        userPos = { lat, lng };

        if (geoStatus) geoStatus.textContent = 'Location Active';

        const L = (window as any).L;
        if (map && L) {
          if (userMarker) map.removeLayer(userMarker);

          const userIcon = L.divIcon({
            className: 'user-location-marker',
            html: `
              <div style="
                background-color: #0284c7;
                width: 20px;
                height: 20px;
                border-radius: 50%;
                border: 3px solid white;
                box-shadow: 0 0 10px rgba(2, 132, 199, 0.6);
              "></div>
            `,
            iconSize: [20, 20],
            iconAnchor: [10, 10]
          });

          userMarker = L.marker([lat, lng], { icon: userIcon })
            .addTo(map)
            .bindPopup('<div style="font-weight:700; font-size:12px; color:#0f172a;">Your Current Location</div>')
            .openPopup();

          map.flyTo([lat, lng], 14, { duration: 1.5 });
        }

        renderSidebarList();
      }, (err) => {
        console.warn('Geolocation error:', err.message);
        if (geoStatus) geoStatus.textContent = 'Location access denied';
      });
    });
  }
}

let activePoliceSector = 'all';
let activeFireSector = 'all';

function filterPolice() {
  const policeSearch = document.getElementById('police-search') as HTMLInputElement | null;
  const policeCards = document.querySelectorAll('.police-card');
  const query = policeSearch ? policeSearch.value.toLowerCase().trim() : '';

  policeCards.forEach(card => {
    const text = card.textContent?.toLowerCase() || '';
    const sector = card.getAttribute('data-sector') || '';

    const matchesQuery = !query || text.includes(query);
    const matchesSector = activePoliceSector === 'all' || sector === activePoliceSector;

    if (matchesQuery && matchesSector) {
      (card as HTMLElement).style.display = '';
    } else {
      (card as HTMLElement).style.display = 'none';
    }
  });
}

function filterFire() {
  const fireSearch = document.getElementById('fire-search') as HTMLInputElement | null;
  const fireCards = document.querySelectorAll('.fire-card');
  const query = fireSearch ? fireSearch.value.toLowerCase().trim() : '';

  fireCards.forEach(card => {
    const text = card.textContent?.toLowerCase() || '';
    const sector = card.getAttribute('data-sector') || '';

    const matchesQuery = !query || text.includes(query);
    const matchesSector = activeFireSector === 'all' || sector === activeFireSector;

    if (matchesQuery && matchesSector) {
      (card as HTMLElement).style.display = '';
    } else {
      (card as HTMLElement).style.display = 'none';
    }
  });
}

export function initDisasterInteractive() {
  document.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest('[data-copy-phone]');
    if (!btn) return;
    
    const phone = btn.getAttribute('data-copy-phone');
    if (!phone) return;

    navigator.clipboard.writeText(phone).then(() => {
      const copyIcon = btn.querySelector('.copy-icon');
      const checkIcon = btn.querySelector('.check-icon');

      if (copyIcon && checkIcon) {
        copyIcon.classList.add('hidden');
        checkIcon.classList.remove('hidden');
        setTimeout(() => {
          copyIcon.classList.remove('hidden');
          checkIcon.classList.add('hidden');
        }, 2000);
      }
    }).catch(err => {
      console.error('Failed to copy phone number:', err);
    });
  });

  document.addEventListener('input', (e) => {
    const target = e.target as HTMLElement;
    if (target && target.id === 'police-search') {
      filterPolice();
    } else if (target && target.id === 'fire-search') {
      filterFire();
    }
  });

  document.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest('.police-filter-btn, .fire-filter-btn') as HTMLElement | null;
    if (!btn) return;

    if (btn.classList.contains('police-filter-btn')) {
      const policeFilterBtns = document.querySelectorAll('.police-filter-btn');
      policeFilterBtns.forEach(b => {
        b.classList.remove('bg-blue-600', 'text-white', 'border-blue-600');
        b.classList.add('bg-white', 'text-slate-600', 'border-slate-200');
      });
      btn.classList.remove('bg-white', 'text-slate-600', 'border-slate-200');
      btn.classList.add('bg-blue-600', 'text-white', 'border-blue-600');
      activePoliceSector = btn.getAttribute('data-filter') || 'all';
      filterPolice();
    } else if (btn.classList.contains('fire-filter-btn')) {
      const fireFilterBtns = document.querySelectorAll('.fire-filter-btn');
      fireFilterBtns.forEach(b => {
        b.classList.remove('bg-red-600', 'text-white', 'border-red-600');
        b.classList.add('bg-white', 'text-slate-600', 'border-slate-200');
      });
      btn.classList.remove('bg-white', 'text-slate-600', 'border-slate-200');
      btn.classList.add('bg-red-600', 'text-white', 'border-red-600');
      activeFireSector = btn.getAttribute('data-filter') || 'all';
      filterFire();
    }
  });

  loadLeafletScript(async () => {
    await loadDynamicFacilities();
    initLeafletMap();
    setupMapInteractivity();
  });
}

if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDisasterInteractive);
  } else {
    initDisasterInteractive();
  }
}
