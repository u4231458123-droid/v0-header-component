import { task } from "@trigger.dev/sdk/v3";
import { z } from "zod";

export const sendNotification = task({
  id: "send-notification",
  run: async (payload: { userId: string; type: "email" | "push" | "sms"; subject: string; body: string }, { ctx }) => {
    // E-Mail/Push/SMS-Benachrichtigungen asynchron versenden
    // Vermeidet Blocking im Haupt-Request-Flow

    const { userId, type, subject, body } = payload;

    // TODO: Implementiere Notification-Versand
    // Beispiel: await sendEmail(userId, subject, body);
    // oder: await sendPushNotification(userId, subject, body);

    return {
      success: true,
      userId,
      type,
      sentAt: new Date().toISOString(),
    };
  },
  schema: z.object({
    userId: z.string(),
    type: z.enum(["email", "push", "sms"]),
    subject: z.string(),
    body: z.string(),
  }),
});

