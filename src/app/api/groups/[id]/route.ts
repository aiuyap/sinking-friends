import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { getCurrentUser, isGroupAdmin } from '@/lib/auth'

// GET /api/groups/[id] - Get group details (member or admin only)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

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

    // Check if user is a member or admin of this group
    const membership = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId: id,
          userId: user.id
        }
      }
    })

    const isAdmin = await isGroupAdmin(user.id, id)

    if (!membership && !isAdmin) {
      return NextResponse.json(
        { error: 'You do not have access to this group' },
        { status: 403 }
      )
    }

    const group = await prisma.group.findUnique({
      where: { id },
      include: { 
        settings: true,
        members: {
          include: {
            user: true
          }
        }
      },
    })

    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 })
    }

    const memberCount = await prisma.groupMember.count({
      where: { groupId: id },
    })

    const totalPool = await prisma.contribution.aggregate({
      where: { groupId: id },
      _sum: { amount: true },
    })

    return NextResponse.json({
      group: {
        ...group,
        memberCount,
        totalPool: totalPool._sum.amount || 0,
        isAdmin,
        userRole: membership?.role || (isAdmin ? 'ADMIN' : null)
      },
    })
  } catch (error) {
    console.error('Error fetching group:', error)
    return NextResponse.json({ error: 'Failed to fetch group' }, { status: 500 })
  }
}

// PUT /api/groups/[id] - Update group (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

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

    // Check if user is admin
    const isAdmin = await isGroupAdmin(user.id, id)
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Only group admins can update group settings' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const group = await prisma.group.findUnique({ where: { id } })

    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 })
    }

    const updatedGroup = await prisma.group.update({
      where: { id },
      data: {
        name: body.name ?? group.name,
        description: body.description ?? group.description,
        loanInterestRateMember: body.loanInterestRateMember ?? group.loanInterestRateMember,
        loanInterestRateNonMember: body.loanInterestRateNonMember ?? group.loanInterestRateNonMember,
        termDuration: body.termDuration ?? group.termDuration,
      },
    })

    // Update settings if provided
    if (body.settings) {
      const existingSettings = await prisma.groupSettings.findUnique({
        where: { groupId: id }
      })
      
      if (existingSettings) {
        await prisma.groupSettings.update({
          where: { groupId: id },
          data: {
            gracePeriodDays: body.settings.gracePeriodDays,
            reminderDaysBeforePaydate: body.settings.reminderDaysBeforePaydate,
            yearEndDate: body.settings.yearEndDate ? new Date(body.settings.yearEndDate) : undefined,
            yearEndDateGracePeriod: body.settings.yearEndDateGracePeriod,
          }
        })
      }
    }

    return NextResponse.json({ group: updatedGroup })
  } catch (error) {
    console.error('Error updating group:', error)
    return NextResponse.json({ error: 'Failed to update group' }, { status: 500 })
  }
}

// DELETE /api/groups/[id] - Delete group (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

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

    // Check if user is admin
    const isAdmin = await isGroupAdmin(user.id, id)
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Only group admins can delete groups' },
        { status: 403 }
      )
    }

    const group = await prisma.group.findUnique({ where: { id } })

    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 })
    }

    await prisma.group.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting group:', error)
    return NextResponse.json({ error: 'Failed to delete group' }, { status: 500 })
  }
}
