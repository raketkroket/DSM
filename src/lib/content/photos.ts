import type { ImageRef } from './types';

/**
 * Temporary editorial photography (Unsplash licence). Every image here is only a default:
 * the owner replaces them through /admin/media and the content editor.
 */
const unsplash = (id: string, alt: string, focus?: string): ImageRef => ({
  src: `https://images.unsplash.com/${id}?auto=format&fit=crop&w=2400&q=80`,
  alt,
  ...(focus ? { focus } : {}),
});

export const photos = {
  officerAtGates: unsplash('photo-1485230405346-71acb9518d9c', 'Beveiligingsmedewerker bij de toegangspoortjes van een kantoorlobby', '34% 50%'),
  lobbyGates: unsplash('photo-1749310726959-d8fccfef7ee4', 'Lichte kantoorlobby met toegangspoortjes en natuurstenen wanden', '62% 50%'),
  darkEntrance: unsplash('photo-1743947197290-445abda983c9', 'Toegangspoortjes in een donkere, moderne entree'),
  glassFacade: unsplash('photo-1523477593243-78bbf626fd3b', 'Glazen gevel van een modern kantoorgebouw'),
  towers: unsplash('photo-1486406146926-c627a92ad1ab', 'Kantoortorens van onderaf gezien'),
  glassCeiling: unsplash('photo-1525119488448-d549af0dc221', 'Glazen dakconstructie met stalen lijnen'),
  facadeLight: unsplash('photo-1490351267196-b7a67e26e41b', 'Lichte glazen gevel in zonlicht'),
  cranesDusk: unsplash('photo-1599995903128-531fc7fb694b', 'Bouwplaats met torenkranen bij schemering', '40% 50%'),
  rebarInspection: unsplash('photo-1768677903496-becc4be07258', 'Medewerker inspecteert wapening op een bouwplaats'),
  conference: unsplash('photo-1505373877841-8d25f7d46678', 'Zakelijk evenement met presentatie op een groot scherm'),
  eventLobby: unsplash('photo-1560439514-4e9645039924', 'Bezoekers in de lobby van een evenementenlocatie'),
  reception: unsplash('photo-1758448721205-8465cebc26af', 'Representatieve receptiebalie in een kantoorlobby'),
  receptionWarm: unsplash('photo-1758448093806-88b2089068ab', 'Lichte ontvangstruimte met receptiebalie'),
  parkAerial: unsplash('photo-1747077885559-352fca2e3e45', 'Luchtfoto van een groen recreatiepark met vijver'),
  cabinLake: unsplash('photo-1749063240044-82d7db59879d', 'Vakantiewoning aan het water tussen de bomen'),
  officeNight: unsplash('photo-1645497781181-d6684ebd1863', 'Verlicht kantoorgebouw in de avond', '50% 40%'),
  warehouse: unsplash('photo-1772299121503-cd62a57e3a26', 'Ruime bedrijfshal met medewerkers in veiligheidsvesten'),
  storeGuard: unsplash('photo-1773580995586-b0195c43386c', 'Beveiliger op de winkelvloer', '70% 40%'),
  retailInterior: unsplash('photo-1771033834141-023d630b3965', 'Licht en overzichtelijk winkelinterieur'),
  cameraFacade: unsplash('photo-1767059439535-10d3f5e6ad35', 'Beveiligingscamera aan een paal voor een kantoorgebouw', '70% 50%'),
  cameraCorner: unsplash('photo-1765121689322-6befc57dc8db', 'Beveiligingscamera op een witte gevel'),
  cardReader: unsplash('photo-1754494977436-a5c202306fe4', 'Toegangspaslezer naast een deur in een betonnen gang'),
  riskWhiteboard: unsplash('photo-1581091877018-dac6a371d50f', 'Twee professionals bespreken een plan aan een whiteboard'),
  planDrawing: unsplash('photo-1503387762-592deb58ef4e', 'Bouwtekening wordt beoordeeld aan tafel'),
  meetingRoom: unsplash('photo-1497366811353-6870744d04b2', 'Lichte vergaderruimte met grote ramen'),
  turnstiles: unsplash('photo-1773581923711-e4769dce0383', 'Rvs toegangspoortjes en geleiderails'),
} satisfies Record<string, ImageRef>;
