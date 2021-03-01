// eslint-disable-next-line import/no-extraneous-dependencies
// https://github.com/snowpackjs/snowpack/discussions/1207
import type { CalendarOptions } from "@fullcalendar/common";
import "@fullcalendar/core/vdom.js";
import FullCalendar from "@fullcalendar/react";
import interactionPlugin from "@fullcalendar/interaction"; // needed for dayClick
import timeGridPlugin from "@fullcalendar/timegrid";
import React from "react";
import { INITIAL_DATE } from "utilities/constants";
import "./Calendar.scss";

export const Calendar = (props: CalendarOptions) => {
  return (
    <>
      <FullCalendar {...props} />
    </>
  );
};

Calendar.defaultProps = {
  allDaySlot: false,
  dayHeaderFormat: { weekday: "short" },
  droppable: false,
  editable: false, // TODO: Change to true if we can lock section meeting times
  headerToolbar: false,
  height: "auto",
  initialDate: INITIAL_DATE,
  initialView: "timeGridWeek",
  nowIndicator: false,
  plugins: [interactionPlugin, timeGridPlugin],
  selectable: true,
  slotMaxTime: "22:00:00",
  slotMinTime: "6:00:00",
  weekends: false,
};
