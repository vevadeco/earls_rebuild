import { Button } from "@/components/ui/button";
import { ArrowRight, Leaf, Flower2, HardHat } from "lucide-react";

const ServicesSection = ({ onGetQuote }) => {
  const services = [
    {
      id: "lawn-care",
      title: "Lawn Care & Maintenance",
      description:
        "Keep your lawn looking pristine year-round with our comprehensive care program. Mowing, fertilization, aeration, and seasonal treatments.",
      icon: Leaf,
      image: "https://images.pexels.com/photos/4920283/pexels-photo-4920283.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
      features: ["Weekly Mowing", "Fertilization", "Weed Control", "Seasonal Cleanup"],
      span: "md:col-span-2 md:row-span-2",
      large: true,
    },
    {
      id: "garden-planting",
      title: "Garden Planting",
      description:
        "Beautiful flower beds and garden designs that bloom throughout the seasons.",
      icon: Flower2,
      image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&q=80&w=800",
      features: ["Flower Beds", "Shrubs & Trees", "Seasonal Plants"],
      span: "md:col-span-1",
      large: false,
    },
    {
      id: "hardscaping",
      title: "Hardscaping & Patios",
      description:
        "Transform your outdoor space with stunning patios, walkways, and retaining walls.",
      icon: HardHat,
      image: "https://images.pexels.com/photos/6313939/pexels-photo-6313939.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
      features: ["Patios", "Walkways", "Retaining Walls"],
      span: "md:col-span-1",
      large: false,
    },
  ];

  return (
    <section
      id="services"
      className="py-20 lg:py-32 bg-background relative z-10"
      data-testid="services-section"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 bg-secondary/30 text-primary font-body font-medium text-sm rounded-full mb-4">
            Our Services
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl text-foreground mb-4">
            Professional Landscaping
            <br />
            <span className="text-primary">Services</span>
          </h2>
          <p className="font-body text-muted-foreground text-lg max-w-2xl mx-auto">
            From routine lawn care to complete outdoor transformations, we deliver exceptional results.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <div
              key={service.id}
              className={`${service.span} relative group overflow-hidden rounded-2xl bento-item`}
              data-testid={`service-card-${service.id}`}
            >
              {/* Background Image */}
              <div
                className={`absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105`}
                style={{ backgroundImage: `url('${service.image}')` }}
              />
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

              {/* Content */}
              <div
                className={`relative z-10 h-full flex flex-col justify-end p-6 ${
                  service.large ? "min-h-[500px] lg:min-h-[600px]" : "min-h-[280px]"
                }`}
              >
                {/* Icon */}
                <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center mb-4">
                  <service.icon className="w-6 h-6 text-primary" />
                </div>

                <h3
                  className={`font-heading text-white mb-2 ${
                    service.large ? "text-2xl lg:text-3xl" : "text-xl"
                  }`}
                >
                  {service.title}
                </h3>

                <p
                  className={`font-body text-white/80 mb-4 ${
                    service.large ? "text-base" : "text-sm"
                  }`}
                >
                  {service.description}
                </p>

                {/* Features Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {service.features.map((feature, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-white/10 backdrop-blur-sm text-white text-xs font-body rounded-full"
                    >
                      {feature}
                    </span>
                  ))}
                </div>

                {service.large && (
                  <Button
                    onClick={onGetQuote}
                    className="w-fit bg-accent hover:bg-accent/90 text-accent-foreground font-body font-semibold group/btn"
                    data-testid="service-cta-btn"
                  >
                    Get Started
                    <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover/btn:translate-x-1" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12">
          <p className="font-body text-muted-foreground mb-4">
            Not sure what service you need? We'll help you figure it out.
          </p>
          <Button
            onClick={onGetQuote}
            variant="outline"
            className="font-body font-semibold border-primary text-primary hover:bg-primary hover:text-primary-foreground"
            data-testid="services-cta-btn"
          >
            Schedule a Free Consultation
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
