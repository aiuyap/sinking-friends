import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST() {
  try {
    const today = new Date()

    const missedContributions = await prisma.contribution.findMany({
      where: {
        paidDate: null,
        gracePeriodEnd: { lt: today },
        isMissed: false,
      },
      include: { member: true, group: { include: { settings: true } } },
    })

    let processedCount = 0

    for (const contribution of missedContributions) {
      const newMissedCount = contribution.member.missedConsecutivePayments + 1
      const isNowInactive = newMissedCount >= 3

      const updatedMember = await prisma.groupMember.update({
        where: { id: contribution.memberId },
        data: { missedConsecutivePayments: newMissedCount, isActive: !isNowInactive },
      })

      await prisma.contribution.update({
        where: { id: contribution.id },
        data: { isMissed: true },
      })

      if (newMissedCount >= 3 && !contribution.member.isActive !== updatedMember.isActive) {
        await prisma.notification.create({
          data: {
            userId: contribution.member.userId,
            type: 'CONTRIBUTION_MISSED',
            title: 'Became Inactive',
            message: 'You have missed 3 consecutive payments and are now inactive.',
            actionUrl: `/groups/${contribution.groupId}`,
          },
        })
      } else if (newMissedCount <= 3) {
        await prisma.notification.create({
          data: {
            userId: contribution.member.userId,
            type: 'CONTRIBUTION_MISSED',
            title: 'Payment Missed',
            message: `Your contribution for ${contribution.scheduledDate.toLocaleDateString()} was not paid within the grace period.`,
            actionUrl: `/groups/${contribution.groupId}`,
          },
        })
      }

      processedCount++
    }

    return NextResponse.json({ message: 'Missed payments checked', processedCount })
  } catch (error) {
    console.error('Error checking missed payments:', error)
    return NextResponse.json({ error: 'Failed to check missed payments' }, { status: 500 })
  }
}
