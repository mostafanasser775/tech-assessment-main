"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateProfile(data: {
  name: string;
  email: string;
  companyName: string;
  jobTitle?: string;
}) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("Not authenticated");
    }

    // Update user profile
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: data.name,
        email: data.email,
        companyName: data.companyName,
        jobTitle: data.jobTitle,
      },
    });

    revalidatePath("/dashboard/settings");
    return { success: true };
  } catch (error) {
    console.error("Error updating profile:", error);
    return { success: false, error: "Failed to update profile" };
  }
}

export async function updateNotificationSettings(data: {
  emailNotifications: boolean;
  taskUpdates: boolean;
  projectUpdates: boolean;
  weeklyReports: boolean;
}) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("Not authenticated");
    }

    // Convert settings to JSON string
    const settingsString = JSON.stringify({
      emailNotifications: data.emailNotifications,
      taskUpdates: data.taskUpdates,
      projectUpdates: data.projectUpdates,
      weeklyReports: data.weeklyReports,
    });

    // Update notification settings
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        notificationSettings: settingsString,
      },
    });

    revalidatePath("/dashboard/settings");
    return { success: true };
  } catch (error) {
    console.error("Error updating notification settings:", error);
    return { success: false, error: "Failed to update notification settings" };
  }
} 