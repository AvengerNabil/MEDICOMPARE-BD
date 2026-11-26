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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const medicineId = params.id;
  const db = getDatabase();
  if (!db) {
    return NextResponse.json({ error: 'Database unavailable' }, { status: 500 });
  }

  try {
    const sql = `
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
      WHERE m.id = ?
    `;

    const row = db.prepare(sql).get(medicineId);
    if (!row) {
      return NextResponse.json({ error: 'Medicine not found' }, { status: 404 });
    }

    const activeIngredients = [];
    const gName = row.genericName || '';
    if (gName.includes('+')) {
      for (const p of gName.split('+')) {
        if (p.trim()) activeIngredients.push({ name: p.trim(), strength: row.strength });
      }
    } else {
      activeIngredients.push({ name: gName, strength: row.strength });
    }

    return NextResponse.json({
      ...row,
      isPrescriptionRequired: Boolean(row.isPrescriptionRequired),
      activeIngredients,
    });
  } catch (error: any) {
    console.error('Fetch medicine error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
