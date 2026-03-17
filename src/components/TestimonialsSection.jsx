import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Star } from "lucide-react";

const TestimonialsSection = () => {
  const testimonials = [
    {
      id: 1,
      name: "Sarah Mitchell",
      location: "Hamilton",
      rating: 5,
      text: "Earl's team transformed our backyard into an absolute oasis. The patio they built is stunning, and the attention to detail was incredible. Highly recommend!",
      avatar: "SM",
    },
    {
      id: 2,
      name: "Michael Chen",
      location: "Burlington",
      rating: 5,
      text: "We've been using Earl's Landscaping for our lawn care for 3 years now. Always reliable, professional, and our lawn has never looked better.",
      avatar: "MC",
    },
    {
      id: 3,
      name: "Jennifer Williams",
      location: "Oakville",
      rating: 5,
      text: "From the initial consultation to the final walkthrough, the experience was seamless. They designed a garden that blooms beautifully every season.",
      avatar: "JW",
    },
    {
      id: 4,
      name: "Robert Thompson",
      location: "Mississauga",
      rating: 4,
      text: "Great communication throughout the project. The retaining wall they built solved our drainage issues and looks fantastic. Will definitely use again.",
      avatar: "RT",
    },
    {
      id: 5,
      name: "Amanda Foster",
      location: "Stoney Creek",
      rating: 5,
      text: "Professional, punctual, and the results speak for themselves. Our neighbors keep asking who did our landscaping. Thank you, Earl's team!",
      avatar: "AF",
    },
    {
      id: 6,
      name: "David Park",
      location: "Grimsby",
      rating: 5,
      text: "The best landscaping company in the Hamilton area. Fair pricing, excellent work, and they cleaned up perfectly after the job was done.",
      avatar: "DP",
    },
  ];

  const overallRating = 4.8;
  const totalReviews = 127;

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${
          index < rating ? "text-accent fill-accent" : "text-muted"
        }`}
      />
    ));
  };

  return (
    <section
      id="testimonials"
      className="py-20 lg:py-32 bg-muted/30 relative"
      data-testid="testimonials-section"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 bg-secondary/30 text-primary font-body font-medium text-sm rounded-full mb-4">
            Testimonials
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl text-foreground mb-4">
            What Our Clients
            <br />
            <span className="text-primary">Say About Us</span>
          </h2>

          {/* Overall Rating */}
          <div
            className="flex items-center justify-center gap-4 mt-6"
            data-testid="overall-rating"
          >
            <div className="flex items-center gap-1">{renderStars(5)}</div>
            <span className="font-heading text-3xl text-foreground">{overallRating}</span>
            <span className="font-body text-muted-foreground">
              based on {totalReviews} reviews
            </span>
          </div>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <Card
              key={testimonial.id}
              className="bg-card border-0 shadow-sm hover:shadow-lg transition-shadow duration-300 testimonial-card"
              data-testid={`testimonial-card-${testimonial.id}`}
            >
              <CardContent className="p-6">
                {/* Stars */}
                <div className="flex items-center gap-1 mb-4">
                  {renderStars(testimonial.rating)}
                </div>

                {/* Quote */}
                <p className="font-body text-foreground/80 mb-6 leading-relaxed">
                  "{testimonial.text}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10 bg-primary text-primary-foreground">
                    <AvatarFallback className="bg-primary text-primary-foreground font-body font-medium">
                      {testimonial.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-body font-semibold text-foreground">
                      {testimonial.name}
                    </p>
                    <p className="font-body text-sm text-muted-foreground">
                      {testimonial.location}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
