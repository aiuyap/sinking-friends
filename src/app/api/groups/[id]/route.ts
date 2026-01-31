import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const group = await prisma.group.findUnique({
      where: { id },
      include: { settings: true },
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
      },
    })
  } catch (error) {
    console.error('Error fetching group:', error)
    return NextResponse.json({ error: 'Failed to fetch group' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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
      },
    })

    return NextResponse.json({ group: updatedGroup })
  } catch (error) {
    console.error('Error updating group:', error)
    return NextResponse.json({ error: 'Failed to update group' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

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
