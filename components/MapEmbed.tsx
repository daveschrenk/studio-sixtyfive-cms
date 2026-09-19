export function MapEmbed({
  lat,
  lng,
  label,
  span = 0.08,
}: {
  lat: number;
  lng: number;
  label: string;
  span?: number;
}) {
  const bbox = [
    lng - span,
    lat - span * 0.7,
    lng + span,
    lat + span * 0.7,
  ].join("%2C");
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat}%2C${lng}`;
  const external = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=12/${lat}/${lng}`;

  return (
    <figure className="border border-rule bg-cream">
      <iframe
        title={`OpenStreetMap city context: ${label}`}
        src={src}
        className="w-full h-64 sm:h-80 grayscale-[20%]"
        loading="lazy"
        referrerPolicy="no-referrer"
      />
      <figcaption className="px-3 py-2 text-xs text-muted flex flex-wrap justify-between gap-3">
        <span>
          {label} · city context map (not a shop location)
        </span>
        <a
          href={external}
          className="hover:text-rust underline-offset-2 hover:underline"
        >
          View larger map
        </a>
      </figcaption>
    </figure>
  );
}
