import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST() {
  try {
    const today = new Date()

    const overdueLoans = await prisma.loan.findMany({
      where: {
        status: 'APPROVED',
        dueDate: { lt: today },
        defaultNotified: false,
      },
      include: {
        borrower: true,
        coMakers: { include: { user: true } },
      },
    })

    let processedCount = 0

    for (const loan of overdueLoans) {
      const dueDate = new Date(loan.dueDate)
      const twoMonthsAfterDue = new Date(dueDate)
      twoMonthsAfterDue.setMonth(twoMonthsAfterDue.getMonth() + loan.termMonths)

      if (today > twoMonthsAfterDue) {
        await prisma.loan.update({
          where: { id: loan.id },
          data: { status: 'DEFAULTED' },
        })

        await prisma.notification.create({
          data: {
            userId: loan.borrowerId,
            type: 'LOAN_DEFAULTED',
            title: 'Loan Defaulted',
            message: `Your loan has been defaulted. Please contact admin.`,
            actionUrl: `/groups/${loan.groupId}/loans/${loan.id}`,
          },
        })

        for (const coMaker of loan.coMakers) {
          await prisma.notification.create({
            data: {
              userId: coMaker.userId,
              type: 'LOAN_DEFAULTED',
              title: 'Co-Maker Loan Defaulted',
              message: 'A loan you are co-making has been defaulted.',
              actionUrl: `/groups/${loan.groupId}/loans/${loan.id}`,
            },
          })
        }

        const group = await prisma.group.findUnique({ where: { id: loan.groupId } })
        if (group) {
          await prisma.notification.create({
            data: {
              userId: group.ownerId,
              type: 'LOAN_DEFAULTED',
              title: 'Loan Defaulted',
              message: `Loan from ${loan.isNonMember ? loan.nonMemberName : 'member'} has been defaulted.`,
              actionUrl: `/groups/${loan.groupId}/loans/${loan.id}`,
            },
          })
        }
      } else {
        await prisma.loan.update({
          where: { id: loan.id },
          data: { defaultNotified: true },
        })

        const daysOverdue = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))

        await prisma.notification.create({
          data: {
            userId: loan.borrowerId,
            type: 'LOAN_OVERDUE',
            title: daysOverdue <= 0 ? 'Loan Due Soon' : 'Loan Overdue',
            message: `Your loan is ${daysOverdue <= 0 ? 'due soon' : `${Math.abs(daysOverdue)} days overdue`}.`,
            actionUrl: `/groups/${loan.groupId}/loans/${loan.id}`,
          },
        })
      }

      processedCount++
    }

    return NextResponse.json({ message: 'Loan due dates checked', processedCount })
  } catch (error) {
    console.error('Error checking loan due dates:', error)
    return NextResponse.json({ error: 'Failed to check loan due dates' }, { status: 500 })
  }
}
