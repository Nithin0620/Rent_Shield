const Spinner = ({ size = 20 }: { size?: number }) => {
  return (
    <span
      className="inline-block animate-spin rounded-full border-2 border-white/30 border-t-white"
      style={{ width: size, height: size }}
      aria-label="Loading"
      role="status"
    />
  );
};

export default Spinner;
