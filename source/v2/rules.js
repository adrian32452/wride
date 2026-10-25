/* ---------- Rules: checked against official and reliable sources on 25 Oct 2026 ----------
   lv: act = can mean a fine or being turned back; watch = depends on weather or alerts; info = good to know */
const RULES_CHECKED = '2026-10-25';
const PREP = [
  ['act', 'Fit four winter tyres marked 3PMSF (snowflake on a mountain) with at least 4 mm of tread, and carry snow chains for the rear wheels. This meets the winter rules of every country on the route.'],
  ['act', 'Spanish cars must carry a DGT-approved V-16 connected beacon since 1 January 2026; triangles are no longer accepted in Spain. Keep two triangles as well for the other countries.'],
  ['act', 'Carry a reflective vest for everyone, a first-aid kit, a fire extinguisher (required in Romania) and a spare wheel.'],
  ['watch', 'Documents: passports or ID cards, driving licences, the original registration certificate, the ITV inspection and the insurance certificate. Ask your insurer to confirm cover in Serbia in writing.'],
  ['watch', 'Buy the Slovenian e-vignette (7 days) and the Romanian rovinietă online before the borders: evinjeta.dars.si and erovinieta.ro.']
];
const COUNTRIES = [
  { cc: 'ES', n: 'Spain', items: [
    ['lez', 'act', 'Madrid: cars without an environmental sticker may not drive anywhere in the city, the M-30 included. Exempt: cars of Madrid residents (until 31 Dec 2026) and registered historic vehicles. Fine €200.'],
    ['lez', 'act', 'San Sebastián: the central zone is closed to cars without a sticker every day, 24 hours. Park at the Illunbe park and ride and take bus 28. Fine €200.'],
    ['lez', 'info', 'Bilbao: the Abando zone applies Monday to Friday, 07:00–20:00. Weekends are free, so the Saturday arrival and Sunday departure are fine.'],
    ['toll', 'info', 'Tolls on the AP-68 and the AP-8 in Gipuzkoa: pay by card at the booths. The AP-1 Burgos–Armiñón is free.'],
    ['winter', 'watch', 'Chains or winter tyres only where signs require them, for example on the Somosierra pass (A-1) in snow.'],
    ['speed', 'info', 'Motorways 120, other roads 90, towns 50 (30 on single-lane streets).'],
    ['kit', 'act', 'V-16 connected beacon required since 1 January 2026; reflective vest.']
  ], src: [['DGT V-16 (EU road safety charter)', 'https://road-safety-charter.ec.europa.eu/content/spain-mandate-v-16-emergency-beacons-all-vehicles-2026'], ['Madrid moratorium 2026 (El Diario de Madrid)', 'https://www.eldiariodemadrid.es/articulo/movilidad/moratoria-vehiculos-etiqueta-empadronados-madrid-2026/20260103162148117563.html'], ['San Sebastián ZBE (RACE)', 'https://www.race.es/zonas-de-bajas-emisiones/mapa-zbe-donostia-san-sebastian'], ['Bilbao ZBE (Motor16)', 'https://www.motor16.com/las-ultimas-noticias/zbe-bilbao-mapa-horarios-multas/']] },
  { cc: 'FR', n: 'France', items: [
    ['lez', 'act', 'A car this old cannot get a Crit\'Air sticker, so it is banned from active low-emission zones (Toulouse and Montpellier on this route). Stay on the motorways around them; the plan already avoids Toulouse.'],
    ['winter', 'watch', 'Mountain law, 1 November–31 March, in signed areas of the Pyrénées-Atlantiques, Ariège, Aude, Var and Alpes-Maritimes: four 3PMSF tyres or chains in the car. M+S-only tyres no longer count.'],
    ['toll', 'info', 'Motorway tolls at booths: card works everywhere.'],
    ['speed', 'info', 'Motorways 130 (110 in rain), dual carriageways 110 (100), other roads 80 or 90 as signed, towns 50.'],
    ['kit', 'act', 'Reflective vest and a warning triangle.']
  ], src: [['ZFE status 2026 (Parking Actus)', 'https://www.parking-actus.com/zfe-2026-suppression-censure-conseil-constitutionnel/'], ['Loi Montagne 2026–2027 (Leocare)', 'https://leocare.eu/fr/blog/loi-montagne/']] },
  { cc: 'MC', n: 'Monaco', items: [
    ['info', 'info', 'No low-emission zone and no tolls. Use the public car parks; towns 50.']
  ], src: [] },
  { cc: 'IT', n: 'Italy', items: [
    ['lez', 'act', 'Historic centres are limited-traffic zones (ZTL) watched by cameras: Pisa, Lucca, Florence, Arezzo, Siena and others. Park outside the walls; fines arrive by post months later.'],
    ['lez', 'act', 'Emilia-Romagna, 1 October–31 March: diesels up to Euro 4 are banned in built-up areas of the plain towns, small ones too, Monday to Friday 08:30–18:30, and on some Sundays. Motorways are not affected.'],
    ['lez', 'watch', 'Veneto (Venice mainland and other large towns): diesels up to Euro 4 banned on weekdays 08:30–19:30, but the normal level pauses from 19 December to 6 January. Orange or red smog alerts still apply every day.'],
    ['winter', 'act', '15 November–15 April on signed roads, including the Apennine passes and the E45: winter tyres or chains on board. Fine €87–344.'],
    ['toll', 'info', 'Motorway tolls: take a ticket, pay at the exit in the lanes marked for cards or cash; never the yellow Telepass lane.'],
    ['speed', 'info', 'Motorways 130 (110 in rain), main roads 110 (90), other roads 90, towns 50. Dipped headlights on outside towns.'],
    ['kit', 'act', 'Reflective vest and a warning triangle.']
  ], src: [['Emilia-Romagna PAIR 2030 limits (Region)', 'https://ambiente.regione.emilia-romagna.it/it/aria/pair-2030/limitazioni_veicoli'], ['Plain towns under 30,000 (Arpae)', 'https://www.arpae.it/it/temi-ambientali/aria/liberiamo-laria/limitazioni-comuni-di-pianura'], ['Venice 2026–27 limits (Comune di Venezia)', 'https://live.comune.venezia.it/index.php/it/2026/09/qualita-dellaria-le-novita-orari-di-divieto-estesi-e-stagione-termica-accorciata'], ['Winter tyres 2025–26 (SicurAUTO)', 'https://www.sicurauto.it/news/codice-della-strada/gomme-invernali-2025-2026-tutte-le-autostrade-con-lobbligo/']] },
  { cc: 'SM', n: 'San Marino', items: [
    ['info', 'info', 'No border checks and no vignette. The old town on Monte Titano is closed to cars: use the signed car parks.']
  ], src: [] },
  { cc: 'SI', n: 'Slovenia', items: [
    ['toll', 'act', 'E-vignette needed on all motorways and expressways from the border: 7 days about €16.40, tied to the number plate. Buy at evinjeta.dars.si or at petrol stations. Fine €300.'],
    ['winter', 'act', '15 November–15 March winter equipment is required even without snow: winter tyres with at least 3 mm of tread, or summer tyres plus chains. Fine from €40.'],
    ['lez', 'info', 'Ljubljana\'s old centre is closed to cars; use a car park at the edge.'],
    ['speed', 'info', 'Motorways 130, expressways 110, other roads 90, towns 50. Dipped headlights on at all times.']
  ], src: [['E-vignette 2026 (The Slovenia)', 'https://the-slovenia.com/slovenija/vinjeta-vse-kar-morate-vedeti-o-e-vinjeti-za-slovenske-avtoceste/'], ['Winter equipment (N1 Slovenija)', 'https://n1info.si/novice/slovenija/ali-moram-imeti-15-11-zimske-gume-tudi-ce-ni-snega/']] },
  { cc: 'HR', n: 'Croatia', items: [
    ['winter', 'act', '15 November–15 April on major roads, whatever the weather: winter tyres on all wheels, or summer tyres with at least 4 mm of tread plus chains in the car.'],
    ['toll', 'info', 'Motorway tolls on the A3: pay at the exit by card or cash.'],
    ['speed', 'info', 'Motorways 130, other roads 90, towns 50. Dipped headlights on in winter.'],
    ['kit', 'act', 'First-aid kit, warning triangle, reflective vest and spare bulbs.']
  ], src: [['Croatia road rules (Your Europe)', 'https://europa.eu/youreurope/citizens/travel/driving-abroad/road-rules-and-safety/croatia/index_en.htm']] },
  { cc: 'RS', n: 'Serbia', items: [
    ['winter', 'act', '1 November–1 April winter tyres with at least 4 mm of tread are compulsory, with chains for the drive wheels. Fines about €50–170.'],
    ['docs', 'watch', 'No green card needed for Spanish-registered cars; your licence is valid. Passports or ID cards at the border; ask your insurer to confirm cover in Serbia.'],
    ['toll', 'info', 'Motorway tolls at booths: dinars, euros or card.'],
    ['kit', 'act', 'Spare wheel, warning triangle, first-aid kit, reflective vest, tow rope and a European accident report form.'],
    ['speed', 'info', 'Motorways 130, expressways 100, other roads 80, towns 50. Dipped headlights on at all times.']
  ], src: [['Green card (Ministry of Foreign Affairs of Serbia)', 'https://mfa.gov.rs/en/citizens/travel-serbia/driver-s-license-and-motor-vehicle-insurance'], ['Equipment and winter rules (Blick)', 'https://www.blick.ch/ausland/sonst-wird-es-richtig-teuer-diese-dinge-musst-du-fuer-serbien-ferien-im-auto-haben-id21137787.html']] },
  { cc: 'RO', n: 'Romania', items: [
    ['toll', 'act', 'Rovinietă needed on all national roads from the border: 10 days 39 lei for a Euro 0 car. Buy at erovinieta.ro (up to 30 days ahead) or at the border. Fine 250–500 lei.'],
    ['winter', 'act', 'Winter tyres are compulsory whenever the road has snow, ice or black ice.'],
    ['lez', 'info', 'Bucharest\'s planned low-emission zone starts in 2027 at the earliest: no restriction on 3 January.'],
    ['kit', 'act', 'First-aid kit, fire extinguisher and two warning triangles.'],
    ['speed', 'info', 'Motorways 130, expressways 120, European roads 100, other roads 90, towns 50. Dipped headlights on outside towns.']
  ], src: [['Rovinietă 2026 (Știrile ProTV)', 'https://stirileprotv.ro/divers/cat-costa-rovinieta-in-2026-lista-completa-de-preturi-actualizate.html'], ['Winter tyres (Playtech)', 'https://playtech.ro/2026/anvelope-de-iarna-in-2026-cand-sunt-obligatorii-si-ce-amenda-primesti-daca-nu-le-ai/'], ['Bucharest low-emission zone plan (G4Media)', 'https://www.g4media.ro/harta-zona-emisii-reduse-propusa-bucuresti-restrictii-masini-poluante-2027.html']] }
];
const RKIND = { lez: 'Town restrictions', toll: 'Tolls and vignettes', winter: 'Winter equipment', speed: 'Speed limits and lights', kit: 'Equipment', docs: 'Documents', info: 'Good to know' };
/* what applies on each day, in order of driving */
const DAYRULES = {
  1: [['act', 'Madrid low-emission zone: unless the car belongs to a Madrid resident or is a registered historic vehicle, start outside the city limits (for example Alcobendas on the A-1).'], ['watch', 'Somosierra pass: chains if signs require them.'], ['info', 'Bilbao: the zone is off on Saturdays.']],
  2: [['act', 'San Sebastián: no car in the central zone, any day. Park at Illunbe and take bus 28.'], ['info', 'AP-8 tolls in Gipuzkoa; France from Hendaye.'], ['watch', 'Pyrénées-Atlantiques: mountain law; your winter tyres cover it.']],
  3: [['info', 'No low-emission zone in Pau or Carcassonne; the route avoids Toulouse.'], ['watch', 'Mountain law in the Pyrenean departments.']],
  4: [['act', 'Montpellier zone: stay on the A9 past the city.'], ['watch', 'Mountain law in the Var and Alpes-Maritimes.']],
  5: [['info', 'Monaco and the Riviera villages: no zone; use the car parks.']],
  6: [['act', 'Pisa and Lucca: restricted centres; park outside the walls.'], ['watch', 'Italian winter-equipment roads begin.']],
  7: [['watch', 'Chianti hill roads: winter tyres required on signed stretches.'], ['act', 'Village centres can be restricted; park at the edge.']],
  8: [['info', 'Florence: leave the car at the hotel; the centre is restricted.']],
  9: [['act', 'Arezzo: park at Parcheggio Pietri, outside the restricted zone.'], ['act', 'Bocca Trabaria (SS73bis) and the E45: winter tyres or chains required.'], ['info', 'San Marino: use the signed car parks.']],
  10: [['act', 'Monday: old diesels are banned in Comacchio\'s built-up area 08:30–18:30. Park outside the town sign and walk in, or see Comacchio before 08:30 or after 18:30.'], ['watch', 'Veneto: the normal smog level is paused until 6 January, but an orange or red alert would also apply.']],
  11: [['info', 'Venice: the car stays parked; go by train.']],
  12: [['act', 'Slovenia: buy the e-vignette before the first motorway.'], ['act', 'Slovenia: winter equipment required from 15 November.'], ['info', 'Ljubljana: the old centre is closed to cars.']],
  13: [['act', 'Croatia: winter equipment required on major roads.'], ['info', 'A3 tolls by card or cash.']],
  14: [['act', 'Serbia: winter tyres compulsory; chains in the car.'], ['watch', 'Border: passports or ID cards and insurance cover for Serbia.'], ['info', 'Serbian tolls in dinars, euros or by card.']],
  15: [['act', 'Romania: rovinietă from the border at the Iron Gates.'], ['watch', 'Romania: winter tyres if there is snow or ice.']],
  16: [['info', 'Bucharest: no low-emission zone yet.'], ['info', 'The rovinietă bought on Day 15 is still valid.']]
};
