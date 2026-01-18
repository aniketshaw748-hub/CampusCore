"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  Video,
  CalendarPlus,
  PlayCircle,
  Clock,
  Trash2,
} from "lucide-react";

export default function MyClasses() {
  const [showPopup, setShowPopup] = useState(true);

  const [subject, setSubject] = useState("");
  const [dateTime, setDateTime] = useState("");

  const [liveClass, setLiveClass] = useState(null);

  // demo popup once
  useEffect(() => {
    const seen = localStorage.getItem("faculty-myclasses-demo");
    if (!seen) {
      setShowPopup(true);
      localStorage.setItem("faculty-myclasses-demo", "true");
    }
  }, []);

  const scheduleClass = () => {
    if (!subject || !dateTime) {
      alert("Please enter subject and date/time");
      return;
    }

    setLiveClass({
      subject,
      time: new Date(dateTime).toLocaleString(),
    });

    setSubject("");
    setDateTime("");
  };

  const startLiveClass = () => {
    window.open("https://meet.google.com", "_blank");
  };

  const deleteLiveClass = () => {
    setLiveClass(null);
  };

  const openRecording = () => {
    window.open(
      "https://youtu.be/OLvlRW6DHl8?si=w4ZfrkV6SASKwACC",
      "_blank"
    );
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Demo Popup */}
        {showPopup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-lg w-full max-w-sm p-5">
              <h2 className="text-lg font-semibold mb-2">Demo Mode</h2>
              <p className="text-sm text-gray-600 mb-4">
                This is a demo version of the faculty classes module.
              </p>
              <div className="flex justify-end">
                <button
                  onClick={() => setShowPopup(false)}
                  className="px-4 py-2 bg-blue-600 text-white rounded"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">My Classes</h1>
          <p className="text-sm text-muted-foreground">
            Schedule and manage your online classes
          </p>
        </div>

        {/* Schedule Class */}
        <div className="border rounded-lg p-4">
          <h2 className="flex items-center gap-2 font-semibold mb-4">
            <CalendarPlus size={18} />
            Schedule Live Class
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Subject Name"
              className="border rounded text-black px-3 py-2"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
            <input
              type="datetime-local"
              className="border rounded text-black px-3 py-2"
              value={dateTime}
              onChange={(e) => setDateTime(e.target.value)}
            />
          </div>

          <button
            onClick={scheduleClass}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Schedule Class
          </button>
        </div>

        {/* Live / Upcoming Class */}
        {liveClass && (
          <div className="border border-green-500 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="flex items-center gap-2 font-semibold">
                <Video size={18} />
                Live / Upcoming Class
              </h2>
              <span className="text-xs bg-green-500 text-white px-2 py-1 rounded">
                LIVE / READY
              </span>
            </div>

            <p className="font-medium">{liveClass.subject}</p>
            <p className="text-sm text-gray-600">{liveClass.time}</p>

            <div className="flex gap-2 mt-3">
              <button
                onClick={startLiveClass}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Start Live Class
              </button>

              <button
                onClick={deleteLiveClass}
                className="px-3 py-2 border rounded text-red-600 hover:bg-red-50"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Previous Classes */}
        <div className="border rounded-lg p-4">
          <h2 className="flex items-center gap-2 font-semibold mb-4">
            <PlayCircle size={18} />
            Previous Classes
          </h2>

          <div className="flex justify-between items-center border rounded p-3">
            <div>
              <p className="font-medium">DBMS – Normalization</p>
              <p className="text-xs text-gray-600 flex items-center gap-1">
                <Clock size={12} /> 45 mins • Recorded
              </p>
            </div>
            <button
              onClick={openRecording}
              className="px-3 py-1 border rounded text-blue-600 hover:bg-blue-50"
            >
              View Recording
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
