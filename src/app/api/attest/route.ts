import { NextResponse } from 'next/server';
import { signalStore } from '@/lib/store';
import { AttestationType } from '@/types';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      incidentId,
      type,
      observation,
      observedAt,
      locationObserved,
      isStillActive,
      contradictionDetails,
      hearsaySource,
      isForwardedMessage,
    } = body;

    if (!incidentId || !type || !observation) {
      return NextResponse.json(
        { error: 'Missing required attestation fields.' },
        { status: 400 }
      );
    }

    const result = signalStore.submitAttestation({
      incidentId,
      type: type as AttestationType,
      observation,
      observedAt: observedAt || 'Recent',
      locationObserved: locationObserved || 'On scene',
      isStillActive,
      contradictionDetails,
      hearsaySource,
      isForwardedMessage,
    });

    return NextResponse.json({
      success: true,
      attestation: result.attestation,
      updatedIncident: result.updatedIncident,
      stateChanged: result.stateChanged,
    });
  } catch (error) {
    console.error('API route error in /api/attest:', error);
    return NextResponse.json(
      { error: 'Failed to record attestation.' },
      { status: 500 }
    );
  }
}
