"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  CheckCircle,
} from "lucide-react";
import { toast } from "sonner";
import Logo from "@/assets/CampusCoreLogo.svg";

const STORAGE_KEY = "campus_setup_request";

export default function CampusSetup() {
  const [collegeName, setCollegeName] = useState("");
  const [email, setEmail] = useState("");
  const [contact, setContact] = useState("");
  const [address, setAddress] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setSubmitted(true);
    }
  }, []);

  const submitRequest = () => {
    if (!collegeName || !email) {
      toast.error("College name and official email are required");
      return;
    }

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        collegeName,
        email,
        contact,
        address,
        submittedAt: new Date().toISOString(),
      })
    );

    setSubmitted(true);
    toast.success("Campus request submitted successfully");
  };

  return (
    <div className="min-h-screen">
      {/* Public Navbar */}
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-5xl">
          {/* Hero */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-4">
              <img
                src={Logo}
                alt="CampusCore"
                className="w-16 h-16 rounded-xl"
              />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold font-display mb-3">
              Bring CampusCore to Your Campus
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Digitize notices, classes, notes, and communication for your
              students and faculty — all in one platform.
            </p>
          </div>

          {/* Content */}
          <div className="grid md:grid-cols-2 gap-8 items-start">
            {/* Left – Benefits */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">
                Why CampusCore?
              </h2>

              <ul className="space-y-4 text-sm">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  Centralized notices, assignments & study material
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  Online classes with attendance support
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  Separate dashboards for Admin, Faculty & Students
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  Modern, mobile-friendly interface
                </li>
              </ul>
            </div>

            {/* Right – Form */}
            <Card>
              <CardContent className="p-6 space-y-4">
                {submitted ? (
                  <div className="text-center py-12">
                    <CheckCircle className="w-14 h-14 text-green-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">
                      Request Submitted
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      Thank you for your interest.  
                      Our team will contact you shortly.
                    </p>
                  </div>
                ) : (
                  <>
                    <h3 className="text-lg font-semibold">
                      Campus Details
                    </h3>

                    <div className="space-y-1">
                      <label className="text-sm font-medium">
                        College / Campus Name *
                      </label>
                      <Input
                        placeholder="St Thomas College of Engineering and Technology"
                        value={collegeName}
                        onChange={(e) =>
                          setCollegeName(e.target.value)
                        }
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-sm font-medium flex items-center gap-1">
                        <Mail className="w-4 h-4" />
                        Official Email *
                      </label>
                      <Input
                        placeholder="admin@college.edu"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-sm font-medium flex items-center gap-1">
                        <Phone className="w-4 h-4" />
                        Contact Number
                      </label>
                      <Input
                        placeholder="+91 98765 43210"
                        value={contact}
                        onChange={(e) =>
                          setContact(e.target.value)
                        }
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-sm font-medium flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        Campus Address
                      </label>
                      <Textarea
                        rows={3}
                        placeholder="City, State"
                        value={address}
                        onChange={(e) =>
                          setAddress(e.target.value)
                        }
                      />
                    </div>

                    <Button
                      onClick={submitRequest}
                      className="w-full mt-4"
                    >
                      Request Campus Setup
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
