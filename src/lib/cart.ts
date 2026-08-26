import "server-only";
import { cookies } from "next/headers";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const CART_COOKIE = "cartId";

const cartInclude = {
  items: {
    include: { product: { include: { category: true } } },
    orderBy: { createdAt: "asc" as const },
  },
};

type CartWithItems = Awaited<ReturnType<typeof fetchCartById>>;

function fetchCartById(id: string) {
  return prisma.cart.findUnique({ where: { id }, include: cartInclude });
}

const emptyCart = { id: "", items: [] } as unknown as NonNullable<CartWithItems>;

async function readGuestCartId() {
  const store = await cookies();
  return store.get(CART_COOKIE)?.value ?? null;
}

async function setGuestCartId(id: string) {
  const store = await cookies();
  store.set(CART_COOKIE, id, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });
}

async function clearGuestCartId() {
  const store = await cookies();
  store.delete(CART_COOKIE);
}

// Только для чтения — безопасно вызывать из серверных компонентов (шапка,
// страница корзины). Next.js не разрешает менять cookie во время рендера
// страницы, поэтому здесь ничего не создаётся и гостевая корзина не сливается
// с корзиной аккаунта — этим занимается getOrCreateCart() ниже.
export async function getCart() {
  const session = await auth();

  if (session?.user?.id) {
    const cart = await prisma.cart.findUnique({
      where: { userId: session.user.id },
      include: cartInclude,
    });
    return cart ?? emptyCart;
  }

  const guestCartId = await readGuestCartId();
  if (!guestCartId) return emptyCart;

  const cart = await fetchCartById(guestCartId);
  return cart ?? emptyCart;
}

export async function getCartItemCount() {
  const cart = await getCart();
  return cart.items.reduce((sum, item) => sum + item.quantity, 0);
}

// Пишущая версия — вызывать только из Server Actions или Route Handlers, где
// разрешено менять cookie. Создаёт корзину при первом обращении и, если
// пользователь только что вошёл, а в cookie ещё жива гостевая корзина —
// "усыновляет" её учёткой или сливает с уже существующей корзиной аккаунта.
export async function getOrCreateCart() {
  const session = await auth();

  if (session?.user?.id) {
    const userId = session.user.id;
    await mergeGuestCartIntoUser(userId);

    return prisma.cart.upsert({
      where: { userId },
      update: {},
      create: { userId },
      include: cartInclude,
    });
  }

  const guestCartId = await readGuestCartId();
  if (guestCartId) {
    const guestCart = await fetchCartById(guestCartId);
    if (guestCart) return guestCart;
  }

  const newCart = await prisma.cart.create({ data: {}, include: cartInclude });
  await setGuestCartId(newCart.id);
  return newCart;
}

async function mergeGuestCartIntoUser(userId: string) {
  const guestCartId = await readGuestCartId();
  if (!guestCartId) return;

  const guestCart = await fetchCartById(guestCartId);
  if (!guestCart || guestCart.userId !== null) {
    await clearGuestCartId();
    return;
  }

  const userCart = await prisma.cart.findUnique({ where: { userId } });

  if (!userCart) {
    await prisma.cart.update({ where: { id: guestCart.id }, data: { userId } });
  } else {
    for (const item of guestCart.items) {
      await prisma.cartItem.upsert({
        where: { cartId_productId: { cartId: userCart.id, productId: item.productId } },
        update: { quantity: { increment: item.quantity } },
        create: { cartId: userCart.id, productId: item.productId, quantity: item.quantity },
      });
    }
    await prisma.cart.delete({ where: { id: guestCart.id } });
  }

  await clearGuestCartId();
}
