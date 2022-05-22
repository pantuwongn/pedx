import useSWR from "swr";
import type { User } from "src/pages/api/user/user";
import type { Events } from "src/pages/api/user/events";
export default function useEvents(user: User | undefined) {
  // request to /api/events only if user is logged in
  const { data: events } = useSWR<Events>(
    user?.isLoggedIn ? `/api/user/events` : null
  );
  return { events };
}
