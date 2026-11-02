export const SERVICE_TYPES = [
  "lawn-care",
  "garden-planting",
  "hardscaping",
  "full-service",
  "snow-removal",
  "snow-seasonal",
  "snow-per-visit"
] as const;

export type ServiceType = (typeof SERVICE_TYPES)[number];

export type ServiceOption = {
  value: ServiceType;
  label: string;
  shortLabel: string;
  snow: boolean;
  /** Hidden from quote menus. Kept so older snow-removal leads still label correctly. */
  legacy?: boolean;
};

export const SERVICES: ServiceOption[] = [
  {
    value: "lawn-care",
    label: "Lawn Care & Maintenance",
    shortLabel: "Lawn Care",
    snow: false
  },
  {
    value: "garden-planting",
    label: "Garden Planting",
    shortLabel: "Garden Planting",
    snow: false
  },
  {
    value: "hardscaping",
    label: "Hardscaping (Patios, Walkways)",
    shortLabel: "Hardscaping",
    snow: false
  },
  {
    value: "full-service",
    label: "Full Landscaping Service",
    shortLabel: "Full Service",
    snow: false
  },
  {
    value: "snow-removal",
    label: "Snow Removal",
    shortLabel: "Snow Removal",
    snow: true,
    legacy: true
  },
  {
    value: "snow-seasonal",
    label: "Snow Removal – Seasonal Contract",
    shortLabel: "Snow Seasonal",
    snow: true
  },
  {
    value: "snow-per-visit",
    label: "Snow Removal – Per Visit",
    shortLabel: "Snow Per Visit",
    snow: true
  }
];

const SERVICE_BY_VALUE = new Map(SERVICES.map((service) => [service.value, service]));

export function isServiceType(value: string): value is ServiceType {
  return SERVICE_BY_VALUE.has(value as ServiceType);
}

export function serviceLabel(value: string) {
  return SERVICE_BY_VALUE.get(value as ServiceType)?.label ?? value;
}

export function serviceShortLabel(value: string) {
  return SERVICE_BY_VALUE.get(value as ServiceType)?.shortLabel ?? value;
}

/** Quote-form and nav options. Snow choices lead only while Snow Contract Season is on. */
export function orderedServices(snowSeason: boolean) {
  const listed = SERVICES.filter((service) => !service.legacy);
  if (!snowSeason) return listed;
  return [...listed].sort((a, b) => Number(b.snow) - Number(a.snow));
}
