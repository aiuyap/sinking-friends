import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { addDays } from '@/lib/utils'

function getNextPayday(startDate: Date, paydayDay: number): Date {
  const date = new Date(startDate)
  const currentDay = date.getDate()
  if (currentDay > paydayDay) {
    date.setMonth(date.getMonth() + 1)
  }
  date.setDate(paydayDay)
  return date
}

export async function POST() {
  try {
    const groups = await prisma.group.findMany({
      where: { termEndDate: { gte: new Date() } },
      include: {
        settings: true,
        members: {
          where: { isActive: true },
          include: { contributions: true },
        },
      },
    })

    let generatedCount = 0

    for (const group of groups) {
      const gracePeriodDays = group.settings?.gracePeriodDays || 7

      for (const member of group.members) {
        const lastContribution = member.contributions.sort(
          (a, b) => b.scheduledDate.getTime() - a.scheduledDate.getTime()
        )[0]

        let nextScheduledDate: Date

        if (lastContribution) {
          nextScheduledDate = new Date(lastContribution.scheduledDate)
          nextScheduledDate.setDate(nextScheduledDate.getDate() + 14)
        } else {
          const startDate = member.joinedAt > group.termStartDate ? member.joinedAt : group.termStartDate
          nextScheduledDate = getNextPayday(startDate, member.personalPayday)
        }

        if (nextScheduledDate > group.termEndDate) continue

        const existing = await prisma.contribution.findFirst({
          where: { memberId: member.id, scheduledDate: nextScheduledDate },
        })

        if (!existing) {
          await prisma.contribution.create({
            data: {
              groupId: group.id,
              memberId: member.id,
              scheduledDate: nextScheduledDate,
              amount: member.biWeeklyContribution,
              gracePeriodEnd: addDays(nextScheduledDate, gracePeriodDays),
            },
          })
          generatedCount++
        }
      }
    }

    return NextResponse.json({ message: 'Contributions generated', generatedCount })
  } catch (error) {
    console.error('Error generating contributions:', error)
    return NextResponse.json({ error: 'Failed to generate contributions' }, { status: 500 })
  }
}
