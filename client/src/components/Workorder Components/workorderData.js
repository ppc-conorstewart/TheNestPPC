// src/workorderData.js

/**
 * transformJobToPackage - maps a Job object into the workorder package schema
 * @param {Object} job - a job entry from JobPlanner
 * @returns {Object} workorder package data
 */
export function transformJobToPackage(job) {
  return {
    id: job.id || job.ID || job.jobId || null, // Always carry id forward!
    customer: job.customer || job.Customer || job.client || '',
    surfaceLSD: job.surface_lsd || job.lsd || '',
    numberOfWells: job.num_wells || job.wells || 0,
    rigInDate: job.rig_in_date || job.rigInDate || '',
    wellBankType: job.wellBankType || job.bankType || 'Single',
    workbookRevision: job.currentRevision || job.revision || 'A',
    pages: [
      {
        code: 'Customer WO Information',
        title: 'Customer WO Information'
      },
      {
        code: 'BOM',
        title: 'Bill of Materials'
      },
      { code: '01',   title: 'DFIT Assembly' },
      { code: '02',   title: 'Upper Master Assembly' },
      { code: '03',   title: 'Flow Cross Assembly' },
      { code: '04',   title: 'Swab Valve' },
      { code: '05',   title: 'Dog Bone' },
      { code: '06',   title: 'Zipper Assembly' },
      { code: '07',   title: 'PPL Drop Down Assembly' },
      { code: '08',   title: 'PPL Build Plan' },
      { code: '09',   title: 'Paloma Frac Line Build Plan' },
      { code: '10',   title: 'Hydraulic Valve Control Panels' },
      { code: '11',   title: 'Coil Tree Assembly' },
    ]
  };
}
