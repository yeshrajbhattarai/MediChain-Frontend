// src/data/ckdTestPatients.js
// Realistic KFT lab values for testing the CKD prediction model.
// Based on clinical ranges from the UCI CKD dataset (Rubini et al., 2015).
//
// Usage in LabQueue FillPanel:
//   import { CKD_PATIENTS, NON_CKD_PATIENTS } from '../../data/ckdTestPatients'

// ─── CKD patients (expected prediction: CKD) ─────────────────────────────────
// These values reflect advanced CKD: elevated creatinine & urea, low haemoglobin,
// abnormal RBC/pus cells, hypertension, diabetes, poor appetite, pedal oedema.

export const CKD_PATIENTS = [
  {
    label: 'CKD Patient 1 — Severe (Stage 4)',
    values: {
      bp:    '100',       // Blood Pressure (mmHg) — hypertensive
      sg:    '1.010',     // Specific Gravity — low (normal 1.020–1.025)
      al:    '4',         // Albumin — heavy proteinuria (0–5 scale; ≥3 = severe)
      su:    '0',         // Sugar — no glycosuria
      rbc:   'abnormal',  // Red Blood Cells in urine — abnormal
      pc:    'abnormal',  // Pus Cells — abnormal
      pcc:   'present',   // Pus Cell Clumps — present
      ba:    'notpresent',// Bacteria — not present
      bgr:   '117',       // Blood Glucose Random (mg/dL) — mildly elevated
      bu:    '91',        // Blood Urea (mg/dL) — high (normal < 40)
      sc:    '7.2',       // Serum Creatinine (mg/dL) — very high (normal 0.6–1.2)
      sod:   '130',       // Sodium (mEq/L) — low-normal
      pot:   '5.8',       // Potassium (mEq/L) — elevated (normal 3.5–5.0)
      hemo:  '8.1',       // Haemoglobin (g/dL) — anaemic (normal 12–17)
      pcv:   '24',        // Packed Cell Volume (%) — low (normal 36–50)
      wc:    '8200',      // WBC Count (cells/cumm) — within range
      rc:    '2.8',       // RBC Count (millions/cumm) — low (normal 4.2–5.4)
      htn:   'yes',       // Hypertension
      dm:    'no',        // Diabetes Mellitus
      cad:   'no',        // Coronary Artery Disease
      appet: 'poor',      // Appetite
      pe:    'yes',       // Pedal Oedema
      ane:   'yes',       // Anaemia
    },
  },
  {
    label: 'CKD Patient 2 — Moderate (Stage 3, Diabetic Nephropathy)',
    values: {
      bp:    '90',
      sg:    '1.015',
      al:    '3',
      su:    '2',
      rbc:   'abnormal',
      pc:    'abnormal',
      pcc:   'notpresent',
      ba:    'notpresent',
      bgr:   '196',       // Diabetic range
      bu:    '68',
      sc:    '4.5',
      sod:   '135',
      pot:   '5.2',
      hemo:  '9.8',
      pcv:   '29',
      wc:    '7400',
      rc:    '3.1',
      htn:   'yes',
      dm:    'yes',
      cad:   'no',
      appet: 'poor',
      pe:    'yes',
      ane:   'yes',
    },
  },
  {
    label: 'CKD Patient 3 — Early-Moderate (Stage 2, Hypertensive)',
    values: {
      bp:    '80',
      sg:    '1.020',
      al:    '2',
      su:    '0',
      rbc:   'normal',
      pc:    'abnormal',
      pcc:   'notpresent',
      ba:    'notpresent',
      bgr:   '99',
      bu:    '53',
      sc:    '2.9',
      sod:   '140',
      pot:   '4.6',
      hemo:  '11.2',
      pcv:   '33',
      wc:    '6800',
      rc:    '3.6',
      htn:   'yes',
      dm:    'no',
      cad:   'yes',
      appet: 'poor',
      pe:    'no',
      ane:   'yes',
    },
  },
  {
    label: 'CKD Patient 4 — Severe (Stage 5, ESRD)',
    values: {
      bp:    '120',
      sg:    '1.005',     // Very low — kidneys can't concentrate urine
      al:    '5',         // Maximum proteinuria
      su:    '0',
      rbc:   'abnormal',
      pc:    'abnormal',
      pcc:   'present',
      ba:    'present',
      bgr:   '148',
      bu:    '164',       // Severely elevated urea
      sc:    '13.0',      // Critically high creatinine
      sod:   '112',       // Severely low sodium
      pot:   '6.4',       // Dangerous hyperkalaemia
      hemo:  '5.6',       // Severely anaemic
      pcv:   '16',
      wc:    '11400',     // Elevated WBC (possible infection)
      rc:    '2.1',
      htn:   'yes',
      dm:    'yes',
      cad:   'yes',
      appet: 'poor',
      pe:    'yes',
      ane:   'yes',
    },
  },
  {
    label: 'CKD Patient 5 — Moderate (Glomerulonephritis)',
    values: {
      bp:    '70',
      sg:    '1.018',
      al:    '3',
      su:    '1',
      rbc:   'abnormal',
      pc:    'normal',
      pcc:   'notpresent',
      ba:    'notpresent',
      bgr:   '110',
      bu:    '72',
      sc:    '3.8',
      sod:   '138',
      pot:   '4.9',
      hemo:  '10.5',
      pcv:   '31',
      wc:    '7000',
      rc:    '3.4',
      htn:   'no',
      dm:    'no',
      cad:   'no',
      appet: 'poor',
      pe:    'yes',
      ane:   'yes',
    },
  },
]

