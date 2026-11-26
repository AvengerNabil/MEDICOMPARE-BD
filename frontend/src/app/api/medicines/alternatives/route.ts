import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

let dbInstance: any = null;

function getDatabase() {
  if (dbInstance) return dbInstance;
  try {
    const { DatabaseSync } = require('node:sqlite');
    let dbPath = path.resolve(process.cwd(), '../backend/medicompare.db');
    if (!fs.existsSync(dbPath)) {
      dbPath = path.resolve(process.cwd(), 'medicompare.db');
    }
    if (!fs.existsSync(dbPath)) {
      dbPath = path.resolve(process.cwd(), '../medicompare.db');
    }
    if (fs.existsSync(dbPath)) {
      dbInstance = new DatabaseSync(dbPath);
      return dbInstance;
    }
  } catch (err) {
    console.error('Failed to initialize node:sqlite:', err);
  }
  return null;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const medicineId = searchParams.get('id');

  if (!medicineId) {
    return NextResponse.json({ error: 'Missing medicine id' }, { status: 400 });
  }

  const db = getDatabase();
  if (!db) {
    return NextResponse.json({ error: 'Database unavailable' }, { status: 500 });
  }

  try {
    // 1. Fetch reference target
    const targetSql = `
      SELECT m.*, g.inn_name as genericName, g.inn_name_bn as genericNameBn,
             g.therapeutic_class as therapeuticClass, g.therapeutic_class_bn as therapeuticClassBn,
             mfr.name as manufacturer, mfr.name_bn as manufacturerBn
      FROM medicines m
      JOIN generics g ON m.generic_id = g.id
      JOIN manufacturers mfr ON m.manufacturer_id = mfr.id
      WHERE m.id = ?
    `;
    const target = db.prepare(targetSql).get(medicineId);
    if (!target) {
      return NextResponse.json({ error: 'Reference medicine not found' }, { status: 404 });
    }

    // 2. Fetch Exact bioequivalent matches (same generic, same strength, same form)
    const exactSql = `
      SELECT m.id, m.brand_name as brandName, m.brand_name_bn as brandNameBn,
             g.inn_name as genericName, g.inn_name_bn as genericNameBn,
             m.generic_id as genericId, m.strength, m.dosage_form as dosageForm,
             m.dosage_form_bn as dosageFormBn, m.route, m.release_mechanism as releaseMechanism,
             mfr.name as manufacturer, mfr.name_bn as manufacturerBn, m.manufacturer_id as manufacturerId,
             m.unit_price as unitPrice, m.mrp, m.pack_size as packSize, m.pack_unit as packUnit,
             m.price_type as priceType, m.registration_number as registrationNumber,
             m.verification_status as verificationStatus, m.is_prescription_required as isPrescriptionRequired,
             m.data_source as dataSource, m.last_verified_at as lastVerifiedDate,
             g.therapeutic_class as therapeuticClass, g.therapeutic_class_bn as therapeuticClassBn,
             m.indications_summary as indicationsSummary, m.safety_advice as safetyAdvice
      FROM medicines m
      JOIN generics g ON m.generic_id = g.id
      JOIN manufacturers mfr ON m.manufacturer_id = mfr.id
      WHERE m.generic_id = ? 
        AND LOWER(m.strength) = LOWER(?)
        AND LOWER(m.dosage_form) = LOWER(?)
      ORDER BY m.unit_price ASC
      LIMIT 100
    `;
    const exactRows = db.prepare(exactSql).all(target.generic_id, target.strength, target.dosage_form);

    // 3. Fetch Alternative formulations (same generic, differing strength or dosage form)
    const altSql = `
      SELECT m.id, m.brand_name as brandName, m.brand_name_bn as brandNameBn,
             g.inn_name as genericName, g.inn_name_bn as genericNameBn,
             m.generic_id as genericId, m.strength, m.dosage_form as dosageForm,
             m.dosage_form_bn as dosageFormBn, m.route, m.release_mechanism as releaseMechanism,
             mfr.name as manufacturer, mfr.name_bn as manufacturerBn, m.manufacturer_id as manufacturerId,
             m.unit_price as unitPrice, m.mrp, m.pack_size as packSize, m.pack_unit as packUnit,
             m.price_type as priceType, m.registration_number as registrationNumber,
             m.verification_status as verificationStatus, m.is_prescription_required as isPrescriptionRequired,
             m.data_source as dataSource, m.last_verified_at as lastVerifiedDate,
             g.therapeutic_class as therapeuticClass, g.therapeutic_class_bn as therapeuticClassBn,
             m.indications_summary as indicationsSummary, m.safety_advice as safetyAdvice
      FROM medicines m
      JOIN generics g ON m.generic_id = g.id
      JOIN manufacturers mfr ON m.manufacturer_id = mfr.id
      WHERE m.generic_id = ? 
        AND (LOWER(m.strength) != LOWER(?) OR LOWER(m.dosage_form) != LOWER(?))
      ORDER BY m.brand_name ASC
      LIMIT 50
    `;
    const altRows = db.prepare(altSql).all(target.generic_id, target.strength, target.dosage_form);

    const formatRow = (r: any) => {
      const activeIngredients = [];
      const gName = r.genericName || '';
      if (gName.includes('+')) {
        for (const p of gName.split('+')) {
          if (p.trim()) activeIngredients.push({ name: p.trim(), strength: r.strength });
        }
      } else {
        activeIngredients.push({ name: gName, strength: r.strength });
      }
      return {
        ...r,
        isPrescriptionRequired: Boolean(r.isPrescriptionRequired),
        activeIngredients,
      };
    };

    return NextResponse.json({
      reference_medicine: formatRow({
        id: target.id,
        brandName: target.brand_name,
        brandNameBn: target.brand_name_bn,
        genericName: target.genericName,
        genericNameBn: target.genericNameBn,
        genericId: target.generic_id,
        strength: target.strength,
        dosageForm: target.dosage_form,
        dosageFormBn: target.dosage_form_bn,
        route: target.route,
        releaseMechanism: target.release_mechanism,
        manufacturer: target.manufacturer,
        manufacturerBn: target.manufacturerBn,
        manufacturerId: target.manufacturer_id,
        unitPrice: target.unit_price,
        mrp: target.mrp,
        packSize: target.pack_size,
        packUnit: target.pack_unit,
        priceType: target.price_type,
        registrationNumber: target.registration_number,
        verificationStatus: target.verification_status,
        isPrescriptionRequired: target.is_prescription_required,
        dataSource: target.data_source,
        lastVerifiedDate: target.last_verified_at,
        therapeuticClass: target.therapeuticClass,
        therapeuticClassBn: target.therapeuticClassBn,
        indicationsSummary: target.indications_summary,
        safetyAdvice: target.safety_advice,
      }),
      exactMatches: exactRows.map(formatRow),
      exact_composition_matches: exactRows.map(formatRow),
      total_exact_matches: exactRows.length,
      alternativeFormulations: altRows.map(formatRow),
      alternative_formulations_count: altRows.length,
      alternative_formulations_sample: altRows.map(formatRow),
      medical_safety_notice: "Exact composition matches share identical Active Pharmaceutical Ingredients (API), strength, and dosage form. Any substitution must be evaluated and approved by a registered doctor.",
    });
  } catch (error: any) {
    console.error('Alternatives API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
