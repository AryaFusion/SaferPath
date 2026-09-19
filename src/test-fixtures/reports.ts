import type { PhysicalReport } from '../lib/types';

export const FIXTURE_REPORTS: PhysicalReport[] = [
  {
    id: 'rep-101',
    category: 'Streetlamp Issue',
    locationDescription: 'Senapati Bapat Marg near Kabutarkhana Junction',
    physicalDetails: 'Two consecutive overhead municipal LED lamps unlit. Road surface clear but lighting is dim.',
    submittedAt: '40 mins ago',
    isAnonymous: true,
  },
  {
    id: 'rep-102',
    category: 'Pavement Obstacle',
    locationDescription: 'Lakhamsi Napoo Road near Ruia College entrance',
    physicalDetails: 'Building repair scaffolding occupies 50% of sidewalk width. Pedestrian bypass lane clear.',
    submittedAt: '2 hours ago',
    isAnonymous: true,
  },
  {
    id: 'rep-103',
    category: 'Open Commercial Front',
    locationDescription: 'Dr. B.A. Road near Dadar TT Circle #14',
    physicalDetails: '24h Nobel Chemist storefront active with illuminated entrance awning and security presence.',
    submittedAt: '5 hours ago',
    isAnonymous: false,
  },
];

