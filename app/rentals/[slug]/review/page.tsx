import { WithParams } from "@/components/booking/Fallback";
import RentalReview from "@/components/booking/RentalReview";

export default function Page({ params }: PageProps<"/rentals/[slug]/review">) {
  return (
    <WithParams>
      <Resolved params={params} />
    </WithParams>
  );
}

async function Resolved({ params }: { params: PageProps<"/rentals/[slug]/review">["params"] }) {
  const { slug } = await params;
  return <RentalReview slug={slug} />;
}
