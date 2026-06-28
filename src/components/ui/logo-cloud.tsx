'use client';
import { InfiniteSlider } from "@/components/ui/infinite-slider";
import { cn } from "@/lib/utils";

type Logo = {
  src: string;
  alt: string;
  width?: number;
  height?: number;
};

type LogoCloudProps = React.ComponentProps<"div"> & {
  logos: Logo[];
};

export function LogoCloud({ className, logos, ...props }: LogoCloudProps) {
  return (
    <div
      {...props}
      className={cn(
        "overflow-hidden py-4 [mask-image:linear-gradient(to_right,transparent,black,transparent)]",
        className
      )}
    >
      <InfiniteSlider gap={64} reverse={false} speed={60} speedOnHover={20}>
        {logos.map((logo) => (
          <img
            alt={logo.alt}
            className="pointer-events-none h-8 w-auto select-none object-contain grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300"
            height={logo.height || 32}
            key={`logo-${logo.alt}`}
            loading="lazy"
            src={logo.src}
            width={logo.width || "auto"}
          />
        ))}
      </InfiniteSlider>
    </div>
  );
}

export const clientLogos: Logo[] = [
  {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Shell_logo.svg/120px-Shell_logo.svg.png",
    alt: "Shell",
  },
  {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/Bosch-logo.svg/320px-Bosch-logo.svg.png",
    alt: "Bosch",
  },
  {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Toshiba_logo.svg/320px-Toshiba_logo.svg.png",
    alt: "Toshiba",
  },
  {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Aditya_Birla_Group_Logo.svg/320px-Aditya_Birla_Group_Logo.svg.png",
    alt: "Aditya Birla Group",
  },
  {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/POSCO_logo.svg/320px-POSCO_logo.svg.png",
    alt: "POSCO",
  },
  {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/Crompton_Greaves_logo.png/320px-Crompton_Greaves_logo.png",
    alt: "Crompton Greaves",
  },
  {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Welspun_Logo.png/320px-Welspun_Logo.png",
    alt: "Welspun",
  },
  {
    src: "https://upload.wikimedia.org/wikipedia/en/thumb/8/81/Manipal_Education_logo.png/320px-Manipal_Education_logo.png",
    alt: "Manipal Group",
  },
  {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Shell_logo.svg/120px-Shell_logo.svg.png",
    alt: "Shell 2",
  },
  {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/Bosch-logo.svg/320px-Bosch-logo.svg.png",
    alt: "Bosch 2",
  },
  {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Toshiba_logo.svg/320px-Toshiba_logo.svg.png",
    alt: "Toshiba 2",
  },
  {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Aditya_Birla_Group_Logo.svg/320px-Aditya_Birla_Group_Logo.svg.png",
    alt: "Aditya Birla 2",
  },
];
