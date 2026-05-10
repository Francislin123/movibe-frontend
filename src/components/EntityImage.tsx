interface EntityImageProps {
  image?: string | null;
  name: string;
  fallback?: React.ReactNode;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function EntityImage({ 
  image, 
  name, 
  fallback, 
  size = "md", 
  className = "" 
}: EntityImageProps) {
  const dim =
    size === "lg"
      ? "w-14 h-14 text-xl"
      : size === "sm"
        ? "w-8 h-8 text-xs"
        : "w-10 h-10 text-sm";

  if (image) {
    return (
      <img
        src={image}
        alt={name}
        className={`${dim} rounded-full object-cover shrink-0 ring-2 ring-white shadow ${className}`}
        loading="lazy"
      />
    );
  }

  // Fallback com placeholder baseado no tipo de entidade
  const defaultFallback = (
    <div className={`${dim} rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold shrink-0 ring-2 ring-white shadow ${className}`}>
      {name.charAt(0).toUpperCase()}
    </div>
  );

  return fallback || defaultFallback;
}
