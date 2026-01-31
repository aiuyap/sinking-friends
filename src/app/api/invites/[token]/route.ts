import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params

    // Mock invite validation - the Invite model doesn't exist in the schema
    // This would need to be implemented in a production app
    const invite = {
      id: 'mock-invite',
      token,
      email: 'invited@example.com',
      status: 'PENDING',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      group: {
        id: 'mock-group',
        name: 'Demo Group',
      },
    }

    return NextResponse.json({ invite })
  } catch (error) {
    console.error('Error validating invite:', error)
    return NextResponse.json({ error: 'Failed to validate invite' }, { status: 500 })
  }
}
