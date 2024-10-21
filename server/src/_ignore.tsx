// import { Button } from "@/components/ui/button";
// import { format } from "https://cdn.skypack.dev/date-fns";
// import React, { useEffect, useState } from "react";

// const App: React.FC = () => {
//   const [formattedDate, setFormattedDate] = useState<string>("");
//   const [formatIndex, setFormatIndex] = useState<number>(0);
//   const dateFormats: string[] = ["MMMM do, yyyy", "yyyy-MM-dd", "dd/MM/yyyy"];

//   useEffect(() => {
//     updateFormattedDate();
//   }, [formatIndex]);

//   const updateFormattedDate = () => {
//     const date = new Date();
//     const formatted = format(date, dateFormats[formatIndex]);
//     setFormattedDate(formatted);
//   };

//   const cycleFormat = () => {
//     setFormatIndex((prevIndex) => (prevIndex + 1) % dateFormats.length);
//   };

//   return (
//     <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
//       <h1 className="text-3xl font-bold mb-4 text-blue-600">
//         Date-fns in React with ES Modules!
//       </h1>
//       <div id="result" className="text-xl mb-4">
//         Today's date is {formattedDate}
//       </div>
//       <Button onClick={cycleFormat}>Change Date Format</Button>
//     </div>
//   );
// };

// import { renderApp } from "./root";
// renderApp(App);
