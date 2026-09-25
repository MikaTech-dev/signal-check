import { NextResponse } from 'next/server';
import { auditReportWithDeepSeek } from '@/lib/deepseek';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { report, rawText, incidentType, locationLabel } = body;
    const textToAudit = rawText || report;

    if (!textToAudit || typeof textToAudit !== 'string' || textToAudit.trim().length === 0) {
      return NextResponse.json(
        { error: 'Please provide valid community report text.' },
        { status: 400 }
      );
    }

    const triageAudit = await auditReportWithDeepSeek(
      textToAudit,
      incidentType || 'ROAD_OBSTRUCTION',
      locationLabel || 'Nearby Landmark'
    );

    return NextResponse.json({
      success: true,
      triageAudit,
    });
  } catch (error) {
    console.error('API route error in /api/analyze:', error);
    return NextResponse.json(
      { error: 'Failed to process report with safety filter.' },
      { status: 500 }
    );
  }
}
