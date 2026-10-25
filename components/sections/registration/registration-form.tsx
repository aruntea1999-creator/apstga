"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { Upload, Check, X, Camera, Download, FileText, Loader2 } from "lucide-react";
import { districtData } from "@/lib/district-data";
import { useSettings } from "@/lib/use-settings";
import { createAcknowledgementLetter, type AcknowledgementApplication } from "@/lib/acknowledgement-letter";

interface FormData {
  fullName: string; fathersName: string; gender: string; dateOfBirth: string;
  mobile: string; email: string; aadhaar: string;
  district: string; circle: string; village: string; postOffice: string;
  policeStation: string; pinCode: string;
  estateName: string; teaDistrict: string; teaVillage: string;
  totalArea: string; teaVariety: string; yearStarted: string; annualProduction: string;
  organicConventional: string;
  passportPhoto: File | null; aadhaarCard: File | null;
}

const emptyForm: FormData = {
  fullName: "", fathersName: "", gender: "", dateOfBirth: "", mobile: "", email: "", aadhaar: "",
  district: "", circle: "", village: "", postOffice: "", policeStation: "", pinCode: "",
  estateName: "", teaDistrict: "", teaVillage: "", totalArea: "", teaVariety: "",
  yearStarted: "", annualProduction: "", organicConventional: "",
  passportPhoto: null, aadhaarCard: null,
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

function SuccessScreen({ acknowledgement }: { acknowledgement: AcknowledgementApplication }) {
  const { settings } = useSettings();
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const downloadLetter = async () => {
    setDownloading(true);
    setDownloadError(null);
    try {
      const { blob, filename } = await createAcknowledgementLetter(acknowledgement, settings);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 2000);
    } catch {
      setDownloadError("We could not prepare the acknowledgement letter. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto text-center py-12">
      <div className="w-20 h-20 rounded-full bg-[#0B4A2E]/10 flex items-center justify-center mx-auto mb-6">
        <Check className="w-10 h-10 text-[#0B4A2E]" />
      </div>
      <h2 className="text-2xl md:text-3xl font-extrabold text-foreground mb-3">Registration Submitted Successfully</h2>
      <p className="text-[#B8860B] mb-8 max-w-md mx-auto font-medium">
        Your application has been received. Our team will verify your information and get back to you.
      </p>
      <div className="bg-white rounded-lg border border-[#D1D5DB] shadow-sm p-6 mb-6 text-left">
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-[#D1D5DB]">
            <span className="text-sm text-muted">Application Number</span>
            <span className="text-sm font-bold text-foreground">{acknowledgement.applicationNo || "N/A"}</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-[#D1D5DB]">
            <span className="text-sm text-muted">Registration Date</span>
            <span className="text-sm font-medium text-foreground">
              {acknowledgement.submittedAt.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
            </span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-[#D1D5DB]">
            <span className="text-sm text-muted">Status</span>
            <span className="text-sm font-bold text-[#B8860B]">Pending Verification</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-muted">Estimated Verification Time</span>
            <span className="text-sm font-medium text-foreground">15–20 Working Days</span>
          </div>
        </div>
      </div>

      <div className="bg-[#F3F8F5] rounded-xl border border-[#0B4A2E]/20 p-5 mb-4 text-left">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-[#0B4A2E]/10 flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5 text-[#0B4A2E]" />
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">Your acknowledgement letter is ready</p>
            <p className="text-xs text-muted mt-1 leading-relaxed">
              Download the official letter for your records. It includes the Association&apos;s letterhead,
              your application particulars and the current verification status.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={downloadLetter}
          disabled={downloading}
          className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#0B4A2E] text-white font-bold text-sm hover:bg-[#0A3D26] transition-all shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          {downloading ? "Preparing Letter..." : "Download Acknowledgement Letter"}
        </button>
        {downloadError && <p className="text-xs text-red-600 mt-3">{downloadError}</p>}
      </div>

      <Link
        href="/"
        className="inline-block text-sm font-semibold text-muted hover:text-[#0B4A2E] transition-colors"
      >
        Return to homepage
      </Link>
    </div>
  );
}

function CameraModal({ onCapture, onClose }: {
  onCapture: (file: File) => void;
  onClose: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [supported] = useState(
    () => typeof navigator !== "undefined" && Boolean(navigator.mediaDevices?.getUserMedia)
  );
  const [error, setError] = useState<string | null>(
    supported ? null : "Camera is not supported in this browser."
  );
  const [starting, setStarting] = useState(supported);
  const [ready, setReady] = useState(false);

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  useEffect(() => {
    if (!supported) return;
    let cancelled = false;
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "environment" }, audio: false })
      .then((stream) => {
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        setStarting(false);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => setError("Could not start the camera."));
        }
      })
      .catch(() => {
        setStarting(false);
        setError("Camera access was denied. Please allow camera permission and try again, or use the Choose File option.");
      });
    return () => {
      cancelled = true;
      stopStream();
    };
  }, [supported, stopStream]);

  const capture = () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0);
    const type = "image/jpeg";
    canvas.toBlob(
      (blob) => {
        if (blob) {
          const name = `camera-${Date.now()}.jpg`;
          const file = new File([blob], name, { type });
          stopStream();
          onCapture(file);
        }
      },
      type,
      0.9
    );
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#E5E7EB]">
          <h3 className="text-sm font-bold text-foreground">Take a Photo</h3>
          <button type="button" onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-100 text-muted hover:text-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="relative bg-black aspect-[4/3]">
          {starting && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-white/80 text-sm flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                Starting camera...
              </div>
            </div>
          )}
          {error && (
            <div className="absolute inset-0 flex items-center justify-center p-6">
              <p className="text-white/90 text-sm text-center">{error}</p>
            </div>
          )}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            onLoadedMetadata={() => setReady(true)}
            onError={() => {
              setReady(false);
              setError("Could not start the camera.");
            }}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex items-center justify-center gap-4 px-5 py-4">
          <button type="button" onClick={capture} disabled={!!error || starting || !ready}
            className="h-11 w-11 rounded-full bg-[#0B4A2E] text-white flex items-center justify-center hover:bg-[#0A3D26] transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            <Camera className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

function FileUpload({ label, file, onChange, error }: {
  label: string; file: File | null; onChange: (f: File | null) => void; error?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [cameraOpen, setCameraOpen] = useState(false);

  const handleCapture = (f: File) => {
    onChange(f);
    setCameraOpen(false);
  };

  return (
    <div>
      <label className="block text-[13px] font-medium text-foreground mb-1">{label} <span className="text-red-500">*</span></label>
      <div className="flex items-center gap-3">
        <button type="button" onClick={() => inputRef.current?.click()}
          className="h-10 px-4 rounded-lg bg-gray-100 border border-[#CBD5E0] text-[14px] font-medium text-foreground hover:bg-gray-200 transition-colors leading-none">
          Choose File
        </button>
        <button type="button" onClick={() => setCameraOpen(true)}
          className="h-10 px-4 rounded-lg bg-[#0B4A2E] text-white text-[14px] font-medium hover:bg-[#0A3D26] transition-colors leading-none flex items-center gap-1.5">
          <Camera className="w-3.5 h-3.5" /> Take Photo
        </button>
        <input ref={inputRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) onChange(f); }} />
        {file ? (
          <div className="flex items-center gap-2 text-sm text-muted">
            <span className="text-foreground font-medium truncate max-w-[180px]">{file.name}</span>
            <span className="text-xs">({formatFileSize(file.size)})</span>
            <button type="button" onClick={(e) => { e.stopPropagation(); onChange(null); }}
              className="p-1 rounded-full hover:bg-red-50 text-muted hover:text-red-500">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <span className="text-sm text-muted">No file chosen</span>
        )}
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      {cameraOpen && <CameraModal onCapture={handleCapture} onClose={() => setCameraOpen(false)} />}
    </div>
  );
}

export default function RegistrationForm() {
  const [data, setData] = useState<FormData>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [acknowledgement, setAcknowledgement] = useState<AcknowledgementApplication | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [blockOptions, setBlockOptions] = useState<string[]>([]);
  const [sameAsHome, setSameAsHome] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const update = (field: keyof FormData, value: string | File | null) => {
    setData((prev) => {
      const next = { ...prev, [field]: value };
      if (sameAsHome) {
        if (field === "district") next.teaDistrict = value as string;
        if (field === "village") next.teaVillage = value as string;
      }
      return next;
    });
    setErrors((prev) => { const n = { ...prev }; delete n[field]; return n; });
  };

  const onSameAsHomeChange = (checked: boolean) => {
    setSameAsHome(checked);
    if (checked) {
      setData((prev) => ({
        ...prev,
        teaDistrict: prev.district,
        teaVillage: prev.village,
      }));
    }
  };

  const onDistrictChange = (value: string) => {
    update("district", value);
    update("circle", "");
    setBlockOptions(districtData.blocks[value] || []);
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!data.fullName.trim()) errs.fullName = "Full Name is required";
    if (!data.fathersName.trim()) errs.fathersName = "Father's Name is required";
    if (!data.gender) errs.gender = "Gender is required";
    if (!data.dateOfBirth) errs.dateOfBirth = "Date of Birth is required";
    if (!data.mobile.trim() || !/^\d{10}$/.test(data.mobile)) errs.mobile = "Valid 10-digit mobile number is required";
    if (!data.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errs.email = "Valid email is required";
    if (!data.aadhaar.trim() || !/^\d{12}$/.test(data.aadhaar.replace(/[\s-]/g, ""))) errs.aadhaar = "Valid 12-digit Aadhaar is required";
    if (!data.district.trim()) errs.district = "District is required";
    if (!data.circle.trim()) errs.circle = "Circle is required";
    if (!data.village.trim()) errs.village = "Village is required";
    if (!data.postOffice.trim()) errs.postOffice = "Post Office is required";
    if (!data.policeStation.trim()) errs.policeStation = "Police Station is required";
    if (!data.pinCode.trim() || !/^\d{6}$/.test(data.pinCode)) errs.pinCode = "Valid 6-digit PIN code is required";
    if (!data.estateName.trim()) errs.estateName = "Estate Name is required";
    if (!data.teaDistrict.trim()) errs.teaDistrict = "Tea Garden Location District is required";
    if (!data.teaVillage.trim()) errs.teaVillage = "Tea Garden Village/Location is required";
    if (!data.totalArea.trim() || isNaN(Number(data.totalArea))) errs.totalArea = "Valid total area is required";
    if (!data.teaVariety.trim()) errs.teaVariety = "Tea Variety is required";
    if (!data.yearStarted.trim() || !/^\d{4}$/.test(data.yearStarted)) errs.yearStarted = "Valid year is required";
    if (!data.annualProduction.trim() || isNaN(Number(data.annualProduction))) errs.annualProduction = "Valid annual production is required";
    if (!data.organicConventional) errs.organicConventional = "Select Organic or Conventional";
    if (!data.passportPhoto) errs.passportPhoto = "Passport photograph is required";
    if (!data.aadhaarCard) errs.aadhaarCard = "Aadhaar card is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    if (!validate()) {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    setUploading(true);
    try {
      const fd = new FormData();
      (Object.keys(emptyForm) as Array<keyof FormData>).forEach((k) => {
        if (k === "passportPhoto" || k === "aadhaarCard") {
          const f = data[k] as File | null;
          if (f) fd.append(k, f);
          return;
        }
        fd.append(k, String((data[k] as string) ?? ""));
      });
      const res = await fetch("/api/register", { method: "POST", body: fd });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setSubmitError(json.error || "We couldn't submit your registration. Please try again.");
        formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
      setAcknowledgement({
        applicationNo: json.applicationNo || "",
        submittedAt: new Date(),
        fullName: data.fullName,
        fatherName: data.fathersName,
        aadhaar: data.aadhaar,
        mobile: data.mobile,
        email: data.email,
        village: data.village,
        postOffice: data.postOffice,
        policeStation: data.policeStation,
        district: data.district,
        pinCode: data.pinCode,
        gardenName: data.estateName,
        gardenVillage: data.teaVillage,
        gardenDistrict: data.teaDistrict,
        teaArea: data.totalArea,
        teaVariety: data.teaVariety,
        cultivationType: data.organicConventional,
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setSubmitError("Network error. Please check your connection and try again.");
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    } finally {
      setUploading(false);
    }
  };

  if (acknowledgement) return <SuccessScreen acknowledgement={acknowledgement} />;

  const renderField = (label: string, field: keyof FormData, opts?: { type?: string; placeholder?: string; options?: string[] }) => {
    const value = data[field] as string;
    const error = errors[field];

    if (opts?.options) {
      return (
        <div key={field}>
          <label className="block text-[13px] font-medium text-foreground mb-1">
            {label} <span className="text-red-500">*</span>
          </label>
          <select
            value={value}
            onChange={(e) => update(field, e.target.value)}
            className={`w-full h-10 px-3 rounded-lg bg-[#F5F5F5] text-[14px] text-foreground transition-all outline-none appearance-none cursor-pointer
              ${error ? "border-red-400" : "border-[#CBD5E0]"}
              focus:border-[#0B4A2E] focus:ring-2 focus:ring-[#0B4A2E]/10 border ${!value ? "text-muted" : ""}`}
          >
            <option value="" disabled>Select {label}</option>
            {opts.options.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
          {error && <p className="text-xs text-red-500 mt-0.5">{error}</p>}
        </div>
      );
    }

    return (
      <div key={field}>
        <label className="block text-[13px] font-medium text-foreground mb-1">
          {label} <span className="text-red-500">*</span>
        </label>
        <input
          type={opts?.type || "text"}
          value={value}
          onChange={(e) => update(field, e.target.value)}
          placeholder={opts?.placeholder}
          className={`w-full h-10 px-3 rounded-lg bg-[#F5F5F5] text-[14px] text-foreground transition-all outline-none
            ${error ? "border-red-400" : "border-[#CBD5E0]"}
            focus:border-[#0B4A2E] focus:ring-2 focus:ring-[#0B4A2E]/10 border`}
        />
        {error && <p className="text-xs text-red-500 mt-0.5">{error}</p>}
      </div>
    );
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="w-full space-y-5 py-6">
      <div className="text-center mb-1">
        <h1 className="text-xl md:text-2xl font-extrabold text-foreground">Grower Registration</h1>
        <p className="text-[#B8860B] mt-0.5 text-sm font-medium">Fill in your details to register as a small tea grower</p>
      </div>

      <div className="bg-white rounded-lg border border-[#E5E7EB] shadow-sm p-5">
        <div className="bg-[#0B4A2E] -mx-5 -mt-5 rounded-t-lg px-5 py-2.5 mb-5 flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0">
            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
          </div>
          <span className="text-white font-bold text-[15px] tracking-[0.5px]">1. PERSONAL INFORMATION</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4 mb-5">
          {renderField("Full Name", "fullName")}
          {renderField("Father's / Husband's Name", "fathersName")}
          {renderField("Gender", "gender", { options: ["Male", "Female", "Other"] })}
          {renderField("Date of Birth", "dateOfBirth", { type: "date" })}
          {renderField("Mobile Number", "mobile", { type: "tel" })}
          {renderField("Email Address", "email", { type: "email" })}
          {renderField("Aadhaar Number", "aadhaar", { placeholder: "1234 5678 9012" })}
        </div>

        <div className="bg-[#0B4A2E] -mx-5 px-5 py-2.5 mb-5 flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0">
            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          </div>
          <span className="text-white font-bold text-[15px] tracking-[0.5px]">2. HOME ADDRESS</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4 mb-5">
          <div key="district">
            <label className="block text-[13px] font-medium text-foreground mb-1">District <span className="text-red-500">*</span></label>
            <select value={data.district} onChange={(e) => onDistrictChange(e.target.value)}
              className="w-full h-10 px-3 rounded-lg bg-[#F5F5F5] text-[14px] text-foreground transition-all outline-none appearance-none cursor-pointer border border-[#CBD5E0] focus:border-[#0B4A2E] focus:ring-2 focus:ring-[#0B4A2E]/10">
              <option value="">Select District</option>
              {districtData.districts.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
            {errors.district && <p className="text-xs text-red-500 mt-0.5">{errors.district}</p>}
          </div>
          <div key="circle">
            <label className="block text-[13px] font-medium text-foreground mb-1">Circle / Block <span className="text-red-500">*</span></label>
            <select value={data.circle} onChange={(e) => update("circle", e.target.value)}
              className="w-full h-10 px-3 rounded-lg bg-[#F5F5F5] text-[14px] text-foreground transition-all outline-none appearance-none cursor-pointer border border-[#CBD5E0] focus:border-[#0B4A2E] focus:ring-2 focus:ring-[#0B4A2E]/10">
              <option value="">Select Circle / Block</option>
              {blockOptions.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
            {errors.circle && <p className="text-xs text-red-500 mt-0.5">{errors.circle}</p>}
          </div>
          {renderField("Village", "village")}
          {renderField("Post Office", "postOffice")}
          {renderField("Police Station", "policeStation")}
          {renderField("PIN Code", "pinCode", { type: "tel" })}
        </div>

        <div className="bg-[#0B4A2E] -mx-5 px-5 py-2.5 mb-5 flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0">
            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <span className="text-white font-bold text-[15px] tracking-[0.5px]">3. TEA GARDEN ADDRESS</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4 mb-5">
          <div className="col-span-full">
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={sameAsHome}
                onChange={(e) => onSameAsHomeChange(e.target.checked)}
                className="w-4 h-4 accent-[#0B4A2E] cursor-pointer"
              />
              <span className="text-[13px] font-medium text-foreground">Same as Home Address</span>
            </label>
            <p className="text-xs text-muted mt-1 ml-6">Tick if the tea garden is located at the same place as your residence.</p>
          </div>
          {renderField("Estate / Garden Name", "estateName")}
          <div key="teaDistrict">
            <label className="block text-[13px] font-medium text-foreground mb-1">Tea Garden Location District <span className="text-red-500">*</span></label>
            <select value={data.teaDistrict} disabled={sameAsHome}
              onChange={(e) => { update("teaDistrict", e.target.value); update("teaVillage", ""); }}
              className="w-full h-10 px-3 rounded-lg bg-[#F5F5F5] text-[14px] text-foreground transition-all outline-none appearance-none cursor-pointer border border-[#CBD5E0] focus:border-[#0B4A2E] focus:ring-2 focus:ring-[#0B4A2E]/10 disabled:opacity-60 disabled:cursor-not-allowed">
              <option value="">Select District</option>
              {districtData.districts.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
            {errors.teaDistrict && <p className="text-xs text-red-500 mt-0.5">{errors.teaDistrict}</p>}
          </div>
          <div key="teaVillage">
            <label className="block text-[13px] font-medium text-foreground mb-1">Tea Garden Village/Location <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={data.teaVillage}
              disabled={sameAsHome}
              onChange={(e) => update("teaVillage", e.target.value)}
              className={`w-full h-10 px-3 rounded-lg bg-[#F5F5F5] text-[14px] text-foreground transition-all outline-none ${errors.teaVillage ? "border-red-400" : "border-[#CBD5E0]"} focus:border-[#0B4A2E] focus:ring-2 focus:ring-[#0B4A2E]/10 border disabled:opacity-60 disabled:cursor-not-allowed`}
            />
            {errors.teaVillage && <p className="text-xs text-red-500 mt-0.5">{errors.teaVillage}</p>}
          </div>
          {renderField("Total Area (Hectares)", "totalArea", { type: "number" })}
          {renderField("Tea Variety", "teaVariety")}
          {renderField("Year Started", "yearStarted", { type: "tel" })}
          {renderField("Annual Production (Kg)", "annualProduction", { type: "number" })}
          {renderField("Type", "organicConventional", { options: ["Organic", "Conventional", "Both"] })}
        </div>
      </div>

      <div className="bg-white rounded-lg border border-[#E5E7EB] shadow-sm p-5">
        <div className="bg-[#0B4A2E] -mx-5 -mt-5 rounded-t-lg px-5 py-2.5 mb-5 flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0">
            <Upload className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-white font-bold text-[15px] tracking-[0.5px]">4. UPLOAD DOCUMENTS</span>
        </div>
        <div className="space-y-4">
          <FileUpload label="Passport Photograph" file={data.passportPhoto}
            onChange={(f) => update("passportPhoto", f)} error={errors.passportPhoto} />
          <FileUpload label="Aadhaar Card" file={data.aadhaarCard}
            onChange={(f) => update("aadhaarCard", f)} error={errors.aadhaarCard} />
        </div>
      </div>

      {submitError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm font-semibold text-red-700 flex items-start gap-2">
            <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            {submitError}
          </p>
          {submitError.toLowerCase().includes("already registered") && (
            <Link
              href="/growers"
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-[#0B4A2E] hover:underline"
            >
              Search registered growers
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </Link>
          )}
        </div>
      )}

      <div className="bg-white rounded-lg border border-[#E5E7EB] shadow-sm p-5">
        <div className="bg-[#0B4A2E] -mx-5 -mt-5 rounded-t-lg px-5 py-2.5 mb-5 flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0">
            <Upload className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-white font-bold text-[15px] tracking-[0.5px]">5. DATA CONSENT</span>
        </div>
        <p className="text-sm text-foreground mb-3">
          By submitting this form, I consent to the Arunachal Pradesh Small Tea Growers Association collecting and storing my personal data (name, DOB, Aadhaar, address, mobile, email, photographs, bank details, and garden information) for the purposes of membership registration, ID card generation, administrative communications, and compliance with regulatory requirements. I understand I may withdraw this consent at any time by contacting the Association.
        </p>
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              required
              className="w-4 h-4 accent-[#0B4A2E] cursor-pointer"
            />
            <span className="text-[13px] font-medium text-foreground">I consent to the above</span>
          </label>
          <a
            href="/privacy"
            className="text-xs text-[#0A5A2E] hover:underline"
            target="_blank"
          >
            Read our Privacy Policy
          </a>
        </div>
      </div>

      {Object.keys(errors).length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm font-semibold text-red-700 mb-2">Please fix the following errors:</p>
          <ul className="space-y-1">
            {Object.values(errors).map((e) => (
              <li key={e} className="text-xs text-red-600 flex items-start gap-1.5">{e}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="text-center">
        <button type="submit" disabled={uploading}
          className="inline-flex items-center gap-2 px-7 py-2.5 rounded-full bg-[#0B4A2E] text-white font-bold text-[14px] hover:bg-[#0A3D26] transition-all shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed">
          {uploading ? "Submitting..." : "Submit Registration"}
        </button>
      </div>
    </form>
  );
}