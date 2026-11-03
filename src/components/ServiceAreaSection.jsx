import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

// Web Mercator frame. The static image was cropped with these exact values,
// so a lat/long lands on the same pixel as the city on the map.
const MAP = {
  lat: 43.2557,
  lng: -79.8711,
  zoom: 12,
  width: 2100,
  height: 980,
};

const serviceAreas = [
  { name: "Hamilton", lat: 43.2557, lng: -79.8711, primary: true, label: "right" },
  { name: "Burlington", lat: 43.3255, lng: -79.799, primary: false, label: "left" },
  { name: "Stoney Creek", lat: 43.2178, lng: -79.7658, primary: false, label: "below" },
  { name: "Ancaster", lat: 43.2181, lng: -79.9871, primary: false, label: "below" },
  { name: "Dundas", lat: 43.2668, lng: -79.954, primary: false, label: "above" },
  { name: "Grimsby", lat: 43.1945, lng: -79.562, primary: false, label: "left" },
];

function project(lat, lng) {
  const scale = 256 * 2 ** MAP.zoom;
  const xOf = (longitude) => ((longitude + 180) / 360) * scale;
  const yOf = (latitude) => {
    const radians = (latitude * Math.PI) / 180;
    return ((1 - Math.log(Math.tan(radians) + 1 / Math.cos(radians)) / Math.PI) / 2) * scale;
  };
  const originX = xOf(MAP.lng) - MAP.width / 2;
  const originY = yOf(MAP.lat) - MAP.height / 2;
  return {
    left: `${((xOf(lng) - originX) / MAP.width) * 100}%`,
    top: `${((yOf(lat) - originY) / MAP.height) * 100}%`,
  };
}

const labelClass = {
  above: "bottom-full mb-1 left-1/2 -translate-x-1/2",
  below: "top-full mt-1 left-1/2 -translate-x-1/2",
  left: "right-full mr-1.5 top-1/2 -translate-y-1/2",
  right: "left-full ml-1.5 top-1/2 -translate-y-1/2",
};

const ServiceAreaSection = ({ onGetQuote, snowSeason = false }) => {
  return (
    <section
      id="service-area"
      className="py-20 lg:py-32 bg-background relative"
      data-testid="service-area-section"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="relative order-2 lg:order-1">
            <div
              className="relative rounded-2xl overflow-hidden shadow-xl map-container bg-[#f2efe9]"
              data-testid="service-area-map"
            >
              <div className="relative" style={{ aspectRatio: `${MAP.width} / ${MAP.height}` }}>
                <img
                  src="/hamilton-service-area.jpg"
                  alt="Map of the Hamilton area from Grimsby to Burlington, centred on Hamilton"
                  className="absolute inset-0 h-full w-full"
                  width={MAP.width}
                  height={MAP.height}
                />
                {serviceAreas.map((area) => (
                  <div
                    key={area.name}
                    className="absolute"
                    style={project(area.lat, area.lng)}
                    data-testid={`map-pin-${area.name.toLowerCase().replace(" ", "-")}`}
                  >
                    <div className="relative -translate-x-1/2 -translate-y-1/2">
                      <span
                        className={`block rounded-full border-2 border-white shadow-md ${
                          area.primary ? "h-4 w-4 bg-primary" : "h-3 w-3 bg-primary"
                        }`}
                      />
                      <span
                        className={`absolute whitespace-nowrap rounded-full bg-white/95 px-2 py-0.5 text-[11px] font-body font-semibold text-foreground shadow ${
                          labelClass[area.label]
                        }`}
                      >
                        {area.primary ? "Hamilton HQ" : area.name}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <a
                href="https://www.openstreetmap.org/copyright"
                className="absolute bottom-2 right-2 rounded bg-white/90 px-2 py-1 text-[10px] font-body text-foreground/70"
                rel="noopener noreferrer"
              >
                © OpenStreetMap
              </a>
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <span className="inline-block px-4 py-1.5 bg-secondary/30 text-primary font-body font-medium text-sm rounded-full mb-4">
              Service Area
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl text-foreground mb-4">
              Serving Hamilton
              <br />
              <span className="text-primary">& The GTA</span>
            </h2>
            <p className="font-body text-muted-foreground text-lg mb-8 leading-relaxed">
              {snowSeason
                ? "Seasonal snow contracts and per-visit clearing for homes and businesses throughout the Greater Toronto and Hamilton Area."
                : "Based in Hamilton with over 15 years of experience, we proudly serve homeowners and businesses throughout the Greater Toronto and Hamilton Area."}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
              {serviceAreas.map((area) => (
                <div
                  key={area.name}
                  className={`flex items-center gap-2 p-3 rounded-lg ${
                    area.primary ? "bg-primary text-primary-foreground" : "bg-muted/50"
                  }`}
                  data-testid={`service-area-${area.name.toLowerCase().replace(" ", "-")}`}
                >
                  <CheckCircle
                    className={`w-4 h-4 flex-shrink-0 ${
                      area.primary ? "text-secondary" : "text-primary"
                    }`}
                  />
                  <span
                    className={`font-body text-sm ${
                      area.primary ? "font-semibold" : "font-medium text-foreground"
                    }`}
                  >
                    {area.name}
                  </span>
                </div>
              ))}
            </div>

            <p className="font-body text-sm text-muted-foreground mb-6">
              Don't see your area? Contact us — we may still be able to help!
            </p>

            <Button
              onClick={onGetQuote}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-body font-semibold px-8 py-6 text-lg btn-primary"
              data-testid="service-area-cta-btn"
            >
              {snowSeason ? "Get a Snow Removal Quote" : "Get a Free Quote for Your Area"}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServiceAreaSection;
