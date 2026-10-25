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

/* ---------- grouping by category ---------- */
const RCATS = [
  ['car', 'The car', 'Tyres, chains and the kit you must carry.'],
  ['papers', 'Papers and fees', 'Documents, insurance and the vignettes to buy before a border.'],
  ['zones', 'Where the car may go', 'Low-emission zones and closed town centres.'],
  ['laws', 'Driving laws', 'Speed limits and headlights.'],
  ['tolls', 'Tolls', 'How to pay on the motorways.']
];
const PREP_CAT = ['car', 'car', 'car', 'papers', 'papers'];
function ruleCat(cc, kind) {
  if (kind === 'winter' || kind === 'kit') return 'car';
  if (kind === 'docs') return 'papers';
  if (kind === 'toll') return (cc === 'SI' || cc === 'RO') ? 'papers' : 'tolls';
  if (kind === 'speed') return 'laws';
  if (kind === 'park') return 'parking';
  return 'zones';
}
const LVORD = { act: 0, watch: 1, info: 2 };
function rulesByCat() {
  const out = {}; RCATS.forEach(([k]) => out[k] = []);
  PREP.forEach((p, i) => out[PREP_CAT[i]].push({ cc: '', lv: p[0], t: p[1] }));
  PARK_GEN.forEach(p => out.parking.push({ cc: '', lv: p[0], t: p[1] }));
  COUNTRIES.forEach(c => c.items.forEach(([kind, lv, t]) => out[ruleCat(c.cc, kind)].push({ cc: c.cc, lv, t })));
  Object.keys(DAYPARK).forEach(d => DAYPARK[d].forEach(p => out.parking.push({ day: +d, lv: p[0], t: p[1] })));
  return out;
}

