import type { ImageRef } from './types';

/**
 * Temporary editorial photography, self-hosted in /public/images/stock.
 *
 * Every file is licensed for commercial use under the Pexels License or the Unsplash License
 * (no attribution required; credits kept anyway). People and places shown are not DSM staff,
 * clients or locations. Anything under STOCK_PREFIX is treated as temporary: the admin flags it
 * and offers one-click replacement with the owner's own photography.
 */
export const STOCK_PREFIX = '/images/stock/';

export const isTemporaryPhoto = (src: string) => src.startsWith(STOCK_PREFIX);

type Credit = { source: 'Pexels' | 'Unsplash'; photographer: string; page: string };

export const PHOTO_CREDITS: Record<string, Credit> = {
  'hero-earpiece': { source: 'Pexels', photographer: 'Berke Bayur', page: 'https://www.pexels.com/photo/security-personnel-with-earpiece-in-focus-38702227/' },
  'lobby-motion': { source: 'Pexels', photographer: 'Zerrin Velizade', page: 'https://www.pexels.com/photo/black-and-white-photo-of-people-walking-in-a-large-building-18592586/' },
  'glass-door': { source: 'Pexels', photographer: 'Ron Lach', page: 'https://www.pexels.com/photo/a-man-standing-on-an-open-door-8060024/' },
  'street-patrol': { source: 'Pexels', photographer: 'Majd Al Assaad', page: 'https://www.pexels.com/photo/security-guard-walking-down-sunlit-urban-street-34112051/' },
  'reception-minimal': { source: 'Pexels', photographer: 'DOAN THANH BINH', page: 'https://www.pexels.com/photo/modern-office-reception-desk-design-36631639/' },
  'reception-bell': { source: 'Pexels', photographer: 'cottonbro studio', page: 'https://www.pexels.com/photo/close-up-of-gold-bell-on-desk-5378701/' },
  'entrance-night': { source: 'Pexels', photographer: 'Nikolai Lapshin', page: 'https://www.pexels.com/photo/men-in-blue-long-sleeve-uniforms-standing-outside-a-glass-door-8285775/' },
  'facade-cameras': { source: 'Pexels', photographer: 'Francesco Ungaro', page: 'https://www.pexels.com/photo/modern-office-building-facade-with-security-cameras-28493328/' },
  'camera-white-wall': { source: 'Pexels', photographer: 'Pixabay', page: 'https://www.pexels.com/photo/grey-bullet-camera-274895/' },
  'turnstiles-lobby': { source: 'Pexels', photographer: 'Pixabay', page: 'https://www.pexels.com/photo/stainless-steel-tubular-tool-164586/' },
  'corridor-light': { source: 'Pexels', photographer: 'Victor Lucas', page: 'https://www.pexels.com/photo/man-walking-down-a-corridor-19614086/' },
  'facade-grid': { source: 'Pexels', photographer: 'H&CO', page: 'https://www.pexels.com/photo/wall-in-a-modern-building-25881421/' },
  'tower-lattice': { source: 'Pexels', photographer: 'Julian Largo', page: 'https://www.pexels.com/photo/modern-skyscraper-with-geometric-facade-32163468/' },
  'cranes-dusk': { source: 'Unsplash', photographer: 'Samuel Regan-Asante', page: 'https://unsplash.com/photos/construction-cranes-over-building-site-g9A2llpDObU' },
  'rebar-inspection': { source: 'Unsplash', photographer: 'Toni Reed', page: 'https://unsplash.com/photos/construction-worker-inspects-rebar-on-a-building-site-dSjrv4w1g1Q' },
  'event-security': { source: 'Unsplash', photographer: 'Avesta', page: 'https://unsplash.com/photos/security-guard-watches-over-a-gathering-under-a-tent-YQ9aFeawqeo' },
  conference: { source: 'Unsplash', photographer: 'Teemu Paananen', page: 'https://unsplash.com/photos/person-discussing-while-standing-in-front-of-a-large-screen-in-front-of-people-inside-dim-lighted-room-bzdhc5b3Bxs' },
  'park-aerial': { source: 'Unsplash', photographer: 'User_Pascal', page: 'https://unsplash.com/photos/aerial-view-of-a-charming-neighborhood-with-a-pond-h23KdMNAy6Q' },
  'cabin-lake': { source: 'Unsplash', photographer: 'Barnabas Davoti', page: 'https://unsplash.com/photos/a-cabin-sits-on-a-lake-in-a-forest-NE3MbC4WoqU' },
  'store-guard': { source: 'Unsplash', photographer: 'atelierbyvineeth', page: 'https://unsplash.com/photos/security-guard-wearing-a-reflective-vest-in-a-store-WyoErwOE0Oc' },
  'retail-interior': { source: 'Unsplash', photographer: 'Zooey Li', page: 'https://unsplash.com/photos/modern-retail-store-interior-with-display-shelves-and-products-lkDZJL5psKU' },
  'control-room': { source: 'Unsplash', photographer: 'Tasha Kostyuk', page: 'https://unsplash.com/photos/a-man-sitting-in-front-of-multiple-monitors-TtMKq3lJm-U' },
  'card-reader': { source: 'Unsplash', photographer: 'Jakub Żerdzicki', page: 'https://unsplash.com/photos/a-card-reader-and-a-dark-door-are-visible-pLD-QID7x3k' },
  'risk-whiteboard': { source: 'Unsplash', photographer: 'ThisisEngineering', page: 'https://unsplash.com/photos/two-colleagues-discussing-ideas-at-whiteboard-uOhBxB23Wao' },
  'plan-drawing': { source: 'Unsplash', photographer: 'Daniel McCullough', page: 'https://unsplash.com/photos/an-architect-working-on-a-draft-with-a-pencil-and-ruler-HtBlQdxfG9k' },
  'lobby-gates': { source: 'Unsplash', photographer: 'Zoshua Colah', page: 'https://unsplash.com/photos/a-modern-lobby-with-pillars-and-a-security-gate-goyJ2pxJjrg' },
};

