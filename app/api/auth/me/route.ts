import { NextRequest, NextResponse } from 'next/server'

const CENTRAL_API_URL = process.env.CENTRAL_API_URL

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const response = await fetch(`${CENTRAL_API_URL}/api/auth/me`, {
      headers: { authorization: authHeader },
      cache: 'no-store',
    })
    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to get user' }, { status: 500 })
  }
}
