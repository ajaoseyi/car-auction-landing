import { WithParams } from "@/components/booking/Fallback";
import RentalBook from "@/components/booking/RentalBook";

export default function Page({ params }: PageProps<"/rentals/[slug]/book">) {
  return (
    <WithParams>
      <Resolved params={params} />
    </WithParams>
  );
}

async function Resolved({ params }: { params: PageProps<"/rentals/[slug]/book">["params"] }) {
  const { slug } = await params;
  return <RentalBook slug={slug} />;
}
