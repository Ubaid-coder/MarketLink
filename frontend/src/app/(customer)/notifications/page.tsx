"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import {
  Bell,
  CheckCheck,
  Megaphone,
  PackageCheck,
  ShoppingBasket,
  Sparkles,
} from "lucide-react";

import api from "@/lib/api";

import {
  useAuth,
} from "@/context/AuthContext";

import {
  Notification,
} from "@/types/notification";


export default function NotificationsPage() {
  const router =
    useRouter();

  const {
    user,
    loading: authLoading,
  } = useAuth();

  const [
    notifications,
    setNotifications,
  ] =
    useState<
      Notification[]
    >([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");


  // ================================================
  // LOAD
  // ================================================

  const loadNotifications =
    useCallback(async () => {
      try {
        setLoading(true);

        const response =
          await api.get(
            "/notifications"
          );

        setNotifications(
          response.data
            .notifications ||
          []
        );
      } catch (error) {
        console.error(
          error
        );

        setError(
          "Unable to load notifications."
        );
      } finally {
        setLoading(false);
      }
    }, []);


  // ================================================
  // AUTH
  // ================================================

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!user) {
      router.replace(
        "/login?redirect=/notifications"
      );

      return;
    }

    if (
      user.role !==
      "customer"
    ) {
      router.replace("/");
      return;
    }

    loadNotifications();
  }, [
    user,
    authLoading,
    router,
    loadNotifications,
  ]);


  // ================================================
  // READ ONE
  // ================================================

  const markRead =
    async (
      notification:
        Notification
    ) => {
      if (
        notification.isRead
      ) {
        openNotification(
          notification
        );

        return;
      }

      try {
        await api.patch(
          `/notifications/${notification._id}/read`
        );

        setNotifications(
          (current) =>
            current.map(
              (item) =>
                item._id ===
                  notification._id
                  ? {
                    ...item,
                    isRead:
                      true,
                  }
                  : item
            )
        );

        openNotification(
          notification
        );
      } catch (error) {
        console.error(
          error
        );
      }
    };


  // ================================================
  // OPEN
  // ================================================

  const openNotification = (
    notification: Notification
  ) => {
    // ORDER

    if (
      notification.relatedOrder
    ) {
      const orderId =
        typeof notification.relatedOrder ===
          "string"
          ? notification.relatedOrder
          : notification
            .relatedOrder
            ._id;

      router.push(
        `/orders/${orderId}`
      );

      return;
    }


    // PRODUCT RESTOCK

    if (
      notification.relatedProduct
    ) {
      const productId =
        typeof notification.relatedProduct ===
          "string"
          ? notification.relatedProduct
          : notification
            .relatedProduct
            ._id;

      router.push(
        `/marketplace/products/${productId}`
      );

      return;
    }
  };


  // ================================================
  // READ ALL
  // ================================================

  const markAllRead =
    async () => {
      try {
        await api.patch(
          "/notifications/read-all"
        );

        setNotifications(
          (current) =>
            current.map(
              (notification) => ({
                ...notification,
                isRead: true,
              })
            )
        );
      } catch (error) {
        console.error(
          error
        );
      }
    };


  if (
    authLoading ||
    loading
  ) {
    return (
      <NotificationLoading />
    );
  }


  if (
    !user ||
    user.role !==
    "customer"
  ) {
    return null;
  }


  const unreadCount =
    notifications.filter(
      (notification) =>
        !notification.isRead
    ).length;


  return (
    <div>

      {/* HEADER */}

      <section className="border-b border-[#E5E7EB] bg-white">

        <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">

          <div className="flex flex-wrap items-end justify-between gap-4">

            <div>

              <p className="text-sm font-semibold uppercase tracking-wider text-[#22C55E]">
                Updates
              </p>

              <h1 className="mt-2 text-3xl font-bold text-[#1F2937]">
                Notifications
              </h1>

              <p className="mt-2 text-[#6B7280]">
                {unreadCount >
                  0
                  ? `${unreadCount} unread notification${unreadCount ===
                    1
                    ? ""
                    : "s"
                  }`
                  : "You're all caught up."}
              </p>

            </div>


            {unreadCount >
              0 && (
                <button
                  onClick={
                    markAllRead
                  }
                  className="flex items-center gap-2 rounded-lg border border-[#166534] px-4 py-2.5 text-sm font-semibold text-[#166534] transition hover:bg-[#DCFCE7]"
                >
                  <CheckCheck
                    size={17}
                  />

                  Mark All Read
                </button>
              )}

          </div>

        </div>

      </section>


      <section className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">

        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-[#DC2626]">
            {error}
          </div>
        )}


        {!error &&
          notifications.length ===
          0 && (
            <div className="rounded-3xl border border-dashed border-[#D1D5DB] bg-white py-20 text-center">

              <Bell
                size={40}
                className="mx-auto text-[#166534]"
              />

              <h2 className="mt-5 text-xl font-semibold text-[#1F2937]">
                No notifications
              </h2>

              <p className="mt-2 text-sm text-[#6B7280]">
                Order and MarketLink updates will appear here.
              </p>

            </div>
          )}


        <div className="space-y-3">

          {notifications.map(
            (
              notification
            ) => (
              <button
                key={
                  notification._id
                }
                type="button"
                onClick={() =>
                  markRead(
                    notification
                  )
                }
                className={`flex w-full items-start gap-4 rounded-2xl border p-5 text-left transition hover:border-green-300 ${notification.isRead
                    ? "border-[#E5E7EB] bg-white"
                    : "border-green-200 bg-[#F0FDF4]"
                  }`}
              >

                <NotificationIcon
                  type={
                    notification.type
                  }
                />


                <div className="min-w-0 flex-1">

                  <div className="flex items-start justify-between gap-3">

                    <h2 className="font-semibold text-[#1F2937]">
                      {
                        notification.title
                      }
                    </h2>

                    {!notification.isRead && (
                      <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-[#22C55E]" />
                    )}

                  </div>

                  <p className="mt-2 text-sm leading-6 text-[#6B7280]">
                    {
                      notification.message
                    }
                  </p>

                  <p className="mt-3 text-xs text-[#9CA3AF]">
                    {formatNotificationDate(
                      notification.createdAt
                    )}
                  </p>

                </div>

              </button>
            )
          )}

        </div>

      </section>

    </div>
  );
}