// ─── Non-CKD patients (expected prediction: NOT CKD) ─────────────────────────
// Normal ranges: creatinine 0.6–1.2 mg/dL, urea < 40 mg/dL, haemoglobin > 12 g/dL,
// specific gravity > 1.020, no proteinuria, no anaemia.

export const NON_CKD_PATIENTS = [
  {
    label: 'Healthy Patient 1 — Young Adult (M, 28)',
    values: {
      bp:    '70',
      sg:    '1.025',
      al:    '0',
      su:    '0',
      rbc:   'normal',
      pc:    'normal',
      pcc:   'notpresent',
      ba:    'notpresent',
      bgr:   '82',
      bu:    '18',
      sc:    '0.9',
      sod:   '142',
      pot:   '4.0',
      hemo:  '15.4',
      pcv:   '46',
      wc:    '6200',
      rc:    '5.1',
      htn:   'no',
      dm:    'no',
      cad:   'no',
      appet: 'good',
      pe:    'no',
      ane:   'no',
    },
  },
  {
    label: 'Healthy Patient 2 — Middle-aged Woman (F, 45)',
    values: {
      bp:    '80',
      sg:    '1.022',
      al:    '0',
      su:    '0',
      rbc:   'normal',
      pc:    'normal',
      pcc:   'notpresent',
      ba:    'notpresent',
      bgr:   '91',
      bu:    '24',
      sc:    '0.8',
      sod:   '139',
      pot:   '3.8',
      hemo:  '13.2',
      pcv:   '40',
      wc:    '5800',
      rc:    '4.5',
      htn:   'no',
      dm:    'no',
      cad:   'no',
      appet: 'good',
      pe:    'no',
      ane:   'no',
    },
  },
  {
    label: 'Healthy Patient 3 — Older Adult with Controlled BP (M, 62)',
    values: {
      bp:    '80',        // Controlled with medication
      sg:    '1.021',
      al:    '0',
      su:    '0',
      rbc:   'normal',
      pc:    'normal',
      pcc:   'notpresent',
      ba:    'notpresent',
      bgr:   '105',       // Slightly elevated but not diabetic range
      bu:    '31',
      sc:    '1.1',       // High-normal but not CKD
      sod:   '141',
      pot:   '4.2',
      hemo:  '14.0',
      pcv:   '42',
      wc:    '7100',
      rc:    '4.8',
      htn:   'yes',       // Hypertension but kidneys still healthy
      dm:    'no',
      cad:   'no',
      appet: 'good',
      pe:    'no',
      ane:   'no',
    },
  },
  {
    label: 'Healthy Patient 4 — Diabetic but Normal Kidneys (F, 52)',
    values: {
      bp:    '80',
      sg:    '1.023',
      al:    '0',
      su:    '1',         // Some glycosuria (diabetic)
      rbc:   'normal',
      pc:    'normal',
      pcc:   'notpresent',
      ba:    'notpresent',
      bgr:   '162',       // Diabetic range
      bu:    '29',
      sc:    '1.0',       // Still within normal kidney function
      sod:   '138',
      pot:   '4.1',
      hemo:  '12.6',
      pcv:   '38',
      wc:    '6500',
      rc:    '4.3',
      htn:   'no',
      dm:    'yes',       // Diabetic but no nephropathy yet
      cad:   'no',
      appet: 'good',
      pe:    'no',
      ane:   'no',
    },
  },
  {
    label: 'Healthy Patient 5 — Athlete, Excellent Kidney Function (M, 34)',
    values: {
      bp:    '60',        // Low — athletic resting BP
      sg:    '1.028',     // Concentrated urine, well hydrated
      al:    '0',
      su:    '0',
      rbc:   'normal',
      pc:    'normal',
      pcc:   'notpresent',
      ba:    'notpresent',
      bgr:   '78',
      bu:    '14',        // Very low — excellent kidney clearance
      sc:    '0.7',
      sod:   '143',
      pot:   '3.9',
      hemo:  '16.8',      // High — athletic adaptation
      pcv:   '50',
      wc:    '5200',
      rc:    '5.5',
      htn:   'no',
      dm:    'no',
      cad:   'no',
      appet: 'good',
      pe:    'no',
      ane:   'no',
    },
  },
]

// ─── Combined export for the autofill picker ─────────────────────────────────

export const ALL_TEST_PATIENTS = [
  ...CKD_PATIENTS.map(p => ({ ...p, category: 'ckd' })),
  ...NON_CKD_PATIENTS.map(p => ({ ...p, category: 'not_ckd' })),
]