'use client';
import { InfiniteSlider } from "@/components/ui/infinite-slider";

const logos = [
  { src: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Shell_logo.svg/180px-Shell_logo.svg.png", alt: "Shell" },
  { src: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/Bosch-logo.svg/280px-Bosch-logo.svg.png", alt: "Bosch" },
  { src: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Toshiba_logo.svg/280px-Toshiba_logo.svg.png", alt: "Toshiba" },
  { src: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Aditya_Birla_Group_Logo.svg/280px-Aditya_Birla_Group_Logo.svg.png", alt: "Aditya Birla" },
  { src: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/POSCO_logo.svg/280px-POSCO_logo.svg.png", alt: "POSCO" },
  { src: "https://upload.wikimedia.org/wikipedia/en/thumb/7/7b/Welspun_Group_logo.png/280px-Welspun_Group_logo.png", alt: "Welspun" },
  { src: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Crompton_Greaves_Consumer_Electricals_Logo.png/280px-Crompton_Greaves_Consumer_Electricals_Logo.png", alt: "Crompton Greaves" },
  { src: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Manipal_Hospitals_logo.svg/280px-Manipal_Hospitals_logo.svg.png", alt: "Manipal Group" },
  { src: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/Reliance_Industries_Logo.svg/280px-Reliance_Industries_Logo.svg.png", alt: "Reliance" },
  { src: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Microsun_logo.png/280px-Microsun_logo.png", alt: "MicroSun" },
];

export function LogoMarquee() {
  return (
    <div style={{
      background: "#f5f5f7",
      padding: "40px 0",
      borderTop: "1px solid rgba(0,0,0,0.06)",
      borderBottom: "1px solid rgba(0,0,0,0.06)",
      position: "relative",
      zIndex: 10,
    }}>
      <p style={{
        textAlign: "center",
        fontSize: "12px",
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        color: "#888",
        marginBottom: "24px",
        fontFamily: "inherit",
      }}>
        Trusted by global leaders
      </p>
      <div style={{
        overflow: "hidden",
        WebkitMaskImage: "linear-gradient(to right, transparent, black 15%, black 85%, transparent)",
        maskImage: "linear-gradient(to right, transparent, black 15%, black 85%, transparent)",
      }}>
        <InfiniteSlider gap={80} speed={50} speedOnHover={15}>
          {logos.map((logo) => (
            <img
              key={logo.alt}
              src={logo.src}
              alt={logo.alt}
              loading="lazy"
              style={{
                height: "36px",
                width: "auto",
                objectFit: "contain",
                filter: "grayscale(100%)",
                opacity: 0.55,
                transition: "filter 0.3s, opacity 0.3s",
                pointerEvents: "none",
                userSelect: "none",
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLImageElement).style.filter = "grayscale(0%)";
                (e.target as HTMLImageElement).style.opacity = "1";
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLImageElement).style.filter = "grayscale(100%)";
                (e.target as HTMLImageElement).style.opacity = "0.55";
              }}
            />
          ))}
        </InfiniteSlider>
      </div>
    </div>
  );
}
