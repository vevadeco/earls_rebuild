import { Leaf, Snowflake } from "lucide-react";

const BrandLockup = ({ variant = "onLight", snowSeason = false }) => {
  const Icon = snowSeason ? Snowflake : Leaf;
  const iconWrap =
    variant === "onLight"
      ? "bg-primary text-primary-foreground"
      : "bg-secondary text-primary";
  const titleClass = variant === "onLight" ? "text-foreground" : "";
  const subtitleClass =
    variant === "onLight" ? "text-muted-foreground" : "text-primary-foreground/80";

  return (
    <span className="flex items-center gap-2 min-w-0">
      <span
        className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${iconWrap}`}
      >
        <Icon className="w-5 h-5" aria-hidden="true" />
      </span>
      <span className="flex flex-col text-left min-w-0">
        <span className={`font-heading text-lg sm:text-xl leading-tight ${titleClass}`}>
          Earl&apos;s Landscaping
        </span>
        <span
          className={`text-[11px] sm:text-xs font-body tracking-wide uppercase leading-tight ${subtitleClass}`}
        >
          and Snow Removal
        </span>
      </span>
    </span>
  );
};

export default BrandLockup;
