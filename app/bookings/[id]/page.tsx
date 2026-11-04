import { WithParams } from "@/components/booking/Fallback";
import { BookingDetail } from "@/components/booking/Bookings";

export default function Page({ params }: PageProps<"/bookings/[id]">) {
  return (
    <WithParams>
      <Resolved params={params} />
    </WithParams>
  );
}

async function Resolved({ params }: { params: PageProps<"/bookings/[id]">["params"] }) {
  const { id } = await params;
  return <BookingDetail id={id} />;
}
