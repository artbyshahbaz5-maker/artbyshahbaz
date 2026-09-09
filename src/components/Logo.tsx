import Image from "next/image";
import { cn } from "@/lib/utils";

// Shared brand mark. Renders the admin-managed logo (`settings.logo_url`) when
// one is set, otherwise the logo bundled at `public/logo.jpg`. The bundled file
// is always present, so this never needs a further icon fallback.
export function Logo({
  logoUrl,
  className,
  imgClassName,
  priority = false,
}: {
  logoUrl?: string | null;
  className?: string;
  imgClassName?: string;
  priority?: boolean;
}) {
  const src = logoUrl && logoUrl.trim() !== "" ? logoUrl : "/logo.jpg";
  return (
    <span className={cn("relative inline-block overflow-hidden shrink-0", className)}>
      <Image
        src={src}
        alt="Art By Shahbaz"
        fill
        sizes="48px"
        className={cn("object-contain", imgClassName)}
        priority={priority}
      />
    </span>
  );
}
