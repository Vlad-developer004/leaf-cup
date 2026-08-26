"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Tag, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { applyPromoCode, removePromoCode } from "@/lib/cart-actions";

export type PromoCodeDict = {
  placeholder: string;
  applyBtn: string;
  applyingBtn: string;
  removeLabel: string;
  invalidNotice: string;
};

type AppliedPromo =
  | { code: string; discountAmount: number; invalid: false }
  | { code: string; discountAmount: 0; invalid: true; error: string };

export function PromoCodeForm({
  appliedPromo,
  dict,
}: {
  appliedPromo: AppliedPromo | null;
  dict: PromoCodeDict;
}) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleApply(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await applyPromoCode(code);
      if (!result.success) {
        setError(result.error);
        return;
      }
      setCode("");
      router.refresh();
    });
  }

  function handleRemove() {
    setError(null);
    startTransition(async () => {
      await removePromoCode();
      router.refresh();
    });
  }

  if (appliedPromo) {
    return (
      <div className="flex flex-col gap-1.5 border-y py-3">
        <div className="flex items-center gap-2">
          <Tag className="h-4 w-4 shrink-0 text-muted-foreground" />
          <span className="flex-1 truncate text-sm font-medium">{appliedPromo.code}</span>
          <button
            type="button"
            onClick={handleRemove}
            disabled={isPending}
            aria-label={dict.removeLabel}
            className="shrink-0 text-muted-foreground hover:text-foreground disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {appliedPromo.invalid && (
          <p className="text-xs text-destructive">{dict.invalidNotice}</p>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleApply} className="flex flex-col gap-1.5 border-y py-3">
      <div className="flex items-center gap-2">
        <Tag className="h-4 w-4 shrink-0 text-muted-foreground" />
        <Input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder={dict.placeholder}
          className="h-auto border-none px-0 py-0 shadow-none focus-visible:ring-0"
        />
        <button
          type="submit"
          disabled={isPending || !code.trim()}
          className="shrink-0 text-xs font-medium text-foreground underline-offset-4 hover:underline disabled:cursor-not-allowed disabled:text-muted-foreground/60 disabled:no-underline"
        >
          {isPending ? dict.applyingBtn : dict.applyBtn}
        </button>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </form>
  );
}
