import type { Breach } from './findings.ts';

export const demoDate = '2026-11-12T12:00:00.000Z';

export const demoBreaches: Breach[] = [
  { id: 'fieldnote', title: 'Fieldnote', date: '2026-09-19', dataClasses: ['Email addresses', 'Passwords'] },
  { id: 'parcelpost', title: 'ParcelPost', date: '2025-11-06', dataClasses: ['Email addresses', 'Phone numbers'] },
  { id: 'northline', title: 'Northline Tickets', date: '2026-06-14', dataClasses: ['Email addresses', 'Passwords', 'Dates of birth'] },
  { id: 'openatlas', title: 'Open Atlas', date: '2023-02-14', dataClasses: ['Usernames', 'Names'] },
  { id: 'goodroom', title: 'Goodroom', date: '2022-05-07', dataClasses: ['Physical addresses'] },
];