function NotificationIcon({
  type,
}: {
  type: Notification["type"];
}) {
  const base =
    "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl";


  if (
    type === "order"
  ) {
    return (
      <div
        className={`${base} bg-blue-50 text-blue-600`}
      >
        <PackageCheck
          size={20}
        />
      </div>
    );
  }


  if (
    type ===
    "announcement"
  ) {
    return (
      <div
        className={`${base} bg-[#FEF3C7] text-[#92400E]`}
      >
        <Megaphone
          size={20}
        />
      </div>
    );
  }


  if (
    type === "stock"
  ) {
    return (
      <div
        className={`${base} bg-[#DCFCE7] text-[#166534]`}
      >
        <ShoppingBasket
          size={20}
        />
      </div>
    );
  }


  return (
    <div
      className={`${base} bg-gray-100 text-[#6B7280]`}
    >
      <Sparkles
        size={20}
      />
    </div>
  );
}


function formatNotificationDate(
  value: string
) {
  const date =
    new Date(value);

  return date.toLocaleString(
    undefined,
    {
      dateStyle: "medium",
      timeStyle: "short",
    }
  );
}


function NotificationLoading() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">

      <div className="h-10 w-52 animate-pulse rounded bg-[#E5E7EB]" />

      <div className="mt-10 space-y-3">

        {Array.from({
          length: 5,
        }).map(
          (_, index) => (
            <div
              key={index}
              className="h-28 animate-pulse rounded-2xl bg-[#E5E7EB]"
            />
          )
        )}

      </div>

    </div>
  );
}