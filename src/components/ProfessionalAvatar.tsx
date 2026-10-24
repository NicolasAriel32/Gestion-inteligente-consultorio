import { cn } from "../lib/utils";

export function ProfessionalAvatar({ className = "" }: { className?: string }) {
  return <img src="/images/martina-rios-demo.webp" alt="Retrato generado de Martina Ríos, profesional ficticia de la demo" className={cn("shrink-0 rounded-full object-cover object-center", className)} width={160} height={160} />;
}
