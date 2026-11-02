const FLAKES = Array.from({ length: 28 }, (_, index) => ({
  id: index,
  left: `${(index * 37) % 100}%`,
  delay: `${(index % 14) * 0.55}s`,
  duration: `${12 + (index % 8)}s`,
  size: `${3 + (index % 3)}px`,
  opacity: 0.28 + (index % 5) * 0.07,
  drift: `${index % 2 === 0 ? 16 : -18}px`
}));

/** Decorative overlay. Hidden when the visitor prefers reduced motion. */
const Snowfall = () => {
  return (
    <div className="snow-effect" aria-hidden="true">
      {FLAKES.map((flake) => (
        <span
          key={flake.id}
          className="snowflake"
          style={{
            left: flake.left,
            animationDelay: flake.delay,
            animationDuration: flake.duration,
            width: flake.size,
            height: flake.size,
            opacity: flake.opacity,
            "--snow-drift": flake.drift
          }}
        />
      ))}
    </div>
  );
};

export default Snowfall;
