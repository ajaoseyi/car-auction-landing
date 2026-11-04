import { WithParams } from "@/components/booking/Fallback";
import { BookingConfirmed } from "@/components/booking/Bookings";

export default function Page({ params }: PageProps<"/bookings/[id]/confirmed">) {
  return (
    <WithParams>
      <Resolved params={params} />
    </WithParams>
  );
}

async function Resolved({ params }: { params: PageProps<"/bookings/[id]/confirmed">["params"] }) {
  const { id } = await params;
  return <BookingConfirmed id={id} />;
}
