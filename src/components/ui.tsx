import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";
import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";
import { cn } from "../lib/utils";

const buttonVariants = cva("inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-deep focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50", {
  variants: {
    variant: {
      primary: "bg-deep text-white hover:bg-[#264e49]",
      secondary: "border border-line bg-white text-ink hover:bg-ivory",
      ghost: "text-muted hover:bg-ivory hover:text-ink",
      subtle: "bg-[#edf3ef] text-deep hover:bg-[#e2ece6]",
    },
    size: { default: "h-11", sm: "h-9 rounded-lg px-3 text-xs", icon: "h-11 w-11 p-0" },
  },
  defaultVariants: { variant: "primary", size: "default" },
});

export function Button({ className, variant, size, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants>) {
  return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-2xl border border-line bg-white shadow-sm", className)} {...props} />;
}
export function Badge({ className, tone = "neutral", children }: { className?: string; tone?: "neutral" | "green" | "amber" | "red" | "blue"; children: ReactNode }) {
  const tones = {
    neutral: "bg-[#f0f2f0] text-[#596761]",
    green: "bg-[#e6f0e9] text-[#315f47]",
    amber: "bg-[#f8eee2] text-[#885c2c]",
    red: "bg-[#f8e8e6] text-[#934d46]",
    blue: "bg-[#e9eff5] text-[#4d6d86]",
  };
  return <span className={cn("inline-flex min-h-7 items-center rounded-full px-2.5 text-xs font-medium", tones[tone], className)}>{children}</span>;
}
export function Field({ label, hint, error, className, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string; error?: string }) {
  const id = props.id || props.name || label.toLowerCase().replaceAll(" ", "-");
  return <label className={cn("grid gap-2 text-sm font-medium text-ink", className)} htmlFor={id}>
    {label}
    <input {...props} id={id} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined} className="h-11 w-full rounded-xl border border-line bg-white px-3.5 text-sm font-normal text-ink placeholder:text-[#8b9691] focus:border-deep focus:outline-none focus:ring-2 focus:ring-sage/60" />
    {error && <span id={`${id}-error`} className="text-xs font-normal text-red-700">{error}</span>}
    {!error && hint && <span id={`${id}-hint`} className="text-xs font-normal text-muted">{hint}</span>}
  </label>;
}
export function Modal({ open, onOpenChange, title, description, children, className }: { open: boolean; onOpenChange: (open: boolean) => void; title: string; description?: string; children: ReactNode; className?: string }) {
  return <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-40 bg-ink/45 backdrop-blur-sm " />
      <DialogPrimitive.Content className={cn("fixed left-1/2 top-1/2 z-50 max-h-[90dvh] w-[min(94vw,36rem)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border border-line bg-white p-6 shadow-2xl focus:outline-none", className)}>
        <div className="mb-5 flex items-start justify-between gap-4">
          <div><DialogPrimitive.Title className="font-display text-xl font-semibold text-ink">{title}</DialogPrimitive.Title>{description && <DialogPrimitive.Description className="mt-1 text-sm text-muted">{description}</DialogPrimitive.Description>}</div>
          <DialogPrimitive.Close asChild><button type="button" aria-label="Cerrar ventana" className="grid h-10 w-10 place-items-center rounded-xl text-muted hover:bg-ivory focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-deep"><X size={18} /></button></DialogPrimitive.Close>
        </div>
        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  </DialogPrimitive.Root>;
}
export function PageTitle({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: ReactNode }) {
  return <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
    <div><p className="mb-2 text-xs font-semibold uppercase tracking-[.16em] text-deep/75">{eyebrow}</p><h1 className="font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">{title}</h1><p className="mt-2 max-w-2xl text-sm text-muted">{description}</p></div>
    {action}
  </div>;
}


export function LoadingState() {
  return <div role="status" aria-live="polite" className="space-y-5">
    <span className="sr-only">Preparando la vista de demostración</span>
    <div className="h-9 w-64 animate-pulse rounded-lg bg-sage/35" />
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[1,2,3,4].map((item)=><div key={item} className="h-32 animate-pulse rounded-2xl border border-line bg-white" />)}</div>
    <div className="h-72 animate-pulse rounded-2xl border border-line bg-white" />
  </div>;
}
