const services = [
  ['Standard House Clean', '1600607687939-ce8a6c25118c'],
  ['Deep House Clean', '1584622650111-993a426fbf0a'],
  ['Move-In Cleaning', '1560448204-e02f11c3d0e2'],
  ['Move-Out Cleaning', '1600585154340-be6161a56a0c'],
  ['Post-Construction Clean', '1541888946425-d81bb19240f5'],
  ['After-Party Clean', '1530103862676-de8c9debad1d'],
  ['Spring/Seasonal Clean', '1585421514738-01798e348b17'],
  ['Kitchen Deep Clean', '1556909114-f6e7ad7d3136'],
  ['Bathroom Deep Clean', '1552321554-5fefe8c9ef14'],
  ['Bedroom Clean', '1522771739844-6a9f6d5f14af'],
  ['Living Room Clean', '1493663284031-b7e3aefcae8e'],
  ['Carpet Cleaning', '1558317374-067fb5f30001'],
  ['Sofa/Couch Cleaning (2-seater)', '1555041469-a586c61ea9bc'],
  ['Sofa/Couch Cleaning (3-seater)', '1567016432779-094069958ea5'],
  ['Mattress Cleaning (single)', '1631049307264-da0ec9d70304'],
  ['Mattress Cleaning (double/king)', '1586105251261-72a756497a11'],
  ['Rug Cleaning', '1587502537745-84b86da1204f'],
  ['Office Clean (small, up to 50sqm)', '1497366811353-6870744d04b2'],
  ['Office Clean (medium, 50-150sqm)', '1497366754035-f200968a6e72'],
  ['Office Clean (large, 150sqm+)', '1497366216548-37526070297c'],
  ['Retail Shop Clean', '1441986300917-64674bd600d8'],
  ['Restaurant/Café Clean', '1552566626-52f8b828add9'],
  ['Window Cleaning (interior)', '1527515862978-031310ffb3d6'],
  ['Window Cleaning (interior + exterior)', '1600566752355-35792bedcfea'],
  ['Ceiling and Wall Wash', '1595515106969-1ce29566ff1c'],
  ['Tile and Grout Deep Clean', '1584622781564-1d987f7333c1'],
  ['Fridge/Freezer Clean', '1571175443880-49e1d25b2bc5'],
  ['Oven Deep Clean', '1585515320310-259814833e62'],
  ['Pressure Washing', '1595535373192-1fa3ff775d24'],
  ['Weekly Maintenance Clean', '1524758631624-e2822e304c36'],
  ['Biweekly Maintenance Clean', '1600210492486-724fe5c67fb0'],
  ['Monthly Full Clean', '1615873968403-89e068629265']
];
const ids = services.map(([, id]) => id);
const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
console.log(`services=${services.length} unique=${new Set(ids).size} duplicates=${duplicates.length}`);
if (duplicates.length) console.log('duplicateIds=', [...new Set(duplicates)]);
