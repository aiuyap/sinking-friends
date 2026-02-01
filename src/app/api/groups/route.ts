import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

// GET /api/groups - Get all groups for current user
export async function GET(request: NextRequest) {
  try {
    // Get the session cookie
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('__session')

    if (!sessionCookie?.value) {
      return NextResponse.json(
        { error: 'No session cookie found' },
        { status: 401 }
      )
    }

    // Verify the token and get user
    const user = await getCurrentUser(sessionCookie.value)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    // Get groups where user is owner or member
    const [ownedGroups, memberGroups] = await Promise.all([
      prisma.group.findMany({
        where: { ownerId: user.id },
        include: {
          owner: true,
          members: true,
          settings: true,
          contributions: true
        }
      }),
      prisma.group.findMany({
        where: { members: { some: { userId: user.id } } },
        include: {
          owner: true,
          members: true,
          settings: true,
          contributions: true
        }
      })
    ])

    // Combine and format groups
    const allGroups = [...ownedGroups, ...memberGroups]
    const uniqueGroups = allGroups.filter((group, index, self) => 
      index === self.findIndex(g => g.id === group.id)
    )

    const formattedGroups = uniqueGroups.map(group => ({
      id: group.id,
      name: group.name,
      description: group.description,
      role: group.ownerId === user.id ? 'ADMIN' : 'MEMBER',
      memberCount: group.members.length,
      totalPool: group.contributions.reduce((sum, c) => sum + c.amount, 0),
      interestRate: group.loanInterestRateMember,
      termEndDate: group.termEndDate,
      createdAt: group.createdAt
    }))

    return NextResponse.json({ groups: formattedGroups })
  } catch (error) {
    console.error('Error fetching groups:', error)
    return NextResponse.json(
      { error: 'Failed to fetch groups' },
      { status: 500 }
    )
  }
}

// POST /api/groups - Create new group
export async function POST(request: NextRequest) {
  try {
    // Get the session cookie
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('__session')

    if (!sessionCookie?.value) {
      return NextResponse.json(
        { error: 'No session cookie found' },
        { status: 401 }
      )
    }

    // Verify the token and get user
    const user = await getCurrentUser(sessionCookie.value)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { name, description, interestRate, termDuration, termStartDate, termEndDate, biWeeklyContribution, personalPayday, yearEndDate } = body

    // Create group with settings in transaction
    const newGroup = await prisma.$transaction(async (tx) => {
      const group = await tx.group.create({
        data: {
          name,
          description,
          ownerId: user.id,
          loanInterestRateMember: interestRate || 5,
          termDuration: termDuration || 2,
          termStartDate: termStartDate ? new Date(termStartDate) : new Date(),
          termEndDate: termEndDate ? new Date(termEndDate) : new Date(Date.now() + 60 * 24 * 60 * 60 * 1000) // Default 60 days
        }
      })

      // Create default settings
      await tx.groupSettings.create({
        data: {
          groupId: group.id,
          yearEndDate: yearEndDate ? new Date(yearEndDate) : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // Default 1 year
          gracePeriodDays: 7,
          reminderDaysBeforePaydate: 2,
          yearEndDateGracePeriod: 5
        }
      })

      // Add owner as first member
      await tx.groupMember.create({
        data: {
          groupId: group.id,
          userId: user.id,
          role: 'ADMIN',
          biWeeklyContribution: biWeeklyContribution || 1000,
          personalPayday: personalPayday || 15
        }
      })

      return group
    })

    return NextResponse.json({
      id: newGroup.id,
      name: newGroup.name,
      description: newGroup.description,
      interestRate: interestRate || 5,
      createdAt: newGroup.createdAt
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating group:', error)
    return NextResponse.json(
      { error: 'Failed to create group' },
      { status: 500 }
    )
  }
}