/* ---------- parking: checked 25 Oct 2026 ---------- */
const PARK_GEN = [["watch", "Overnight, use the hotel car park or a covered, staffed garage: an old Mercedes attracts parts thieves. Leave nothing on show and fit a steering lock."], ["info", "Carry a blue parking disc: free short-stay zones in France, Italy and Slovenia ask you to show your arrival time."], ["watch", "Paying for street parking by SMS in Croatia, Serbia and Romania needs a local phone number. Use meters, kiosk tickets, apps or garages instead."]];
const PARK_CTY = {"ES": ["info", "Blue zones are paid for visitors and green zones are mostly for residents. In Bilbao the central zone is charged on weekdays and Saturday mornings only; Sundays are free."], "FR": ["info", "Street parking is paid at meters or by app (PayByPhone, Flowbird). Blue-disc zones are free for a short stay with a parking disc."], "MC": ["info", "Public car parks are free for under an hour, about €7.30 for 2 hours and €24 for 24 hours. Street spaces are free on Sundays."], "IT": ["watch", "Blue lines are paid, usually 08:00–20:00 and often not on holidays (read the sign); white lines are free; yellow lines are for residents or disabled drivers only."], "SI": ["info", "Ljubljana's centre has short-stay zones of 30–120 minutes, paid at machines or by SMS. A P+R ticket covers 24 hours of parking and two city bus rides."], "HR": ["watch", "Zagreb's street zones are charged on weekdays and Saturday mornings, the central zone into the evening. Garages are the simple choice."], "RS": ["watch", "Belgrade's red, yellow and green zones allow 1–3 hours. Pay with a kiosk ticket or by SMS to 9111–9113 with the plate number, or use a public garage."], "RO": ["act", "Bucharest City Hall spaces marked in blue cost 5 lei an hour, Monday–Friday 08:00–20:00, and are free at night and at weekends. Pay by app (Parking București or AmParcat) before you walk away: unpaid parking is fined 200 lei."]};
const DAYPARK = {"1": [["info", "Bilbao: street parking in the centre is free from Saturday afternoon to Monday morning, but for the night use the hotel garage or a public car park (the Ribera market car park for the Casco Viejo)."]], "2": [["act", "San Sebastián: park at Illunbe and take bus 28."], ["info", "Biarritz: red and orange zones are paid all year with the first hour free; green and yellow zones are free in winter. The Halle d'Iraty P+R is free, with bus 7 to the centre in 10 minutes."]], "3": [["info", "Carcassonne: the Cité car parks P1 and P2 cost €1 per 15 minutes for the first 2 hours and are free 20:00–08:00. In the new town, P3, P4 and P5 give 30 minutes free, then €1 an hour."]], "4": [["info", "Pont du Gard: €9 per car whatever the length of stay; car park open 08:00–midnight."]], "5": [["info", "Èze: Place Figuiera car park, €3.20 an hour by day, first 15 minutes free."], ["info", "Monaco: the Pêcheurs car park is closest to the Palace and the Rock; under an hour is free."]], "6": [["info", "Pisa: the Via Pietrasantina car park is free, with a shuttle of about €1 return to Piazza dei Miracoli (09:00–17:00 in winter)."], ["info", "Lucca: the Carducci and Palatucci car parks outside the walls charge about €5–6 a day and are video-watched at night."]], "7": [["watch", "25 December: blue-line parking is often free on holidays, but read each sign. Park at the edge of the Chianti villages."]], "8": [["info", "Florence: leave the car in Figline and take the regional train to Santa Maria Novella."]], "9": [["act", "Arezzo: park at Parcheggio Pietri, outside the restricted zone."], ["info", "San Marino: use the hotel parking or one of the numbered public car parks around the old town, then walk up."]], "10": [["act", "Old diesels banned in the town 08:30–18:30 on weekdays: park outside the town sign"], ["info", "Mogliano Veneto: use the hotel car park; the next day goes by train."]], "11": [["info", "Venice: take the train from Mogliano to Venezia Santa Lucia. Driving to Piazzale Roma or Tronchetto only buys an expensive car park."]], "12": [["info", "Ljubljana: book the hotel's parking, or use P+R Dolgi Most on the way in from Trieste and take the bus."]], "13": [["info", "Zagreb: book hotel parking or use a central public garage such as Langov trg, Tuškanac or Petrinjska."]], "14": [["watch", "Belgrade: stay in Novi Beograd with hotel parking. In the centre use a public garage (Zeleni venac, Obilićev venac, Masarikova). 1 January is a public holiday: check what the zone signs say."]], "15": [["watch", "Drobeta-Turnu Severin or Orșova: choose a hotel with a closed courtyard or guarded parking."]], "16": [["info", "Bucharest: Sunday is free on City Hall spaces marked in blue. For the night, use a guarded or hotel car park."]]};
const PARK_SRC = [['Bilbao OTA (Onda Vasca)', 'https://www.ondavasca.com/la-ota-dejara-de-ser-gratis-al-mediodia-en-el-centro-de-bilbao-2/'], ['Parking in Bilbao (Guru Travel)', 'https://gurutravel.es/aparcamientos-parkings/donde-aparcar-vizcaya/donde-aparcar-bilbao/'], ['Biarritz parking guide (City of Biarritz)', 'https://www.biarritz.fr/fileadmin/mediatheque/PDF/STATIO-24/DEPLIANT_420x297_WEB.pdf'], ['Carcassonne parking (Tourist office)', 'https://www.tourisme-carcassonne.fr/en/useful/parking/'], ['Pont du Gard parking (Gard Tourisme)', 'https://www.tourismegard.com/fr/fiche/commerce-et-service/parking-site-du-pont-du-gard-rive-gauche-vers-pont-du-gard_TFO5887864/'], ['Èze parking (Côte d\'Azur France)', 'https://cotedazurfrance.fr/offres/parking-place-figuiera-et-place-de-la-colette-eze-fr-3810357/'], ['Parking in Monaco (Monaco Tribune)', 'https://monaco-tribune.com/en/2024/04/parking-in-monaco-all-you-need-to-know'], ['Parking in Pisa (Discover Tuscany)', 'https://discovertuscany.com/it/pisa/dove-parcheggiare-a-pisa.html'], ['Parking in Lucca (Discover Tuscany)', 'https://www.discovertuscany.com/lucca/where-to-park-in-lucca.html'], ['Parking in Ljubljana (Visit Ljubljana)', 'https://www.visitljubljana.com/en/visitors/travel-information/getting-around/parking/'], ['Zagreb parking (Zagreb Holding)', 'https://www.zgh.hr/services/utility-services/public-parking-services-in-public-open-air-and-underground-car-parks-2287/2287'], ['Zagreb parking (Visit Zagreb)', 'https://www.visitzagreb.hr/zagreb/zagreb-parking/'], ['Belgrade parking (Tourist Organisation of Belgrade)', 'https://tob.rs/en/info/useful-info/parking'], ['Balkan capitals parking (BTA)', 'https://www.bta.bg/en/news/balkans/1023600-how-balkan-capitals-handle-parking-and-what-it-costs'], ['Free parking in Bucharest (Playtech)', 'https://playtech.ro/2025/parcarea-gratuita-in-bucuresti-cand-scapi-de-plata-cum-eviti-amenzile-si-ridicarea-masinii-pe-loc/']];
COUNTRIES.forEach(c => { if (PARK_CTY[c.cc]) c.items.push(['park', PARK_CTY[c.cc][0], PARK_CTY[c.cc][1]]); });
RKIND.park = 'Parking';
RCATS.push(['parking', 'Parking', 'Where to leave the car each day, what it costs and how to pay.']);
