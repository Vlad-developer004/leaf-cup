"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { updateNotificationPrefs } from "@/lib/account/notification-actions";

type NotificationsValues = {
  emailAnnouncements: boolean;
  emailBagReminder: boolean;
};

export function NotificationsForm({
  initialValues,
  dict,
}: {
  initialValues: NotificationsValues;
  dict: {
    announcementsTitle: string;
    announcementsDesc: string;
    bagTitle: string;
    bagDesc: string;
    success: string;
    submitIdle: string;
    submitPending: string;
  };
}) {
  const router = useRouter();
  const [values, setValues] = useState(initialValues);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    startTransition(async () => {
      const result = await updateNotificationPrefs(values);
      if (!result.success) {
        setError(result.error);
        return;
      }
      setSuccess(true);
      router.refresh();
      setTimeout(() => setSuccess(false), 2000);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 rounded-xl border p-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-medium">{dict.announcementsTitle}</span>
          <span className="text-sm text-muted-foreground">
            {dict.announcementsDesc}
          </span>
        </div>
        <Switch
          checked={values.emailAnnouncements}
          onCheckedChange={(checked) =>
            setValues((prev) => ({ ...prev, emailAnnouncements: checked }))
          }
          aria-label={dict.announcementsTitle}
        />
      </div>

      <div className="flex items-center justify-between gap-4 border-t pt-6">
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-medium">{dict.bagTitle}</span>
          <span className="text-sm text-muted-foreground">
            {dict.bagDesc}
          </span>
        </div>
        <Switch
          checked={values.emailBagReminder}
          onCheckedChange={(checked) =>
            setValues((prev) => ({ ...prev, emailBagReminder: checked }))
          }
          aria-label={dict.bagTitle}
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
      {success && <p className="text-sm text-foreground">{dict.success}</p>}

      <Button type="submit" size="lg" className="w-full sm:w-fit sm:px-8" disabled={isPending}>
        {isPending ? dict.submitPending : dict.submitIdle}
      </Button>
    </form>
  );
}
