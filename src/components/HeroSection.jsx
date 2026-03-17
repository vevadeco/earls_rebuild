"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Star, Shield, Clock } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

const API = "/api";

const HeroSection = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    service_type: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const services = [
    { value: "lawn-care", label: "Lawn Care & Maintenance" },
    { value: "garden-planting", label: "Garden Planting" },
    { value: "hardscaping", label: "Hardscaping (Patios, Walkways)" },
    { value: "full-service", label: "Full Landscaping Service" },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.phone || !formData.service_type) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await axios.post(`${API}/leads`, formData);
      if (response.data.success) {
        setIsSubmitted(true);
        toast.success(response.data.message);
        setFormData({ name: "", email: "", phone: "", service_type: "" });
      }
    } catch (error) {
      console.error("Error submitting lead:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const trustBadges = [
    { icon: Star, text: "4.8 Star Rating" },
    { icon: Shield, text: "Fully Insured" },
    { icon: Clock, text: "Same Week Service" },
  ];

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center pt-20"
      data-testid="hero-section"
    >
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1558904541-efa843a96f01?auto=format&fit=crop&q=80&w=2000')`,
        }}
      >
        <div className="hero-overlay absolute inset-0" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <div className="text-white animate-fade-in-up">
            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Transform Your
              <br />
              <span className="text-secondary">Outdoor Space</span>
            </h1>
            <p className="font-body text-lg sm:text-xl text-white/90 mb-8 max-w-lg leading-relaxed">
              Hamilton's trusted landscaping experts. From lush lawns to stunning hardscapes, 
              we bring your outdoor vision to life with over 15 years of experience.
            </p>

            {/* Trust Badges */}
            <div className="flex flex-wrap gap-4 mb-8">
              {trustBadges.map((badge, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2"
                  data-testid={`trust-badge-${index}`}
                >
                  <badge.icon className="w-4 h-4 text-secondary" />
                  <span className="text-sm font-body font-medium">{badge.text}</span>
                </div>
              ))}
            </div>

            {/* Features List */}
            <div className="space-y-3">
              {[
                "Free consultation & detailed quotes",
                "Licensed & insured professionals",
                "Satisfaction guaranteed",
              ].map((feature, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 opacity-0 animate-fade-in-up"
                  style={{ animationDelay: `${(index + 1) * 100}ms`, animationFillMode: "forwards" }}
                >
                  <CheckCircle className="w-5 h-5 text-secondary flex-shrink-0" />
                  <span className="font-body text-white/90">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Content - Lead Form */}
          <div className="animate-fade-in-up animation-delay-200">
            <Card className="bg-card shadow-2xl border-0 rounded-2xl overflow-hidden" data-testid="lead-form-card">
              <CardHeader className="bg-primary text-primary-foreground p-6">
                <CardTitle className="font-heading text-2xl text-center">
                  Get Your Free Quote
                </CardTitle>
                <p className="text-center text-primary-foreground/80 font-body text-sm mt-2">
                  We'll respond within 24 hours
                </p>
              </CardHeader>
              <CardContent className="p-6">
                {isSubmitted ? (
                  <div className="text-center py-8" data-testid="form-success">
                    <div className="w-16 h-16 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="font-heading text-xl text-foreground mb-2">
                      Thank You!
                    </h3>
                    <p className="font-body text-muted-foreground">
                      We've received your request and will contact you within 24 hours.
                    </p>
                    <Button
                      onClick={() => setIsSubmitted(false)}
                      variant="outline"
                      className="mt-4"
                      data-testid="submit-another-btn"
                    >
                      Submit Another Request
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4" data-testid="lead-form">
                    <div>
                      <Label htmlFor="name" className="font-body font-medium text-foreground">
                        Full Name
                      </Label>
                      <Input
                        id="name"
                        type="text"
                        placeholder="John Smith"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="mt-1.5 font-body"
                        data-testid="input-name"
                      />
                    </div>

                    <div>
                      <Label htmlFor="email" className="font-body font-medium text-foreground">
                        Email Address
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="john@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="mt-1.5 font-body"
                        data-testid="input-email"
                      />
                    </div>

                    <div>
                      <Label htmlFor="phone" className="font-body font-medium text-foreground">
                        Phone Number
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="(905) 123-4567"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="mt-1.5 font-body"
                        data-testid="input-phone"
                      />
                    </div>

                    <div>
                      <Label htmlFor="service" className="font-body font-medium text-foreground">
                        Service Needed
                      </Label>
                      <Select
                        value={formData.service_type}
                        onValueChange={(value) => setFormData({ ...formData, service_type: value })}
                      >
                        <SelectTrigger className="mt-1.5 font-body" data-testid="select-service">
                          <SelectValue placeholder="Select a service" />
                        </SelectTrigger>
                        <SelectContent>
                          {services.map((service) => (
                            <SelectItem
                              key={service.value}
                              value={service.value}
                              className="font-body"
                              data-testid={`service-option-${service.value}`}
                            >
                              {service.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-body font-semibold py-6 text-lg btn-primary"
                      disabled={isSubmitting}
                      data-testid="submit-form-btn"
                    >
                      {isSubmitting ? "Submitting..." : "Get My Free Quote"}
                    </Button>

                    <p className="text-center text-xs text-muted-foreground font-body">
                      No spam. We respect your privacy.
                    </p>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
