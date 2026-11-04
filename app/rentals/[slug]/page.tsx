import { WithParams } from "@/components/booking/Fallback";
import RentalDetail from "@/components/booking/RentalDetail";

export default function Page({ params }: PageProps<"/rentals/[slug]">) {
  return (
    <WithParams>
      <Resolved params={params} />
    </WithParams>
  );
}

async function Resolved({ params }: { params: PageProps<"/rentals/[slug]">["params"] }) {
  const { slug } = await params;
  return <RentalDetail slug={slug} />;
}
