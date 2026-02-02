import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...\n');

  // Clear existing data
  await prisma.loanRepayment.deleteMany();
  await prisma.coMaker.deleteMany();
  await prisma.contribution.deleteMany();
  await prisma.loan.deleteMany();
  await prisma.groupMember.deleteMany();
  await prisma.groupSettings.deleteMany();
  await prisma.invite.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.group.deleteMany();
  await prisma.user.deleteMany();

  console.log('✅ Cleared existing data\n');

  // Create Users
  const users = await Promise.all([
    prisma.user.create({
      data: {
        id: 'user_aiu_001',
        email: 'aiutheinvoker@gmail.com',
        name: 'Aiu Jymph Yap',
        image: null,
      },
    }),
    prisma.user.create({
      data: {
        id: 'user_juan_002',
        email: 'juan.delacruz@email.com',
        name: 'Juan dela Cruz',
        image: null,
      },
    }),
    prisma.user.create({
      data: {
        id: 'user_maria_003',
        email: 'maria.santos@email.com',
        name: 'Maria Santos',
        image: null,
      },
    }),
    prisma.user.create({
      data: {
        id: 'user_pedro_004',
        email: 'pedro.reyes@email.com',
        name: 'Pedro Reyes',
        image: null,
      },
    }),
  ]);

  console.log('✅ Created 4 users');
  console.log(`   - ${users[0].name} (Admin)`);
  console.log(`   - ${users[1].name} (Member)`);
  console.log(`   - ${users[2].name} (Member)`);
  console.log(`   - ${users[3].name} (Member)\n`);

  // Create Group
  const group = await prisma.group.create({
    data: {
      id: 'group_family_001',
      name: 'Family Savings Circle',
      description: 'Our family emergency fund and loan cooperative for 2026',
      loanInterestRateMember: 5.0,
      loanInterestRateNonMember: 10.0,
      maxLoanPercent: 50,
      termDuration: 2,
      termStartDate: new Date('2026-01-01'),
      termEndDate: new Date('2026-12-31'),
      ownerId: users[0].id,
    },
  });

  console.log('✅ Created group: Family Savings Circle\n');

  // Create Group Settings
  await prisma.groupSettings.create({
    data: {
      groupId: group.id,
      gracePeriodDays: 7,
      reminderDaysBeforePaydate: 2,
      yearEndDate: new Date('2026-12-20'),
      yearEndDateGracePeriod: 5,
    },
  });

  console.log('✅ Created group settings\n');

  // Create Group Members
  const members = await Promise.all([
    // Aiu - Admin
    prisma.groupMember.create({
      data: {
        groupId: group.id,
        userId: users[0].id,
        role: 'ADMIN',
        biWeeklyContribution: 2000,
        personalPayday: 15,
        isActive: true,
        totalContributions: 16000, // 8 contributions × 2000
        joinedAt: new Date('2026-01-01'),
      },
    }),
    // Juan - Member
    prisma.groupMember.create({
      data: {
        groupId: group.id,
        userId: users[1].id,
        role: 'MEMBER',
        biWeeklyContribution: 1500,
        personalPayday: 15,
        isActive: true,
        totalContributions: 12000,
        joinedAt: new Date('2026-01-01'),
      },
    }),
    // Maria - Member
    prisma.groupMember.create({
      data: {
        groupId: group.id,
        userId: users[2].id,
        role: 'MEMBER',
        biWeeklyContribution: 1000,
        personalPayday: 30,
        isActive: true,
        totalContributions: 8000,
        joinedAt: new Date('2026-01-01'),
      },
    }),
    // Pedro - Member
    prisma.groupMember.create({
      data: {
        groupId: group.id,
        userId: users[3].id,
        role: 'MEMBER',
        biWeeklyContribution: 1500,
        personalPayday: 15,
        isActive: true,
        totalContributions: 12000,
        joinedAt: new Date('2026-01-01'),
      },
    }),
  ]);

  console.log('✅ Created 4 group members\n');

  // Create Contributions (8 bi-weekly periods)
  const contributionDates = [
    new Date('2026-01-15'),
    new Date('2026-01-30'),
    new Date('2026-02-15'),
    new Date('2026-02-28'),
    new Date('2026-03-15'),
    new Date('2026-03-30'),
    new Date('2026-04-15'),
    new Date('2026-04-30'),
  ];

  for (const member of members) {
    for (let i = 0; i < contributionDates.length; i++) {
      const isPaid = i < 6; // First 6 are paid, last 2 pending
      const isMissed = false;

      await prisma.contribution.create({
        data: {
          groupId: group.id,
          memberId: member.id,
          scheduledDate: contributionDates[i],
          paidDate: isPaid ? new Date(contributionDates[i].getTime() + 86400000) : null,
          amount: member.biWeeklyContribution,
          isMissed,
          gracePeriodEnd: new Date(contributionDates[i].getTime() + 7 * 86400000),
        },
      });
    }
  }

  console.log('✅ Created 32 contributions (8 periods × 4 members)');
  console.log('   - 24 paid contributions');
  console.log('   - 8 pending contributions\n');

  // Create Loans

  // Loan 1: Active loan - Juan borrowed 10,000 (approved, partially repaid)
  const loan1 = await prisma.loan.create({
    data: {
      groupId: group.id,
      borrowerId: users[1].id,
      isNonMember: false,
      amount: 10000,
      interestRate: 5.0,
      totalInterest: 1000, // 10% for 2 months
      termMonths: 2,
      status: 'APPROVED',
      adminApprovalId: users[0].id,
      adminApprovedAt: new Date('2026-02-01'),
      approvedDate: new Date('2026-02-01'),
      dueDate: new Date('2026-04-01'),
      repaidAmount: 5500,
      isFullyRepaid: false,
    },
  });

  // Add co-maker for loan 1
  await prisma.coMaker.create({
    data: {
      loanId: loan1.id,
      userId: users[0].id,
    },
  });

  // Add repayments for loan 1
  await prisma.loanRepayment.create({
    data: {
      loanId: loan1.id,
      amount: 5500,
      principal: 5000,
      interest: 500,
      paymentDate: new Date('2026-03-01'),
    },
  });

  console.log('✅ Created Loan 1: Juan - ₱10,000 (Active, 50% repaid)');
  console.log('   - Co-maker: Aiu');
  console.log('   - Due: April 1, 2026\n');

  // Loan 2: Pending loan - Maria requesting 5,000
  const loan2 = await prisma.loan.create({
    data: {
      groupId: group.id,
      borrowerId: users[2].id,
      isNonMember: false,
      amount: 5000,
      interestRate: 5.0,
      totalInterest: 500,
      termMonths: 2,
      status: 'PENDING',
      approvedDate: new Date('2026-04-15'),
      dueDate: new Date('2026-06-15'),
      repaidAmount: 0,
      isFullyRepaid: false,
    },
  });

  console.log('✅ Created Loan 2: Maria - ₱5,000 (Pending approval)');
  console.log('   - No co-maker required (within monthly contribution)\n');

  // Loan 3: Repaid loan - Pedro borrowed 8,000 (fully repaid)
  const loan3 = await prisma.loan.create({
    data: {
      groupId: group.id,
      borrowerId: users[3].id,
      isNonMember: false,
      amount: 8000,
      interestRate: 5.0,
      totalInterest: 800,
      termMonths: 2,
      status: 'REPAID',
      adminApprovalId: users[0].id,
      adminApprovedAt: new Date('2026-01-15'),
      approvedDate: new Date('2026-01-15'),
      dueDate: new Date('2026-03-15'),
      repaidAmount: 8800,
      isFullyRepaid: true,
    },
  });

  // Add co-maker for loan 3
  await prisma.coMaker.create({
    data: {
      loanId: loan3.id,
      userId: users[0].id,
    },
  });

  // Add repayments for loan 3
  await prisma.loanRepayment.createMany({
    data: [
      {
        loanId: loan3.id,
        amount: 4400,
        principal: 4000,
        interest: 400,
        paymentDate: new Date('2026-02-15'),
      },
      {
        loanId: loan3.id,
        amount: 4400,
        principal: 4000,
        interest: 400,
        paymentDate: new Date('2026-03-15'),
      },
    ],
  });

  console.log('✅ Created Loan 3: Pedro - ₱8,000 (Fully repaid)');
  console.log('   - Co-maker: Aiu');
  console.log('   - Interest earned: ₱800\n');

  // Loan 4: Pending loan - Juan requesting 12,000 (for rejection testing)
  const loan4 = await prisma.loan.create({
    data: {
      groupId: group.id,
      borrowerId: users[1].id,
      isNonMember: false,
      amount: 12000,
      interestRate: 5.0,
      totalInterest: 1200,
      termMonths: 2,
      status: 'PENDING',
      approvedDate: new Date('2026-02-15'),
      dueDate: new Date('2026-04-15'),
      repaidAmount: 0,
      isFullyRepaid: false,
    },
  });

  console.log('✅ Created Loan 4: Juan - ₱12,000 (Pending approval)');
  console.log('   - Ready for rejection testing\n');

  // Create some notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: users[1].id,
        type: 'LOAN_APPROVED',
        title: 'Loan Approved',
        message: 'Your loan request for ₱10,000 has been approved',
        actionUrl: `/groups/${group.id}/loans/${loan1.id}`,
        isRead: true,
      },
      {
        userId: users[2].id,
        type: 'CONTRIBUTION_DUE',
        title: 'Contribution Due',
        message: 'Your bi-weekly contribution of ₱1,000 is due on April 15',
        actionUrl: `/groups/${group.id}/contributions`,
        isRead: false,
      },
      {
        userId: users[0].id,
        type: 'LOAN_APPROVED',
        title: 'New Loan Request',
        message: 'Maria Santos requested a loan of ₱5,000',
        actionUrl: `/groups/${group.id}/loans/${loan2.id}`,
        isRead: false,
      },
      {
        userId: users[0].id,
        type: 'LOAN_APPROVED',
        title: 'New Loan Request',
        message: 'Juan dela Cruz requested a loan of ₱12,000',
        actionUrl: `/groups/${group.id}/loans/${loan4.id}`,
        isRead: false,
      },
    ],
  });

  console.log('✅ Created 4 notifications\n');

  console.log('🎉 Database seed completed successfully!');
  console.log('\n📊 Summary:');
  console.log('   • 4 Users created');
  console.log('   • 1 Group created');
  console.log('   • 4 Group members');
  console.log('   • 32 Contributions (24 paid, 8 pending)');
  console.log('   • 4 Loans (1 active, 2 pending, 1 repaid)');
  console.log('   • 3 Repayment records');
  console.log('   • 4 Notifications\n');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
