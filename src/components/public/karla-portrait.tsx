import Image from "next/image";

export function KarlaPortrait({ className = "" }: { className?: string }) {
  return (
    <figure className={`karla-portrait ${className}`.trim()}>
      <Image
        src="/images/knv/karla-norin-vasquez.webp"
        alt="Karla Norin Vásquez, abogada"
        width={410}
        height={494}
        loading="eager"
        sizes="(max-width: 767px) calc(100vw - 2rem), (max-width: 1151px) 400px, 410px"
      />
    </figure>
  );
}
