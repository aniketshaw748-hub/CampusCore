"use client";

import { useEffect, useState } from "react";
import { Video, Calendar, PlayCircle, Bell } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

export default function Classes() {
  const [showDemoPopup, setShowDemoPopup] = useState(true);
  const [showNotifyPopup, setShowNotifyPopup] = useState(false);

  // show demo popup once
  useEffect(() => {
    const seen = localStorage.getItem("classes-demo-popup");
    if (!seen) {
      setShowDemoPopup(true);
      localStorage.setItem("classes-demo-popup", "true");
    }
  }, []);

  const openMeet = () => {
    window.open("https://meet.google.com", "_blank");
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
        {showDemoPopup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-lg w-full max-w-sm p-5">
              <h2 className="text-lg font-semibold mb-2">Demo Mode</h2>
              <p className="text-sm text-gray-600 mb-4">
                This is a demo preview.  
                The classes feature is currently under processing.
              </p>
              <div className="flex justify-end">
                <button
                  onClick={() => setShowDemoPopup(false)}
                  className="px-4 py-2 bg-blue-600 text-white rounded"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Notify Popup */}
        {showNotifyPopup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-lg w-full max-w-sm p-5">
              <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <Bell size={18} />
                Notification Enabled
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                You will be notified by Gmail when this class goes live.
              </p>
              <div className="flex justify-end">
                <button
                  onClick={() => setShowNotifyPopup(false)}
                  className="px-4 py-2 bg-blue-600 text-white rounded"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold">Online Classes</h1>
          <p className="text-sm text-gray-600">
            If you can’t attend college, join classes online
          </p>
        </div>

        {/* Live Class */}
        <div className="border border-blue-500 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="flex items-center gap-2 font-semibold">
              <Video size={18} />
              Live Class
            </h2>
            <span className="text-xs bg-red-500 text-white px-2 py-1 rounded">
              LIVE
            </span>
          </div>

          <p className="font-medium">Data Structures – Trees</p>
          <p className="text-sm text-gray-600">
            Faculty: Prof. Sharma
          </p>

          <div className="flex items-center justify-between mt-3">
            <span className="text-sm">
              Attendance Value: <strong>0.5</strong>
            </span>
            <button
              onClick={openMeet}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Join Live Class
            </button>
          </div>
        </div>

        {/* Scheduled Classes */}
        <div className="border rounded-lg p-4">
          <h2 className="flex items-center gap-2 font-semibold mb-3">
            <Calendar size={18} />
            Scheduled Classes
          </h2>

          <div className="flex justify-between items-center border rounded p-3 mb-2">
            <div>
              <p className="font-medium">Operating Systems</p>
              <p className="text-xs text-gray-600">
                Tomorrow • 10:00 AM
              </p>
            </div>
            <button
              onClick={() => setShowNotifyPopup(true)}
              className="px-3 py-1 text-xs border rounded text-blue-600 hover:bg-blue-50"
            >
              Notify Me
            </button>
          </div>

          <div className="flex justify-between items-center border rounded p-3">
            <div>
              <p className="font-medium">Computer Networks</p>
              <p className="text-xs text-gray-600">
                Friday • 2:00 PM
              </p>
            </div>
            <button
              onClick={() => setShowNotifyPopup(true)}
              className="px-3 py-1 text-xs border rounded text-blue-600 hover:bg-blue-50"
            >
              Notify Me
            </button>
          </div>
        </div>

        {/* Recorded Classes */}
        <div className="border rounded-lg p-4">
          <h2 className="flex items-center gap-2 font-semibold mb-3">
            <PlayCircle size={18} />
            Previous Recorded Classes
          </h2>

          <div className="flex justify-between items-center border rounded p-3 mb-2">
            <div>
              <p className="font-medium">DBMS – Normalization</p>
              <p className="text-xs text-gray-600">
                Recorded • 45 mins
              </p>
            </div>
            <button
              onClick={openRecording}
              className="px-3 py-1 border rounded text-blue-600 hover:bg-blue-50"
            >
              Watch
            </button>
          </div>

          <div className="flex justify-between items-center border rounded p-3">
            <div>
              <p className="font-medium">
                Software Engineering – SDLC
              </p>
              <p className="text-xs text-gray-600">
                Recorded • 50 mins
              </p>
            </div>
            <button
              onClick={openRecording}
              className="px-3 py-1 border rounded text-blue-600 hover:bg-blue-50"
            >
              Watch
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
