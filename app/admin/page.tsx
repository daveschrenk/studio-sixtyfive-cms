import { ALL_LISTINGS } from "@/lib/listings";
import { CITIES, HUB } from "@/lib/data";
import { AdminCMS } from "@/components/AdminCMS";

export default function AdminPage() {
  const cities = CITIES.map((city) => ({
    name: city.name,
    path: city.path,
    shortName: city.shortName,
  }));

  return (
    <AdminCMS
      listings={ALL_LISTINGS}
      hubPath={HUB.path}
      cities={cities}
    />
  );
}
