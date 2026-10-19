import { photos } from './photos';
import { defaultServices } from './services';
import type { SiteContent } from './types';

const emptyImage = { src: '', alt: '' };

/**
 * Default content, taken from the client's approved document. Supabase stores edited
 * versions of each section; anything missing there falls back to these values.
 * Contact details are intentionally empty: the document does not supply them.
 */
export const defaultContent: SiteContent = {
  settings: {
    companyName: 'Dedicated Security Management B.V.',
    tagline: 'Uw veiligheid, onze verantwoordelijkheid.',
    email: '',
    phone: '',
    address: '',
    postalCity: '',
    kvk: '',
    notificationEmail: '',
    linkedin: '',
    instagram: '',
    facebook: '',
    logo: emptyImage,
    footerText:
      'Professionele beveiligingsoplossingen voor bedrijven, organisaties, evenementen en uiteenlopende locaties.',
    seoTitle: 'Dedicated Security Management B.V. | Uw veiligheid, onze verantwoordelijkheid',
    seoDescription:
      'Dedicated Security Management B.V. biedt professionele beveiligingsoplossingen voor bedrijven, organisaties, evenementen en uiteenlopende locaties: van objectbewaking tot risicoanalyses.',
    ogImage: emptyImage,
  },

  home: {
    hero: {
      eyebrow: 'Dedicated Security Management B.V.',
      title: 'Uw veiligheid,',
      titleAccent: 'onze verantwoordelijkheid.',
      lead: 'Professionele beveiligingsoplossingen voor bedrijven, organisaties, evenementen en uiteenlopende locaties.',
      body: 'Wij begrijpen dat iedere situatie vraagt om een passende aanpak. Daarom denken wij met onze opdrachtgevers mee en bieden wij beveiligingsdiensten die aansluiten op hun specifieke wensen en veiligheidsbehoeften.',
      primaryCta: { label: 'Bekijk onze diensten', href: '/diensten' },
      secondaryCta: { label: 'Vraag vrijblijvend een offerte aan', href: '/offerte' },
      image: photos.lobbyGates,
      caption: 'Toegang, overzicht en verantwoordelijkheid',
    },
    experience: {
      eyebrow: 'Over ons',
      title: 'Gebouwd op ervaring.',
      titleAccent: 'Gedreven door veiligheid.',
      paragraphs: [
        'Dedicated Security Management B.V. is een beveiligingsorganisatie die voortbouwt op jarenlange praktijkervaring binnen de beveiligingsbranche.',
        'De onderneming ontwikkelde zich vanuit Dedicated Solution Services, waar ervaring werd opgedaan met beveiligingswerkzaamheden, receptiediensten en hospitality. Daarnaast deed de oprichter ervaring op als Security Specialist binnen een grote internationale corporate omgeving, met verantwoordelijkheden op het gebied van security en safety rondom personeel en bedrijfsmiddelen.',
        'Die combinatie van operationele praktijk en corporate verantwoordelijkheid vormt de basis van onze aanpak.',
      ],
      milestones: [
        {
          label: 'Fase 01',
          title: 'Dedicated Solution Services',
          text: 'Succesvolle jaren als eenmanszaak, met ervaring in beveiliging, receptiediensten en hospitality.',
        },
        {
          label: 'Fase 02',
          title: 'Corporate security & safety',
          text: 'Ervaring als Security Specialist binnen een grote internationale corporate omgeving.',
        },
        {
          label: 'Fase 03',
          title: 'Dedicated Security Management B.V.',
          text: 'Een volgende fase waarin professionaliteit, kwaliteit en een toekomstgerichte aanpak centraal staan.',
        },
      ],
      imagePrimary: photos.officerAtGates,
      imageSecondary: photos.turnstiles,
    },
    philosophy: {
      eyebrow: 'Veiligheid begint bij een doordachte aanpak',
      statement: 'Goede beveiliging gaat verder dan alleen fysieke aanwezigheid.',
      paragraphs: [
        'Het draait om het herkennen van risico’s, het voorkomen van incidenten en het creëren van een omgeving waarin medewerkers, bezoekers en eigendommen optimaal worden beschermd.',
        'Bij Dedicated Security Management B.V. staat een preventieve en professionele aanpak centraal. Wij kijken niet alleen naar de beveiligingsbehoefte van vandaag, maar ook naar mogelijke risico’s die zich in de toekomst kunnen voordoen.',
      ],
      principles: [
        'Preventief handelen waar mogelijk.',
        'Veiligheidsrisico’s tijdig signaleren.',
        'Duidelijke communicatie met opdrachtgevers.',
        'Een professionele en representatieve uitstraling.',
        'Beveiligingsoplossingen afgestemd op de locatie en organisatie.',
      ],
      image: photos.darkEntrance,
    },
    servicesIntro: {
      eyebrow: 'Onze diensten',
      title: 'Negen disciplines. Eén verantwoordelijkheid.',
      text: 'Van een tijdelijke bouwplaats tot een permanent object en van een besloten bijeenkomst tot een risicoanalyse: iedere dienst heeft een eigen aanpak.',
    },
    layers: {
      eyebrow: 'Beveiliging in lagen',
      title: 'Mensen, eigendommen en processen.',
      text: 'Een veilige organisatie ontstaat wanneer fysieke beveiliging, toezicht en duidelijke afspraken op elkaar aansluiten. Selecteer een laag om te zien waar onze aandacht naar uitgaat.',
      items: [
        {
          title: 'Mensen',
          summary: 'De veiligheid van medewerkers, bezoekers en andere betrokkenen.',
          points: [
            'Ontvangst en registratie van bezoekers',
            'Toezicht op bezoekersstromen',
            'Signaleren van spanningen en ongewenst gedrag',
          ],
        },
        {
          title: 'Eigendommen',
          summary: 'Bescherming van gebouwen, terreinen, materialen en bedrijfsmiddelen.',
          points: [
            'Toezicht binnen en rondom de locatie',
            'Controle van afsluitingen, hekken en toegangspunten',
            'Openings- en sluitrondes',
          ],
        },
        {
          title: 'Processen',
          summary: 'Risicobeoordeling, toegangsbeheer, procedures en incidentafhandeling.',
          points: [
            'Risicoanalyses en preventieve maatregelen',
            'Duidelijke afspraken over verantwoordelijkheden',
            'Handelen volgens incident- en calamiteitenprocedures',
          ],
        },
      ],
    },
    process: {
      eyebrow: 'Onze werkwijze',
      title: 'Van veiligheidsvraagstuk naar passende beveiliging.',
      text: 'Geen enkele locatie, organisatie of opdracht is hetzelfde. Daarom begint een goede samenwerking met het begrijpen van uw organisatie en de bijbehorende veiligheidsbehoeften.',
      steps: [
        {
          title: 'Kennismaking en inventarisatie',
          text: 'Tijdens een eerste gesprek brengen wij uw wensen, aandachtspunten en mogelijke veiligheidsrisico’s in kaart. Hierbij kijken wij onder andere naar de locatie, bezoekersstromen, aanwezige eigendommen en de gewenste beveiligingstijden.',
        },
        {
          title: 'Risicobeoordeling en beveiligingsadvies',
          text: 'Op basis van de inventarisatie beoordelen wij welke beveiligingsmaatregelen passend zijn. Denk hierbij aan toegangscontrole, fysieke aanwezigheid, controlerondes of cameratoezicht.',
        },
        {
          title: 'Een beveiligingsplan op maat',
          text: 'Wij werken de voorgestelde aanpak uit in duidelijke afspraken over werkzaamheden, verantwoordelijkheden, communicatie en de afhandeling van eventuele incidenten.',
        },
        {
          title: 'Uitvoering en toezicht',
          text: 'De beveiligingswerkzaamheden worden uitgevoerd volgens de gemaakte afspraken, met aandacht voor preventie, veiligheid en professioneel optreden.',
        },
        {
          title: 'Evaluatie en optimalisatie',
          text: 'Veiligheidsbehoeften kunnen veranderen. Daarom is het belangrijk om de beveiligingsaanpak waar nodig te evalueren en aan te passen aan nieuwe omstandigheden of risico’s.',
        },
      ],
    },
    sectors: {
      eyebrow: 'Sectoren',
      title: 'Voor welke sectoren werken wij?',
      text: 'Onze dienstverlening kan aansluiten op de beveiligingsbehoeften van verschillende branches.',
      items: [
        { title: 'Bouw en vastgoed', text: 'Bescherming van bouwlocaties, vastgoedobjecten en bedrijfsterreinen.', image: photos.cranesDusk },
        { title: 'Zakelijke dienstverlening', text: 'Toegangscontrole, receptiediensten en beveiliging van kantooromgevingen.', image: photos.receptionWarm },
        { title: 'Retail en winkelcentra', text: 'Toezicht en preventieve beveiliging in winkels en commerciële ruimtes.', image: photos.retailInterior },
        { title: 'Evenementen en bijeenkomsten', text: 'Beveiliging bij zakelijke evenementen, festivals, beurzen en besloten bijeenkomsten.', image: photos.eventLobby },
        { title: 'Recreatie en vrijetijdsbesteding', text: 'Toezicht op recreatieterreinen, vakantieparken en bezoekerslocaties.', image: photos.parkAerial },
      ],
    },
    bespoke: {
      eyebrow: 'Beveiliging op maat',
      title: 'Een beveiligingsoplossing die bij uw organisatie past.',
      paragraphs: [
        'Naast de diensten die u op onze website vindt, biedt Dedicated Security Management B.V. ook de mogelijkheid om een volledig op maat samengesteld bewakings- of beveiligingstraject te verzorgen.',
        'Wij kijken samen met u naar de specifieke veiligheidsbehoeften, mogelijke risico’s en gewenste beveiligingsmaatregelen.',
      ],
      factors: [
        'De aard en omvang van uw organisatie',
        'De locatie en bijbehorende risico’s',
        'De gewenste beveiligingsmomenten',
        'De aanwezigheid van medewerkers en bezoekers',
        'Bestaande veiligheidsmaatregelen',
        'De doelstellingen en het beschikbare budget',
      ],
      closing: 'Wilt u met ons in gesprek over de mogelijkheden? Neem dan geheel vrijblijvend contact met ons op.',
      image: photos.glassFacade,
    },
    closing: {
      title: 'Veiligheid vraagt om de juiste partner.',
      paragraphs: [
        'Of het nu gaat om de beveiliging van een bouwplaats, een evenement, een bedrijfspand of een andere locatie: iedere opdracht verdient een zorgvuldige en professionele aanpak.',
        'Dedicated Security Management B.V. denkt graag met u mee over passende beveiligingsoplossingen.',
      ],
      primaryCta: { label: 'Vraag een offerte aan', href: '/offerte' },
      secondaryCta: { label: 'Neem contact op', href: '/contact' },
      image: photos.towers,
    },
  },

  services: defaultServices,

  about: {
    hero: {
      eyebrow: 'Over Dedicated Security Management B.V.',
      title: 'Gebouwd op ervaring.',
      titleAccent: 'Gericht op veiligheid.',
      lead: 'Een beveiligingsorganisatie die voortbouwt op jarenlange praktijkervaring binnen de beveiligingsbranche.',
      image: photos.towers,
    },
    intro: {
      title: 'Veiligheid vraagt om aandacht, deskundigheid en de juiste aanpak.',
      paragraphs: [
        'Bij Dedicated Security Management B.V. staan veiligheid, betrouwbaarheid en professionaliteit centraal. Wij richten ons op het bieden van passende beveiligingsoplossingen voor verschillende sectoren.',
        'Daarbij vinden wij persoonlijk contact, heldere communicatie en een zorgvuldige aanpak belangrijk. Onze doelstelling is om opdrachtgevers te ondersteunen bij het creëren en behouden van een veilige omgeving.',
      ],
    },
    origin: {
      eyebrow: 'Onze ontwikkeling',
      title: 'Van ervaring naar verdere professionalisering.',
      chapters: [
        {
          label: 'Hoofdstuk 01',
          title: 'De basis ligt in de praktijk',
          text: 'Na succesvolle jaren als eenmanszaak onder de naam Dedicated Solution Services is ervaring opgedaan met beveiligingswerkzaamheden, receptiediensten en hospitality. Door die praktijkervaring begrijpen wij dat iedere opdrachtgever andere wensen, uitdagingen en veiligheidsrisico’s kent.',
        },
        {
          label: 'Hoofdstuk 02',
          title: 'Corporate verantwoordelijkheid',
          text: 'De oprichter deed daarnaast ervaring op als Security Specialist binnen een grote internationale corporate omgeving, met verantwoordelijkheden op het gebied van security en safety rondom personeel en bedrijfsmiddelen.',
        },
        {
          label: 'Hoofdstuk 03',
          title: 'Dedicated Security Management B.V.',
          text: 'De overgang naar Dedicated Security Management B.V. markeert een nieuwe fase. Met behoud van de opgedane kennis, praktijkervaring en persoonlijke betrokkenheid bouwen wij verder aan een organisatie die klaar is voor de beveiligingsvraagstukken van vandaag en morgen.',
        },
      ],
      image: photos.officerAtGates,
    },
    expertise: {
      eyebrow: 'Professionele expertise',
      title: 'Operationele beveiliging en veiligheidsmanagement.',
      paragraphs: [
        'Of het nu gaat om objectbewaking, bouwplaatsbeveiliging, evenementenbeveiliging of veiligheidskundig advies: wij geloven in een aanpak die aansluit bij de specifieke behoeften van iedere organisatie.',
      ],
      areas: [
        { title: 'Operationele beveiliging', text: 'Toezicht, toegangscontrole, controlerondes en professioneel optreden op locatie.' },
        { title: 'Security & safety', text: 'Aandacht voor de veiligheid van personeel en de bescherming van bedrijfsmiddelen.' },
        { title: 'Preventie', text: 'Risico’s vroegtijdig herkennen en preventief handelen waar mogelijk.' },
        { title: 'Risicoanalyse', text: 'Veiligheidsrisico’s inventariseren, beoordelen en vertalen naar passende maatregelen.' },
      ],
      image: photos.riskWhiteboard,
    },
    mission: {
      title: 'Onze missie',
      paragraphs: [
        'Het bieden van betrouwbare, professionele en doelgerichte beveiligingsoplossingen, waarbij preventie, deskundigheid en persoonlijke betrokkenheid centraal staan.',
        'Wij streven ernaar om niet alleen veiligheidsrisico’s te beheersen, maar ook langdurige en waardevolle samenwerkingen met onze opdrachtgevers op te bouwen.',
      ],
    },
    vision: {
      title: 'Onze visie',
      paragraphs: [
        'Veiligheid vormt de basis voor een goed functionerende organisatie.',
        'Wij geloven dat effectieve beveiliging begint bij het begrijpen van risico’s, het maken van duidelijke afspraken en het inzetten van passende beveiligingsmaatregelen.',
      ],
    },
    values: {
      eyebrow: 'Onze visie op veiligheid',
      title: 'Professioneel. Alert. Betrokken.',
      paragraphs: [
        'Wij geloven dat effectieve beveiliging ontstaat door een combinatie van deskundigheid, verantwoordelijkheidsgevoel en duidelijke communicatie.',
        'Een beveiliger moet niet alleen kunnen optreden wanneer zich een incident voordoet, maar ook beschikken over het vermogen om risico’s vroegtijdig te herkennen en preventief te handelen.',
        'Daarbij vinden wij een professionele houding, respectvolle omgang met mensen en samenwerking met opdrachtgevers essentieel.',
      ],
      statement:
        'Beveiliging moet niet alleen zichtbaar aanwezig zijn, maar daadwerkelijk bijdragen aan een veiligere omgeving.',
    },
    future: {
      title: 'Klaar voor de vraagstukken van morgen.',
      paragraphs: [
        'Dedicated Security Management B.V. wil zich verder ontwikkelen als een professionele en betrokken beveiligingspartner voor organisaties die waarde hechten aan kwaliteit, betrouwbaarheid en een persoonlijke aanpak.',
      ],
    },
    gallery: [photos.lobbyGates, photos.cranesDusk, photos.reception, photos.cameraFacade],
    closing: {
      title: 'Samen zorgen we voor een veilige omgeving.',
      text: 'Bent u op zoek naar een betrouwbare beveiligingspartner? Dedicated Security Management B.V. denkt graag met u mee. Neem vrijblijvend contact met ons op en ontdek welke beveiligingsoplossing het beste aansluit bij uw situatie.',
      cta: { label: 'Vraag vrijblijvend een offerte aan', href: '/offerte' },
    },
  },

  faq: {
    eyebrow: 'Veelgestelde vragen',
    title: 'Antwoorden op de meest gestelde vragen.',
    items: [
      {
        question: 'Welke beveiligingsdiensten biedt Dedicated Security Management B.V. aan?',
        answer:
          'Wij richten ons op verschillende vormen van beveiliging, waaronder bouwplaatsbeveiliging, evenementenbeveiliging, receptiediensten, recreatiebeveiliging, objectbewaking, winkelsurveillance, cameratoezicht en beveiliging op maat. Daarnaast vormt veiligheidskundig advies een onderdeel van ons dienstenaanbod.',
      },
      {
        question: 'Is beveiliging op maat mogelijk?',
        answer:
          'Ja. Niet iedere organisatie heeft dezelfde beveiligingsbehoeften. Wij bespreken graag welke diensten en maatregelen passend zijn bij uw situatie.',
      },
      {
        question: 'Kan ik beveiliging aanvragen voor een tijdelijke opdracht?',
        answer:
          'De mogelijkheden zijn afhankelijk van de aard, duur, locatie en omvang van de opdracht. Neem contact met ons op om de mogelijkheden te bespreken.',
      },
      {
        question: 'Kan ik verschillende beveiligingsdiensten combineren?',
        answer:
          'Ja, afhankelijk van de situatie kan een gecombineerde beveiligingsaanpak wenselijk zijn. Denk aan objectbewaking in combinatie met cameratoezicht of toegangscontrole.',
      },
      {
        question: 'Hoe vraag ik een offerte aan?',
        answer:
          'U kunt via het offerteformulier uw wensen en de benodigde beveiligingsdienst aangeven. Op basis van uw aanvraag kan worden besproken welke aanpak passend is.',
      },
      {
        question: 'Wat is het verschil tussen beveiliging en een risicoanalyse?',
        answer:
          'Beveiliging richt zich op het uitvoeren van maatregelen om personen en eigendommen te beschermen. Een risicoanalyse richt zich op het herkennen en beoordelen van mogelijke gevaren en kwetsbaarheden. De resultaten kunnen worden gebruikt om gerichte beveiligingsmaatregelen te bepalen.',
      },
    ],
  },

  contact: {
    hero: {
      eyebrow: 'Contact',
      title: 'Samen zorgen we voor',
      titleAccent: 'een veilige omgeving.',
      lead: 'Bent u op zoek naar een betrouwbare beveiligingspartner? Dedicated Security Management B.V. denkt graag met u mee.',
      image: photos.meetingRoom,
    },
    formTitle: 'Stuur ons een bericht',
    formIntro: 'Heeft u een vraag of wilt u de mogelijkheden bespreken? Laat uw gegevens achter, dan nemen wij contact met u op.',
    quoteTitle: 'Vraag vrijblijvend een offerte aan',
    quoteIntro:
      'Geef aan welke beveiligingsdienst u zoekt en waar de opdracht plaatsvindt. Op basis van uw aanvraag bespreken wij welke aanpak passend is.',
    quoteImage: photos.facadeLight,
    confirmationTitle: 'Bedankt voor uw aanvraag.',
    confirmationText: 'Wij hebben uw aanvraag ontvangen en nemen zo snel mogelijk contact met u op om de mogelijkheden te bespreken.',
    privacyNote:
      'Wij gebruiken uw gegevens uitsluitend om uw aanvraag te behandelen en contact met u op te nemen.',
  },
};
