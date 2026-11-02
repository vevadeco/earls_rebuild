export const SERVICE_TYPES = [
  "lawn-care",
  "garden-planting",
  "hardscaping",
  "full-service",
  "snow-removal"
] as const;

export type ServiceType = (typeof SERVICE_TYPES)[number];

export type ServiceOption = {
  value: ServiceType;
  label: string;
  shortLabel: string;
  snow: boolean;
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

/** Snow services lead the list only while Snow Contract Season is on. */
export function orderedServices(snowSeason: boolean) {
  if (!snowSeason) return SERVICES;
  return [...SERVICES].sort((a, b) => Number(b.snow) - Number(a.snow));
}
