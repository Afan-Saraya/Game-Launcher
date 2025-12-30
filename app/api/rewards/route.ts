import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const CENTRAL_API_URL = process.env.CENTRAL_API_URL
const ADMIN_EMAIL = process.env.CENTRAL_ADMIN_EMAIL

function createCentralAccountServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_AUTH_SUPABASE_URL!,
    process.env.CENTRAL_SUPABASE_SERVICE_KEY!
  )
}

// Award coins to user
async function awardCoins(accountId: string, amount: number): Promise<boolean> {
  try {
    const response = await fetch(`${CENTRAL_API_URL}/api/accounts/${accountId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-email': ADMIN_EMAIL!
      },
      body: JSON.stringify({ balanceDelta: amount })
    })
    return response.ok
  } catch (error) {
    console.error('Failed to award coins:', error)
    return false
  }
}

// Award XP to user
async function awardXP(accountId: string, xpAmount: number): Promise<boolean> {
  try {
    const db = createCentralAccountServiceClient()
    
    const { data: profile } = await db
      .from('xp_profiles')
      .select('xp_total, xp_current_level, xp_next_level, level')
      .eq('account_id', accountId)
      .single()

    if (!profile) return false

    const newXpTotal = profile.xp_total + xpAmount
    let newXpCurrentLevel = profile.xp_current_level + xpAmount
    let newLevel = profile.level
    let newXpNextLevel = profile.xp_next_level

    // Level up check (every level requires level * 1000 XP)
    while (newXpCurrentLevel >= newXpNextLevel) {
      newXpCurrentLevel -= newXpNextLevel
      newLevel += 1
      newXpNextLevel = newLevel * 1000
    }

    await db.from('xp_profiles').update({
      xp_total: newXpTotal,
      xp_current_level: newXpCurrentLevel,
      xp_next_level: newXpNextLevel,
      level: newLevel,
    }).eq('account_id', accountId)

    return true
  } catch (error) {
    console.error('Failed to award XP:', error)
    return false
  }
}

export async function POST(request: NextRequest) {
  try {
    const { accountId, coins, xp } = await request.json()

    if (!accountId) {
      return NextResponse.json({ success: false, error: 'Account ID required' }, { status: 400 })
    }

    const results = {
      coins: { awarded: false, amount: 0 },
      xp: { awarded: false, amount: 0 }
    }

    // Award coins if specified
    if (coins && coins > 0) {
      results.coins.awarded = await awardCoins(accountId, coins)
      results.coins.amount = coins
    }

    // Award XP if specified
    if (xp && xp > 0) {
      results.xp.awarded = await awardXP(accountId, xp)
      results.xp.amount = xp
    }

    return NextResponse.json({
      success: true,
      results
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to award rewards' }, { status: 500 })
  }
}
