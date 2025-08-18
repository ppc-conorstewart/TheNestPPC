// src/constants/workorderConfig.js

export const sections = [
  {
    key: 'dfit',
    title: 'DFIT',
    tabs: ['DFIT-1', 'DFIT-2'],
    locCount: 10,
    fields: ['category', 'location'],      // <-- two fields per slot
  },
  {
    key: 'uma',
    title: 'UMA',
    tabs: ['UMA-1', 'UMA-2'],
    locCount: 7,
    fields: ['location'],                  // <-- only one field
  },
  {
    key: 'fca',
    title: 'FCA',
    tabs: ['FCA-1', 'FCA-2'],
    locCount: 10,
    fields: ['location'],
  },
  {
    key: 'sva',
    title: 'SVA',
    tabs: ['SVA-1', 'SVA-2'],
    locCount: 8,
    fields: ['location'],
  },
  {
    key: 'dogbones',
    title: 'Dogbones',
    tabs: ['DB-1', 'DB-2'],
    locCount: 3,
    fields: ['location'],
  },
  {
    key: 'zippers',
    title: 'Zippers',
    tabs: ['ZIP-1', 'ZIP-2'],
    locCount: 3,
    fields: ['location'],
  },
  {
    key: 'ppl',
    title: 'PPL',
    tabs: ['PPL-1', 'PPL-2'],
    locCount: 3,
    fields: ['location'],
  },
];
