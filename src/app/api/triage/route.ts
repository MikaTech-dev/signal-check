import { NextResponse } from 'next/server';
import { auditReportWithDeepSeek } from '@/lib/deepseek';
import { IncidentType } from '@/types';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { rawText, incidentType, locationLabel } = body;

    if (!rawText || typeof rawText !== 'string' || rawText.trim().length === 0) {
      return NextResponse.json(
        { error: 'Please provide valid community report text.' },
        { status: 400 }
      );
    }

    const triageAudit = await auditReportWithDeepSeek(
      rawText,
      (incidentType as IncidentType) || 'ROAD_OBSTRUCTION',
      locationLabel || 'Nearby Landmark'
    );

    return NextResponse.json({
      success: true,
      triageAudit,
    });
  } catch (error) {
    console.error('API route error in /api/triage:', error);
    return NextResponse.json(
      { error: 'Failed to process report with triage auditor.' },
      { status: 500 }
    );
  }
}
