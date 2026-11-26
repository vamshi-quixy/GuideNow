/*
 * Brand panel shown beside the login and sign-up forms from the md breakpoint up.
 * On phones the panel is hidden and the forms show BrandLogo above the heading.
 * Figma: "2.0 Version Designs", Provia brand panel (login 351:2576, sign-up 396:1187).
 */

// Soft blurred circle, light at the top and purple at the bottom (Figma blur 80).
const glow = "rounded-full bg-linear-to-b from-brand-100 to-[#663792] blur-[80px]";

// Four-point star logo mark: a 30px square with a 15px circle cut out of each
// corner, so each edge curves inward.
const cutCorner = (color: string, at: string, corner: string) =>
  `radial-gradient(circle at ${at}, transparent 15px, ${color} 15px) ${corner} / 50% 50% no-repeat`;
const logoMark = (color: string) => ({
  background: [
    cutCorner(color, "0 0", "top left"),
    cutCorner(color, "100% 0", "top right"),
    cutCorner(color, "0 100%", "bottom left"),
    cutCorner(color, "100% 100%", "bottom right"),
  ].join(", "),
});

/** Provia star + wordmark. Pink on the brand panel, brand purple on white. */
export function BrandLogo({ tone = "pink", className }: { tone?: "pink" | "brand"; className?: string }) {
  const color = tone === "pink" ? "#ff82aa" : "var(--color-brand-600)";
  return (
    <div className={["flex items-center", className].filter(Boolean).join(" ")}>
      <span aria-hidden="true" className="flex size-10 shrink-0 items-center justify-center">
        <span className="size-7.5" style={logoMark(color)} />
      </span>
      <span className="text-display whitespace-nowrap" style={{ color }}>
        Provia
      </span>
    </div>
  );
}

export function BrandPanel({ className }: { className?: string }) {
  return (
    <aside
      className={[
        "relative hidden min-h-94 min-w-72 flex-[1_0_0] overflow-clip rounded-3xl bg-brand-600 md:block",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div
        aria-hidden="true"
        className="absolute top-[-338px] right-[-424.13px] flex size-[1000.131px] items-center justify-center"
      >
        <div className={`size-[707.2px] rotate-45 ${glow}`} />
      </div>
      <div
        aria-hidden="true"
        className="absolute bottom-[-322.74px] left-[-361px] flex size-[722.744px] items-center justify-center"
      >
        <div className={`size-[686.824px] rotate-[-176.92deg] ${glow}`} />
      </div>

      <BrandLogo className="absolute top-8 left-8" />

      <div className="absolute right-8 bottom-8 left-8 flex flex-col items-start gap-6 py-10">
        <span className="rounded-full bg-linear-to-r from-white/20 to-[rgb(222_222_222/0.2)] px-4 py-3 text-body-lg whitespace-nowrap text-inverse">
          Join Us to Build
        </span>
        <div className="flex w-full flex-col gap-2 text-inverse">
          <p className="text-display">Start Your Journey</p>
          <p className="text-body-md">Fill those forms to set up your profile</p>
        </div>
      </div>
    </aside>
  );
}
