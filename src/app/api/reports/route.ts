import { NextResponse } from 'next/server';
import { signalStore } from '@/lib/store';
import { auditReportWithDeepSeek } from '@/lib/deepseek';
import { Coordinates, IncidentType, ReportInputType, ReportSourceType } from '@/types';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      rawText,
      incidentType,
      sourceType,
      inputType,
      locationLabel,
      coordinates,
      eventTime,
      isHappeningNow,
    } = body;

    if (!rawText || !locationLabel || !coordinates) {
      return NextResponse.json(
        { error: 'Missing required report fields.' },
        { status: 400 }
      );
    }

    // Run audit
    const triageAudit = await auditReportWithDeepSeek(
      rawText,
      (incidentType as IncidentType) || 'ROAD_OBSTRUCTION',
      locationLabel
    );

    const result = signalStore.submitReport({
      incidentType: (incidentType as IncidentType) || 'ROAD_OBSTRUCTION',
      rawText,
      sourceType: (sourceType as ReportSourceType) || 'FIRSTHAND',
      inputType: (inputType as ReportInputType) || 'TEXT',
      locationLabel,
      coordinates: coordinates as Coordinates,
      eventTime: eventTime || 'Recent',
      isHappeningNow: Boolean(isHappeningNow),
      triageAudit,
    });

    return NextResponse.json({
      success: true,
      report: result.report,
      linkedIncident: result.linkedIncident,
      isNewIncident: result.isNewIncident,
    });
  } catch (error) {
    console.error('API route error in /api/reports:', error);
    return NextResponse.json(
      { error: 'Failed to ingest report.' },
      { status: 500 }
    );
  }
}
