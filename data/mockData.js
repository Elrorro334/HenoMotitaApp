export const userProfile = {
  id: 'u123',
  name: 'Rodrigo Domínguez',
  role: 'Operador de Campo',
  email: 'rodrigo@uttt.edu.mx',
};

export const trees = [
  { id: 'MZQ-001', species: 'Mezquite', zone: 'Edificio A', gps: '20.0512°N, -99.3398°W' },
  { id: 'HZC-042', species: 'Huizache', zone: 'Área Deportiva', gps: '20.0521°N, -99.3410°W' },
  { id: 'MZQ-089', species: 'Mezquite', zone: 'Biblioteca', gps: '20.0505°N, -99.3405°W' },
  { id: 'MZQ-112', species: 'Mezquite', zone: 'Estacionamiento', gps: '20.0530°N, -99.3422°W' },
  { id: 'HZC-077', species: 'Huizache', zone: 'Edificio C', gps: '20.0518°N, -99.3385°W' },
];

export const recentEvaluations = [
  {
    id: 'ev-1',
    treeId: 'MZQ-001',
    species: 'Mezquite',
    date: '2026-07-20 10:30',
    scale: 6.5,
    recommendation: 'Remoción manual urgente',
    status: 'severe',
  },
  {
    id: 'ev-2',
    treeId: 'HZC-042',
    species: 'Huizache',
    date: '2026-07-20 11:15',
    scale: 3.5,
    recommendation: 'Poda selectiva recomendada',
    status: 'moderate',
  },
  {
    id: 'ev-3',
    treeId: 'MZQ-089',
    species: 'Mezquite',
    date: '2026-07-21 09:00',
    scale: 1.5,
    recommendation: 'Monitoreo periódico',
    status: 'mild',
  },
];

export const pendingSync = [
  {
    id: 'sync-1',
    treeId: 'MZQ-112',
    date: '2026-07-21 12:45',
    scale: 7.0,
  },
  {
    id: 'sync-2',
    treeId: 'HZC-077',
    date: '2026-07-21 13:10',
    scale: 4.5,
  },
];
