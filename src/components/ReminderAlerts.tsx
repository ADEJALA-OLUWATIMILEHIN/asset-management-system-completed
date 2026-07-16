import { BellRing, X } from "lucide-react";
import { useEffect, useState } from "react";
import { getCalendarEvents, type CalendarEvent } from "@/api/CalendarApi/CalendarApi";
import { getCurrentUser } from "@/api/LoginApi/LoginApi";

const shownKey = () => `alms.shown-reminders.${getCurrentUser()?.id ?? "guest"}`;

const getDueEvents = (events: CalendarEvent[]) => {
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  return events.filter((event) => !event.isResolved && new Date(event.eventDate) <= today);
};

export function requestReminderPermission() {
  if ("Notification" in window && Notification.permission === "default") {
    void Notification.requestPermission();
  }
}

/** Shows due calendar events in the app and as browser notifications while the app is open. */
export default function ReminderAlerts() {
  const [alerts, setAlerts] = useState<CalendarEvent[]>([]);

  useEffect(() => {
    let active = true;
    const storageKey = shownKey();
    const previouslyShown = new Set<string>(JSON.parse(sessionStorage.getItem(storageKey) ?? "[]"));

    const checkForReminders = async () => {
      const result = await getCalendarEvents();
      if (!active || !result.data) return;

      const due = getDueEvents(result.data.events);
      const newAlerts = due.filter((event) => !previouslyShown.has(String(event.id)));
      if (!newAlerts.length) return;

      newAlerts.forEach((event) => previouslyShown.add(String(event.id)));
      sessionStorage.setItem(storageKey, JSON.stringify([...previouslyShown]));
      setAlerts((current) => [...newAlerts, ...current].slice(0, 4));

      if ("Notification" in window && Notification.permission === "granted") {
        newAlerts.forEach((event) => {
          new Notification(event.title, {
            body: `Due ${new Date(event.eventDate).toLocaleDateString()}. Open ALMS to review this reminder.`,
            icon: "/favicon.svg",
            tag: `alms-reminder-${event.id}`,
          });
        });
      }
    };

    void checkForReminders();
    const interval = window.setInterval(() => void checkForReminders(), 60_000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, []);

  if (!alerts.length) return null;

  return (
    <div className="fixed right-4 top-20 z-50 w-[min(24rem,calc(100vw-2rem))] space-y-3">
      {alerts.map((alert) => (
        <div className="flex gap-3 rounded-lg border border-amber-300 bg-amber-50 p-4 shadow-lg" key={alert.id} role="alert">
          <BellRing className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-slate-900">Reminder due</p>
            <p className="mt-1 text-sm text-slate-700">{alert.title}</p>
          </div>
          <button aria-label="Dismiss reminder" className="text-slate-500 hover:text-slate-900" onClick={() => setAlerts((current) => current.filter((item) => item.id !== alert.id))}>
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