const stock = (file: keyof typeof PHOTO_CREDITS, alt: string, focus?: string): ImageRef => ({
  src: `${STOCK_PREFIX}${file}.jpg`,
  alt,
  ...(focus ? { focus } : {}),
});

export const photos = {
  heroEarpiece: stock('hero-earpiece', 'Beveiligingsprofessional met oortje, van opzij gezien', '62% 45%'),
  lobbyMotion: stock('lobby-motion', 'Mensen lopen door een lichte, glazen kantoorhal'),
  glassDoor: stock('glass-door', 'Man in pak kijkt vanuit een open glazen deur naar buiten', '50% 40%'),
  streetPatrol: stock('street-patrol', 'Beveiliger loopt over een straat met strepen zonlicht', '55% 40%'),
  receptionMinimal: stock('reception-minimal', 'Lichte, minimalistische receptiebalie in een kantoor', '50% 62%'),
  receptionBell: stock('reception-bell', 'Receptiebel op een balie'),
  entranceNight: stock('entrance-night', 'Twee beveiligers bij de glazen entree van een gebouw in de avond', '50% 45%'),
  facadeCameras: stock('facade-cameras', 'Kantoorgevel met beveiligingscamera’s'),
  cameraWhiteWall: stock('camera-white-wall', 'Beveiligingscamera aan een witte gevel', '20% 30%'),
  turnstilesLobby: stock('turnstiles-lobby', 'Toegangspoortjes in een lichte marmeren lobby', '50% 65%'),
  corridorLight: stock('corridor-light', 'Persoon loopt door een lichte gang van een modern gebouw'),
  facadeGrid: stock('facade-grid', 'Witte gevel met een strak raster van ramen'),
  towerLattice: stock('tower-lattice', 'Kantoortoren met een geometrische gevel'),
  cranesDusk: stock('cranes-dusk', 'Bouwplaats met torenkranen bij schemering', '40% 50%'),
  rebarInspection: stock('rebar-inspection', 'Medewerker controleert wapening op een bouwplaats'),
  eventSecurity: stock('event-security', 'Beveiliger houdt toezicht bij een evenement onder een tent', '70% 35%'),
  conference: stock('conference', 'Zakelijk evenement met presentatie op een groot scherm'),
  parkAerial: stock('park-aerial', 'Luchtfoto van een groen recreatiepark met vijver'),
  cabinLake: stock('cabin-lake', 'Vakantiewoning aan het water tussen de bomen'),
  storeGuard: stock('store-guard', 'Beveiliger op de winkelvloer', '70% 40%'),
  retailInterior: stock('retail-interior', 'Licht en overzichtelijk winkelinterieur'),
  controlRoom: stock('control-room', 'Meldkamer met een wand vol monitoren'),
  cardReader: stock('card-reader', 'Toegangspaslezer naast een deur'),
  riskWhiteboard: stock('risk-whiteboard', 'Twee professionals bespreken een plan aan een whiteboard'),
  planDrawing: stock('plan-drawing', 'Bouwtekening wordt beoordeeld aan tafel'),
  lobbyGates: stock('lobby-gates', 'Lichte kantoorlobby met toegangspoortjes', '62% 50%'),
} satisfies Record<string, ImageRef>;
