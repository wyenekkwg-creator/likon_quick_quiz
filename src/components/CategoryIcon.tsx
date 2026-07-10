import React from "react";
import * as Icons from "lucide-react";

interface CategoryIconProps {
  name: string;
  className?: string;
  size?: number;
}

export default function CategoryIcon({ name, className = "", size = 24 }: CategoryIconProps) {
  // Safe lookup for all icons we declare in our data.ts
  const IconComponent = (Icons as any)[name];
  
  if (!IconComponent) {
    // Fallback icon if not found
    return <Icons.HelpCircle className={className} size={size} />;
  }

  return <IconComponent className={className} size={size} />;
}
