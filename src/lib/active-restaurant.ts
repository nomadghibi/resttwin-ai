import { cookies } from 'next/headers';

const COOKIE = 'active_restaurant_id';

export async function getActiveRestaurantId(): Promise<string | undefined> {
  const jar = await cookies();
  return jar.get(COOKIE)?.value;
}

export async function setActiveRestaurantId(id: string): Promise<void> {
  const jar = await cookies();
  jar.set(COOKIE, id, {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30,
  });
}
