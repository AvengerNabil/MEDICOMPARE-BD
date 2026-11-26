import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import path from 'path';
import fs from 'fs';

// Fallback SQLite instance for offline resilience
let localDbInstance: any = null;
function getLocalSQLite() {
  if (localDbInstance) return localDbInstance;
  try {
    const { DatabaseSync } = require('node:sqlite');
    let dbPath = path.resolve(process.cwd(), '../backend/medicompare.db');
    if (!fs.existsSync(dbPath)) dbPath = path.resolve(process.cwd(), 'medicompare.db');
    if (!fs.existsSync(dbPath)) dbPath = path.resolve(process.cwd(), '../medicompare.db');
    if (fs.existsSync(dbPath)) {
      localDbInstance = new DatabaseSync(dbPath);
      return localDbInstance;
    }
  } catch (err) {
    console.warn('SQLite fallback not available:', err);
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

  // 1. Try Supabase PostgreSQL First
  try {
    let query = supabase
      .from('view_medicine_full')
      .select('*', { count: 'exact' });

    if (q) {
      if (type === 'brand') {
        query = query.or(`brand_name.ilike.%${q}%,brand_name_bn.ilike.%${q}%`);
      } else if (type === 'generic') {
        query = query.or(`generic_name.ilike.%${q}%,generic_name_bn.ilike.%${q}%`);
      } else if (type === 'mfr') {
        query = query.or(`manufacturer_name.ilike.%${q}%,manufacturer_name_bn.ilike.%${q}%`);
      } else {
        query = query.or(
          `brand_name.ilike.%${q}%,generic_name.ilike.%${q}%,manufacturer_name.ilike.%${q}%`
        );
      }
    }

    if (dosageForm && dosageForm.toLowerCase() !== 'all') {
      query = query.ilike('dosage_form', dosageForm);
    }

    query = query.range(offset, offset + limit - 1).order('brand_name', { ascending: true });

    const { data, count, error } = await query;

    if (!error && data && data.length > 0) {
      const results = data.map((r: any) => ({
        id: r.id,
        brandName: r.brand_name,
        brandNameBn: r.brand_name_bn || r.brand_name,
        genericName: r.generic_name,
        genericNameBn: r.generic_name_bn || r.generic_name,
        genericId: r.generic_id,
        strength: r.strength,
        dosageForm: r.dosage_form,
        dosageFormBn: r.dosage_form_bn || r.dosage_form,
        route: r.route,
        releaseMechanism: r.release_mechanism,
        manufacturer: r.manufacturer_name,
        manufacturerBn: r.manufacturer_name_bn || r.manufacturer_name,
        manufacturerId: r.manufacturer_id,
        unitPrice: Number(r.unit_price),
        mrp: Number(r.mrp),
        packSize: r.pack_size,
        packUnit: r.pack_unit,
        priceType: r.price_type,
        registrationNumber: r.registration_number,
        verificationStatus: r.verification_status,
        isPrescriptionRequired: Boolean(r.is_prescription_required),
        dataSource: r.data_source,
        lastVerifiedDate: r.last_verified_at,
        therapeuticClass: r.therapeutic_class,
        therapeuticClassBn: r.therapeutic_class_bn,
        indicationsSummary: r.indications_summary,
        safetyAdvice: r.safety_advice,
        activeIngredients: [{ name: r.generic_name, strength: r.strength }],
      }));

      return NextResponse.json({
        total_matches: count || results.length,
        offset,
        limit,
        source: 'supabase_postgresql',
        results,
      });
    }
  } catch (supaErr) {
    console.warn('Supabase query error, falling back to local SQLite:', supaErr);
  }

  // 2. Fallback to Local SQLite if Supabase is offline or network fails
  const db = getLocalSQLite();
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
      if (type === 'brand') {
        whereClauses.push('(LOWER(m.brand_name) LIKE LOWER(?) OR LOWER(m.brand_name_bn) LIKE LOWER(?))');
        params.push(`%${q}%`, `%${q}%`);
      } else if (type === 'generic') {
        whereClauses.push('(LOWER(g.inn_name) LIKE LOWER(?) OR LOWER(g.inn_name_bn) LIKE LOWER(?))');
        params.push(`%${q}%`, `%${q}%`);
      } else if (type === 'mfr') {
        whereClauses.push('(LOWER(mfr.name) LIKE LOWER(?) OR LOWER(mfr.name_bn) LIKE LOWER(?))');
        params.push(`%${q}%`, `%${q}%`);
      } else {
        const terms = q.split(/\s+/).filter(Boolean);
        for (const term of terms) {
          whereClauses.push(`(
            LOWER(m.brand_name) LIKE LOWER(?) OR 
            LOWER(g.inn_name) LIKE LOWER(?) OR 
            LOWER(mfr.name) LIKE LOWER(?)
          )`);
          params.push(`%${term}%`, `%${term}%`, `%${term}%`);
        }
      }
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';
    const countSql = `
      SELECT COUNT(*) as total
      FROM medicines m
      JOIN generics g ON m.generic_id = g.id
      JOIN manufacturers mfr ON m.manufacturer_id = mfr.id
      ${whereSql}
    `;
    const countRow = db.prepare(countSql).get(...params);
    const total = countRow ? countRow.total : 0;

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
      ORDER BY m.brand_name ASC
      LIMIT ? OFFSET ?
    `;

    const rows = db.prepare(dataSql).all(...params, limit, offset);
    const results = rows.map((r: any) => ({
      ...r,
      isPrescriptionRequired: Boolean(r.isPrescriptionRequired),
      activeIngredients: [{ name: r.genericName, strength: r.strength }],
    }));

    return NextResponse.json({
      total_matches: total,
      offset,
      limit,
      source: 'sqlite_local_fallback',
      results,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
