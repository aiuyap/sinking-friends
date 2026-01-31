import admin from 'firebase-admin';
import { adminAuth } from './firebase';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function syncUserWithDatabase(userRecord: { 
  uid: string, 
  email?: string | null, 
  name?: string | null, 
  picture?: string | null 
}) {
  // Check if user exists in database
  const existingUser = await prisma.user.findUnique({
    where: { email: userRecord.email! }
  });

  // If user doesn't exist, create a new record
  if (!existingUser) {
    return prisma.user.create({
      data: {
        id: userRecord.uid,
        email: userRecord.email!,
        name: userRecord.name,
        image: userRecord.picture
      }
    });
  }

  // If user exists but ID might have changed, update
  if (existingUser.id !== userRecord.uid) {
    return prisma.user.update({
      where: { email: userRecord.email! },
      data: {
        id: userRecord.uid,
        name: userRecord.name || existingUser.name,
        image: userRecord.picture || existingUser.image
      }
    });
  }

  return existingUser;
}

export async function getCurrentUser(token: string) {
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    return syncUserWithDatabase({
      uid: decodedToken.uid,
      email: decodedToken.email,
      name: decodedToken.name,
      picture: decodedToken.picture
    });
  } catch {
    return null;
  }
}

export async function isGroupAdmin(userId: string, groupId: string) {
  const group = await prisma.group.findUnique({
    where: { id: groupId, ownerId: userId }
  });

  return !!group;
}

export async function getUserGroups(userId: string) {
  // Get groups where user is either the owner or a member
  const [ownedGroups, memberGroups] = await Promise.all([
    prisma.group.findMany({
      where: { ownerId: userId },
      include: { owner: true }
    }),
    prisma.group.findMany({
      where: { members: { some: { userId } } },
      include: { owner: true }
    })
  ]);

  return {
    ownedGroups,
    memberGroups
  };
}