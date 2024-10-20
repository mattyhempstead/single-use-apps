import { format } from "https://cdn.skypack.dev/date-fns";
import React, { useEffect, useState } from "react";

const App = () => {
  const [formattedDate, setFormattedDate] = useState("");
  const [formatIndex, setFormatIndex] = useState(0);
  const dateFormats = ["MMMM do, yyyy", "yyyy-MM-dd", "dd/MM/yyyy"];

  useEffect(() => {
    updateFormattedDate();
  }, [formatIndex]);

  const updateFormattedDate = () => {
    const date = new Date();
    const formatted = format(date, dateFormats[formatIndex]);
    setFormattedDate(formatted);
  };

  const cycleFormat = () => {
    setFormatIndex((prevIndex) => (prevIndex + 1) % dateFormats.length);
  };

  return (
    <div>
      <h1>Date-fns in React with ES Modules!</h1>
      <div id="result">Today's date is {formattedDate}</div>
      <button onClick={cycleFormat}>Change Date Format</button>
    </div>
  );
};
