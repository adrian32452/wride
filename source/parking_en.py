GEN = [
 ('watch', "Overnight, use the hotel car park or a covered, staffed garage: an old Mercedes attracts parts thieves. Leave nothing on show and fit a steering lock."),
 ('info', "Carry a blue parking disc: free short-stay zones in France, Italy and Slovenia ask you to show your arrival time."),
 ('watch', "Paying for street parking by SMS in Croatia, Serbia and Romania needs a local phone number. Use meters, kiosk tickets, apps or garages instead."),
]
CTY = {
 'ES': ('info', "Blue zones are paid for visitors and green zones are mostly for residents. In Bilbao the central zone is charged on weekdays and Saturday mornings only; Sundays are free."),
 'FR': ('info', "Street parking is paid at meters or by app (PayByPhone, Flowbird). Blue-disc zones are free for a short stay with a parking disc."),
 'MC': ('info', "Public car parks are free for under an hour, about €7.30 for 2 hours and €24 for 24 hours. Street spaces are free on Sundays."),
 'IT': ('watch', "Blue lines are paid, usually 08:00–20:00 and often not on holidays (read the sign); white lines are free; yellow lines are for residents or disabled drivers only."),
 'SI': ('info', "Ljubljana's centre has short-stay zones of 30–120 minutes, paid at machines or by SMS. A P+R ticket covers 24 hours of parking and two city bus rides."),
 'HR': ('watch', "Zagreb's street zones are charged on weekdays and Saturday mornings, the central zone into the evening. Garages are the simple choice."),
 'RS': ('watch', "Belgrade's red, yellow and green zones allow 1–3 hours. Pay with a kiosk ticket or by SMS to 9111–9113 with the plate number, or use a public garage."),
 'RO': ('act', "Bucharest City Hall spaces marked in blue cost 5 lei an hour, Monday–Friday 08:00–20:00, and are free at night and at weekends. Pay by app (Parking București or AmParcat) before you walk away: unpaid parking is fined 200 lei."),
}
DAY = {
 1: [('info', "Bilbao: street parking in the centre is free from Saturday afternoon to Monday morning, but for the night use the hotel garage or a public car park (the Ribera market car park for the Casco Viejo).")],
 2: [('act', "San Sebastián: park at Illunbe and take bus 28."), ('info', "Biarritz: red and orange zones are paid all year with the first hour free; green and yellow zones are free in winter. The Halle d'Iraty P+R is free, with bus 7 to the centre in 10 minutes.")],
 3: [('info', "Carcassonne: the Cité car parks P1 and P2 cost €1 per 15 minutes for the first 2 hours and are free 20:00–08:00. In the new town, P3, P4 and P5 give 30 minutes free, then €1 an hour.")],
 4: [('info', "Pont du Gard: €9 per car whatever the length of stay; car park open 08:00–midnight.")],
 5: [('info', "Èze: Place Figuiera car park, €3.20 an hour by day, first 15 minutes free."), ('info', "Monaco: the Pêcheurs car park is closest to the Palace and the Rock; under an hour is free.")],
 6: [('info', "Pisa: the Via Pietrasantina car park is free, with a shuttle of about €1 return to Piazza dei Miracoli (09:00–17:00 in winter)."), ('info', "Lucca: the Carducci and Palatucci car parks outside the walls charge about €5–6 a day and are video-watched at night.")],
 7: [('watch', "25 December: blue-line parking is often free on holidays, but read each sign. Park at the edge of the Chianti villages.")],
 8: [('info', "Florence: leave the car in Figline and take the regional train to Santa Maria Novella.")],
 9: [('act', "Arezzo: park at Parcheggio Pietri, outside the restricted zone."), ('info', "San Marino: use the hotel parking or one of the numbered public car parks around the old town, then walk up.")],
 10: [('act', "Old diesels banned in the town 08:30–18:30 on weekdays: park outside the town sign"), ('info', "Mogliano Veneto: use the hotel car park; the next day goes by train.")],
 11: [('info', "Venice: take the train from Mogliano to Venezia Santa Lucia. Driving to Piazzale Roma or Tronchetto only buys an expensive car park.")],
 12: [('info', "Ljubljana: book the hotel's parking, or use P+R Dolgi Most on the way in from Trieste and take the bus.")],
 13: [('info', "Zagreb: book hotel parking or use a central public garage such as Langov trg, Tuškanac or Petrinjska.")],
 14: [('watch', "Belgrade: stay in Novi Beograd with hotel parking. In the centre use a public garage (Zeleni venac, Obilićev venac, Masarikova). 1 January is a public holiday: check what the zone signs say.")],
 15: [('watch', "Drobeta-Turnu Severin or Orșova: choose a hotel with a closed courtyard or guarded parking.")],
 16: [('info', "Bucharest: Sunday is free on City Hall spaces marked in blue. For the night, use a guarded or hotel car park.")],
}
UI = ['Where to leave the car each day, what it costs and how to pay.']
