"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, X, ChevronDown } from "lucide-react";
import BrandLockup from "@/components/BrandLockup";
import { BUSINESS_NAME } from "@/lib/brand";
import { orderedServices } from "@/lib/services";

function serviceHref(service, snowSeason) {
  if (service.value === "full-service" || (service.snow && !snowSeason)) return "#services";
  return `#service-${service.value}`;
}

const Navbar = ({ onGetQuote, hasPromo = false, snowSeason = false }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const services = orderedServices(snowSeason);
  const quoteLabel = snowSeason ? "Snow Removal Quote" : "Get Free Quote";

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const otherLinks = [
    { name: "Testimonials", href: "#testimonials" },
    { name: "Service Area", href: "#service-area" },
  ];

  return (
    <nav
      className={`fixed left-0 right-0 z-40 transition-all duration-300 ${
        hasPromo ? "top-[88px] md:top-[44px]" : "top-0"
      } ${isScrolled ? "shadow-md" : "shadow-sm"} bg-white/95 backdrop-blur-sm`}
      data-testid="navbar"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <a href="#hero" className="flex items-center gap-2" data-testid="logo" aria-label={BUSINESS_NAME}>
            <BrandLockup snowSeason={snowSeason} />
          </a>

          <div className="hidden md:flex items-center gap-8">
            <DropdownMenu>
              <DropdownMenuTrigger
                className="flex items-center gap-1 text-foreground/80 hover:text-primary transition-colors font-body font-medium outline-none"
                data-testid="nav-services-menu"
              >
                Services
                <ChevronDown className="w-4 h-4" aria-hidden="true" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="min-w-[16rem]">
                <DropdownMenuItem asChild>
                  <a href="#services" className="font-body cursor-pointer">
                    All services
                  </a>
                </DropdownMenuItem>
                {services.map((service) => (
                  <DropdownMenuItem key={service.value} asChild>
                    <a
                      href={serviceHref(service, snowSeason)}
                      className="font-body cursor-pointer"
                      data-testid={`nav-service-${service.value}`}
                    >
                      {service.label}
                    </a>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            {otherLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-foreground/80 hover:text-primary transition-colors font-body font-medium"
                data-testid={`nav-link-${link.name.toLowerCase().replace(" ", "-")}`}
              >
                {link.name}
              </a>
            ))}
            <Button
              onClick={onGetQuote}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-body font-semibold px-6 btn-primary"
              data-testid="nav-get-quote-btn"
            >
              {quoteLabel}
            </Button>
          </div>

          <button
            className="md:hidden p-2 text-foreground"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            data-testid="mobile-menu-btn"
            aria-expanded={isMobileMenuOpen}
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden bg-card border-t border-border" data-testid="mobile-menu">
          <div className="px-4 py-4 space-y-3">
            <p className="font-body text-xs uppercase tracking-wide text-muted-foreground">Services</p>
            {services.map((service) => (
              <a
                key={service.value}
                href={serviceHref(service, snowSeason)}
                className="block py-2 text-foreground/80 hover:text-primary transition-colors font-body"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {service.label}
              </a>
            ))}
            {otherLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="block py-2 text-foreground/80 hover:text-primary transition-colors font-body"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.name}
              </a>
            ))}
            <Button
              onClick={() => {
                onGetQuote();
                setIsMobileMenuOpen(false);
              }}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-body font-semibold"
              data-testid="mobile-get-quote-btn"
            >
              {quoteLabel}
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
