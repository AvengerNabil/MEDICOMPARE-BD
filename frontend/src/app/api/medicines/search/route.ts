import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

// Try loading SQLite database
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
  const q = (searchParams.get('q') || '').trim();
  const type = searchParams.get('type') || 'all';
  const dosageForm = searchParams.get('dosage_form') || searchParams.get('dosage') || 'all';
  const limit = Math.min(Number(searchParams.get('limit') || 25), 100);
  const offset = Number(searchParams.get('offset') || 0);

  const db = getDatabase();
  if (!db) {
    return NextResponse.json({ error: 'Database unavailable' }, { status: 500 });
  }

  try {
    let whereClauses: string[] = [];
    let params: any[] = [];

    if (dosageForm && dosageForm.toLowerCase() !== 'all') {
      whereClauses.push('LOWER(m.dosage_form) = LOWER(?)');
      params.push(dosageForm);
    }

    if (q) {
      const terms = q.split(/\s+/).filter(Boolean);
      for (const term of terms) {
        const likeTerm = `%${term}%`;
        if (type === 'brand') {
          whereClauses.push('(m.brand_name LIKE ? OR m.brand_name_bn LIKE ?)');
          params.push(likeTerm, likeTerm);
        } else if (type === 'generic') {
          whereClauses.push('(g.inn_name LIKE ? OR g.inn_name_bn LIKE ?)');
          params.push(likeTerm, likeTerm);
        } else if (type === 'mfr') {
          whereClauses.push('(mfr.name LIKE ? OR mfr.name_bn LIKE ?)');
          params.push(likeTerm, likeTerm);
        } else {
          // 'all'
          whereClauses.push(`
            (m.brand_name LIKE ? OR m.brand_name_bn LIKE ? OR 
             g.inn_name LIKE ? OR g.inn_name_bn LIKE ? OR 
             mfr.name LIKE ? OR m.strength LIKE ?)
          `);
          params.push(likeTerm, likeTerm, likeTerm, likeTerm, likeTerm, likeTerm);
        }
      }
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    // Count query
    const countSql = `
      SELECT COUNT(*) as count
      FROM medicines m
      JOIN generics g ON m.generic_id = g.id
      JOIN manufacturers mfr ON m.manufacturer_id = mfr.id
      ${whereSql}
    `;
    const countRow = db.prepare(countSql).get(...params);
    const totalMatches = countRow ? Number(countRow.count) : 0;

    // Data query
    const orderSql = q 
      ? `ORDER BY CASE WHEN m.brand_name LIKE ? THEN 0 ELSE 1 END, m.brand_name ASC`
      : `ORDER BY m.brand_name ASC`;
    
    const dataParams = q ? [`${q}%`, ...params, limit, offset] : [...params, limit, offset];

    const dataSql = `
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
      ${whereSql}
      ${orderSql}
      LIMIT ? OFFSET ?
    `;

    const rows = db.prepare(dataSql).all(...dataParams);

    // Format active ingredients
    const results = rows.map((r: any) => {
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
    });

    return NextResponse.json({
      total_matches: totalMatches,
      offset,
      limit,
      results,
    });
  } catch (error: any) {
    console.error('Search API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
