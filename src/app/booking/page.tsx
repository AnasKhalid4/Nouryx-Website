"use client";

import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { useLocale } from "@/hooks/use-locale";
import { useState } from "react";

const timeSlots = [
  "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00",
];

const DAY_HEADERS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

const mockServices = [
  { name: "Women's Haircut", price: 45, minutes: 45 },
  { name: "Blow Dry", price: 35, minutes: 30 },
];

function getDaysInMonth(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const offset = firstDay === 0 ? 6 : firstDay - 1;
  const days = [];
  for (let i = 0; i < offset; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);
  return days;
}

function formatMonthYear(year: number, month: number) {
  return new Date(year, month)
    .toLocaleString("default", { month: "long", year: "numeric" })
    .toUpperCase();
}

export default function BookingPage() {
  const { t } = useLocale();
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const days = getDaysInMonth(year, month);

  const isPast = (d: number) => {
    const date = new Date(year, month, d);
    const t = new Date(); t.setHours(0, 0, 0, 0);
    return date < t;
  };

  const isToday = (d: number) =>
    d === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear((y) => y - 1); }
    else setMonth((m) => m - 1);
    setSelectedDay(null); setSelectedTime(null);
  };
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear((y) => y + 1); }
    else setMonth((m) => m + 1);
    setSelectedDay(null); setSelectedTime(null);
  };

  const handleDaySelect = (day: number) => {
    setSelectedDay(day === selectedDay ? null : day);
    setSelectedTime(null);
  };

  const monthName = new Date(year, month).toLocaleString("default", { month: "long", year: "numeric" });
  const selectedLabel = selectedDay
    ? new Date(year, month, selectedDay)
        .toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
        .toUpperCase()
    : null;

  const totalPrice = mockServices.reduce((s, sv) => s + sv.price, 0);
  const totalDuration = mockServices.reduce((s, sv) => s + sv.minutes, 0);

  return (
    <>
    <Header/>
   
    <div className="min-h-screen bg-[#FAF8F5] px-3 py-6 sm:px-4 sm:py-8">
      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .slide-in { animation: slideDown 0.25s ease forwards; }
      `}</style>

      <div className="mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4 lg:gap-6 items-start">

        {/* ── LEFT: Calendar + time slots ── */}
        <div>
          <div className="border border-[#EDE7DF] bg-white  overflow-hidden">

            {/* Month header */}
            <div className="bg-[#C9AA8B] flex items-center justify-between px-4 sm:px-6 py-3">
              <button
                onClick={prevMonth}
                className="text-white/80 hover:text-white transition-colors text-lg px-2 leading-none bg-transparent border-none cursor-pointer"
              >
                ←
              </button>
              <span className="text-white font-semibold text-[11px] sm:text-sm tracking-widest">
                {formatMonthYear(year, month)}
              </span>
              <button
                onClick={nextMonth}
                className="text-white/80 hover:text-white transition-colors text-lg px-2 leading-none bg-transparent border-none cursor-pointer"
              >
                →
              </button>
            </div>

            {/* Day-of-week headers */}
            <div className="grid grid-cols-7 border-b border-[#EDE7DF]">
              {DAY_HEADERS.map((d) => (
                <div
                  key={d}
                  className="text-center py-2 text-[9px] sm:text-[11px] font-semibold tracking-wider text-[#AAAAAA] border-r border-[#EDE7DF] last:border-r-0"
                >
                  {d}
                </div>
              ))}
            </div>

            {/* Day grid */}
            <div className="grid grid-cols-7">
              {days.map((day, i) => {
                const isLastCol = i % 7 === 6;
                const cellBorder = `border-b border-[#EDE7DF]${!isLastCol ? " border-r" : ""}`;

                if (!day) {
                  return (
                    <div
                      key={i}
                      className={`h-10 sm:h-12 md:h-[60px] ${cellBorder}`}
                    />
                  );
                }

                const past = isPast(day);
                const sel = selectedDay === day;
                const tod = isToday(day);

                return (
                  <div key={i} className={cellBorder}>
                    <button
                      disabled={past}
                      onClick={() => handleDaySelect(day)}
                      className={[
                        "w-full h-10 sm:h-12 md:h-[60px] flex items-start justify-start px-1.5 sm:px-2.5 pt-1.5 sm:pt-2 text-xs sm:text-sm transition-colors",
                        past
                          ? "text-[#CCCCCC] cursor-not-allowed"
                          : sel
                          ? "bg-[#E8C4B0] text-white font-semibold"
                          : tod
                          ? "text-[#C9AA8B] font-bold hover:bg-[#F5EDE6]"
                          : "text-[#555555] hover:bg-[#F5EDE6]",
                      ].join(" ")}
                    >
                      {day}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Time slots panel — revealed on date select */}
          {selectedDay && (
            <div className="slide-in border-x-2 border-b-2 border-[#E8C4B0] bg-white">

              {/* Panel heading */}
              <div className="px-4 sm:px-5 py-3 sm:py-4 border-b border-[#F0EBE4]">
                <p className="text-[10px] sm:text-xs font-semibold tracking-widest text-[#999999] uppercase m-0">
                  {t.booking.selectTime} — {selectedLabel}
                </p>
              </div>

              {/* Time buttons */}
              <div className="p-3 sm:p-5 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-1.5 sm:gap-2">
                {timeSlots.map((slot) => (
                  <button
                    key={slot}
                    onClick={() => setSelectedTime(slot === selectedTime ? null : slot)}
                    className={[
                      "py-2.5 sm:py-3 text-xs sm:text-sm font-medium text-center border transition-all",
                      selectedTime === slot
                        ? "bg-[#E8C4B0] border-[#E8C4B0] text-white font-semibold"
                        : "bg-white border-[#EDE7DF] text-[#444444] hover:bg-[#F5EDE6] hover:border-[#C9AA8B]",
                    ].join(" ")}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT: Summary ── */}
        <div className="lg:sticky lg:top-6">
          <div className="bg-white border border-[#EDE7DF] p-5 sm:p-6 shadow-sm">

            <p className="text-base font-bold text-[#222222] mb-4">{t.booking.summary}</p>

            {/* Services */}
            {mockServices.map((s, i) => (
              <div key={i} className="flex justify-between items-start mb-3">
                <div>
                  <p className="text-sm font-medium text-[#333333] m-0">{s.name}</p>
                  <p className="text-xs text-[#AAAAAA] mt-0.5 m-0">{s.minutes} min</p>
                </div>
                <span className="text-sm font-semibold text-[#333333]">€{s.price}</span>
              </div>
            ))}

            <div className="border-t border-[#EDE7DF] my-4" />

            {/* Date / Time / Duration */}
            {[
              { icon: "📅", label: t.booking.date,     value: selectedDay ? `${selectedDay} ${monthName}` : "—" },
              { icon: "🕐", label: t.booking.time,     value: selectedTime || "—" },
              { icon: "⏱",  label: t.booking.duration, value: `${totalDuration} min` },
            ].map(({ icon, label, value }) => (
              <div key={label} className="flex justify-between items-center mb-2.5">
                <span className="text-xs text-[#999999] flex items-center gap-1">
                  {icon} {label}
                </span>
                <span className="text-xs font-medium text-[#333333]">{value}</span>
              </div>
            ))}

            <div className="border-t border-[#EDE7DF] my-4" />

            {/* Total */}
            <div className="flex justify-between items-center mb-5">
              <span className="text-sm font-bold text-[#222222]">{t.booking.total}</span>
              <span className="text-2xl font-bold text-[#222222]">€{totalPrice}</span>
            </div>

            {/* Confirm button */}
            <button
              disabled={!selectedDay || !selectedTime}
              className="w-full py-3.5 text-sm font-bold tracking-wide bg-[#333333] text-white transition-colors hover:bg-[#111111] disabled:bg-[#CCCCCC] disabled:cursor-not-allowed"
            >
              ✓ {t.booking.confirm}
            </button>

            <p className="text-[10px] text-[#BBBBBB] text-center mt-2.5">
              {t.booking.freeCancellation}
            </p>
          </div>
        </div>

      </div>
    </div>
    <Footer/>
     </>
  );
}