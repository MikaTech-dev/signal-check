import { NextResponse } from 'next/server';
import { analyzeReportWithDeepSeek } from '@/lib/deepseek';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { report } = body;

    if (!report || typeof report !== 'string' || report.trim().length === 0) {
      return NextResponse.json(
        { error: 'Please provide a valid community report text.' },
        { status: 400 }
      );
    }

    const analysis = await analyzeReportWithDeepSeek(report);

    return NextResponse.json({
      success: true,
      analysis,
    });
  } catch (error) {
    console.error('API route error in /api/analyze:', error);
    return NextResponse.json(
      { error: 'Failed to process report with safety filter.' },
      { status: 500 }
    );
  }
}
