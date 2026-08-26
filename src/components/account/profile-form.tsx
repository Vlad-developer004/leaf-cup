"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Camera } from "lucide-react";
import { Avatar, AvatarBadge, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateProfile } from "@/lib/account/profile-actions";
import { resizeImageToDataUrl } from "@/lib/resize-image";

type ProfileValues = {
  firstName: string;
  lastName: string;
  phone: string;
  image: string | null;
};

export function ProfileForm({
  initialValues,
  email,
  dict,
}: {
  initialValues: ProfileValues;
  email: string;
  dict: {
    changePhotoLabel: string;
    photoLabel: string;
    uploadPhotoBtn: string;
    firstNameLabel: string;
    lastNameLabel: string;
    emailNote: string;
    phoneLabel: string;
    submitIdle: string;
    submitPending: string;
    submitSuccess: string;
    errorFileSelect: string;
    errorFileSize: string;
    errorFileProcess: string;
  };
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [values, setValues] = useState(initialValues);
  const [imageChanged, setImageChanged] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  const initials = (`${values.firstName} ${values.lastName}`.trim() || email)
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError(dict.errorFileSelect);
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setError(dict.errorFileSize);
      return;
    }

    try {
      const dataUrl = await resizeImageToDataUrl(file);
      setValues((prev) => ({ ...prev, image: dataUrl }));
      setImageChanged(true);
      setError(null);
    } catch {
      setError(dict.errorFileProcess);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    startTransition(async () => {
      const result = await updateProfile({
        firstName: values.firstName,
        lastName: values.lastName,
        phone: values.phone,
        ...(imageChanged ? { image: values.image ?? "" } : {}),
      });

      if (!result.success) {
        setError(result.error);
        return;
      }
      setSuccess(true);
      setImageChanged(false);
      router.refresh();
      setTimeout(() => setSuccess(false), 2000);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 rounded-xl border p-6">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="rounded-full transition-transform duration-200 ease-out hover:scale-105 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
          aria-label={dict.changePhotoLabel}
        >
          <Avatar className="h-16 w-16">
            {values.image && <AvatarImage src={values.image} alt="" />}
            <AvatarFallback className="text-base">{initials}</AvatarFallback>
            <AvatarBadge>
              <Camera className="h-3 w-3" />
            </AvatarBadge>
          </Avatar>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium">{dict.photoLabel}</span>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-left text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            {dict.uploadPhotoBtn}
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="firstName">{dict.firstNameLabel}</Label>
          <Input
            id="firstName"
            required
            value={values.firstName}
            onChange={(e) => setValues((prev) => ({ ...prev, firstName: e.target.value }))}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="lastName">{dict.lastNameLabel}</Label>
          <Input
            id="lastName"
            required
            value={values.lastName}
            onChange={(e) => setValues((prev) => ({ ...prev, lastName: e.target.value }))}
          />
        </div>
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" value={email} disabled />
          <span className="text-xs text-muted-foreground">
            {dict.emailNote}
          </span>
        </div>
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <Label htmlFor="phone">{dict.phoneLabel}</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="+49 …"
            value={values.phone}
            onChange={(e) => setValues((prev) => ({ ...prev, phone: e.target.value }))}
          />
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" size="lg" className="w-full sm:w-fit sm:px-8" disabled={isPending}>
        {isPending ? dict.submitPending : success ? dict.submitSuccess : dict.submitIdle}
      </Button>
    </form>
  );
}
