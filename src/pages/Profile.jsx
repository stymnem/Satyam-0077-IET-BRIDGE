import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Edit, Save, X, Camera } from "lucide-react";
import Cropper from "react-easy-crop";
import api from "../api/axios";

const MAX_YEAR = 2025;
const MAX_FILE_BYTES = 2 * 1024 * 1024; // 2MB

// --- High-quality crop settings ---
const TARGET_SIZE = 512; // final square size in px (change to 256/1024 if you prefer)
const OUTPUT_MIME = "image/jpeg"; // or "image/png"
const OUTPUT_QUALITY = 0.92; // JPEG/WebP quality

// Load image with best available path
async function loadImageBitmap(src) {
  if ("createImageBitmap" in window) {
    const res = await fetch(src);
    const blob = await res.blob();
    return await createImageBitmap(blob);
  }
  const img = new Image();
  img.crossOrigin = "anonymous";
  img.decoding = "async";
  img.src = src;
  await img.decode();
  return img;
}

/**
 * High-quality crop from original image with rotation/zoom applied.
 * Uses drawImage + imageSmoothingQuality to avoid aliasing.
 */
async function getCroppedImgHQ(
  imageSrc,
  crop, // { x, y, width, height } in pixels from react-easy-crop
  rotationDeg = 0,
  outSize = TARGET_SIZE,
  mime = OUTPUT_MIME,
  quality = OUTPUT_QUALITY
) {
  const img = await loadImageBitmap(imageSrc);

  // Bounding box for rotated image
  const rad = (rotationDeg * Math.PI) / 180;
  const sin = Math.abs(Math.sin(rad));
  const cos = Math.abs(Math.cos(rad));
  const bboxW = Math.ceil(img.width * cos + img.height * sin);
  const bboxH = Math.ceil(img.width * sin + img.height * cos);

  // Intermediate canvas: draw original image with rotation centered
  const mid = document.createElement("canvas");
  mid.width = bboxW;
  mid.height = bboxH;
  const ctxMid = mid.getContext("2d");
  ctxMid.imageSmoothingEnabled = true;
  ctxMid.imageSmoothingQuality = "high";
  ctxMid.translate(bboxW / 2, bboxH / 2);
  ctxMid.rotate(rad);
  ctxMid.drawImage(img, -img.width / 2, -img.height / 2);

  // Output canvas
  const out = document.createElement("canvas");
  out.width = outSize;
  out.height = outSize;
  const ctxOut = out.getContext("2d");
  ctxOut.imageSmoothingEnabled = true;
  ctxOut.imageSmoothingQuality = "high";

  // Sample the crop rect from rotated canvas into the output square
  ctxOut.drawImage(
    mid,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    outSize,
    outSize
  );

  return out.toDataURL(mime, quality);
}

export default function Profile() {
  const [editing, setEditing] = useState(false);
  const [preview, setPreview] = useState(""); // final avatar preview (Base64 or URL)
  const [dragOver, setDragOver] = useState(false);

  // cropper modal state
  const [cropOpen, setCropOpen] = useState(false);
  const [cropSrc, setCropSrc] = useState(""); // object URL of selected file
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  // file input ref for "Change Photo" button
  const fileInputRef = useRef(null);

  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => (await api.get("/profile")).data,
  });

  const updateMutation = useMutation({
    mutationFn: async (data) => (await api.put("/profile", data)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Profile updated successfully");
      setEditing(false);
    },
    onError: () => toast.error("Failed to update profile"),
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm({
    values: profile
      ? {
          fullName: profile.fullName ?? "",
          phone: profile.phone ?? "",
          profilePic: profile.profilePic ?? "",
          bio: profile.bio ?? "",
          batchYear: profile.batchYear ? String(profile.batchYear) : "",
        }
      : undefined,
  });

  // keep preview in sync with form/server
  const formPic = watch("profilePic");
  useEffect(() => {
    setPreview(formPic || profile?.profilePic || "");
  }, [formPic, profile?.profilePic]);

  /* ---------------- Phone validation & sanitize ---------------- */
  const phonePattern = useMemo(() => /^(\+91\d{10}|\d{10})$/, []);
  const sanitizePhone = (raw) => {
    if (!raw) return "";
    let v = raw.replace(/\s+/g, "");
    if (v.startsWith("+")) {
      v = "+" + v.slice(1).replace(/\D/g, "");
      if (!v.startsWith("+91")) v = v.replace(/^\+/, ""); // only +91 allowed
      return v;
    }
    return v.replace(/\D/g, "");
  };
  const onPhoneChange = (e) => {
    const sanitized = sanitizePhone(e.target.value);
    setValue("phone", sanitized, { shouldValidate: true });
  };

  /* ---------------- Image helpers ---------------- */
  const fileToObjectUrl = (file) => URL.createObjectURL(file);

  const processImageFile = async (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file.");
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      toast.error("Image too large. Max 2MB.");
      return;
    }
    // open cropper with object URL
    const url = fileToObjectUrl(file);
    setCropSrc(url);
    setZoom(1.2); // tiny zoom-in for nicer default
    setRotation(0);
    setCrop({ x: 0, y: 0 });
    setCropOpen(true);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    await processImageFile(file);
  };

  // drag & drop on avatar
  const onDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    if (!editing) return;
    const file = e.dataTransfer?.files?.[0];
    await processImageFile(file);
  };
  const onDragOver = (e) => {
    if (!editing) return;
    e.preventDefault();
    setDragOver(true);
  };
  const onDragLeave = () => setDragOver(false);

  // react-easy-crop callback
  const onCropComplete = useCallback((_area, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const confirmCrop = async () => {
    if (!cropSrc || !croppedAreaPixels) {
      setCropOpen(false);
      return;
    }
    try {
      const base64 = await getCroppedImgHQ(
        cropSrc,
        croppedAreaPixels,
        rotation,
        TARGET_SIZE,
        OUTPUT_MIME,
        OUTPUT_QUALITY
      );
      setValue("profilePic", base64, { shouldDirty: true });
      setPreview(base64);
    } catch {
      toast.error("Failed to crop image.");
    } finally {
      URL.revokeObjectURL(cropSrc);
      setCropSrc("");
      setCropOpen(false);
    }
  };

  const cancelCrop = () => {
    if (cropSrc) URL.revokeObjectURL(cropSrc);
    setCropSrc("");
    setCropOpen(false);
  };

  /* ---------------- Submit ---------------- */
  const onSubmit = (data) => {
    updateMutation.mutate({
      fullName: data.fullName,
      phone: data.phone || undefined,
      profilePic: data.profilePic || undefined,
      bio: data.bio || undefined,
      batchYear: data.batchYear ? parseInt(data.batchYear, 10) : undefined,
    });
  };

  const handleCancel = () => {
    reset();
    setEditing(false);
    setDragOver(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
          <p className="mt-2 text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Your Profile</h1>
          <p className="text-muted-foreground">
            Keep your information up to date.
          </p>
        </div>

        {!editing ? (
          <Button onClick={() => setEditing(true)} className="shadow-sm">
            <Edit className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button
              form="profile-form"
              type="submit"
              disabled={updateMutation.isPending || !isDirty}
              className="shadow-sm"
            >
              <Save className="h-4 w-4 mr-2" />
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
            <Button variant="outline" onClick={handleCancel}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </div>
        )}
      </div>

      {/* Main Card */}
      <Card className="border shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Visible to other alumni.</CardDescription>
        </CardHeader>

        <CardContent>
          {/* Avatar */}
          <div className="pb-6 border-b flex flex-col items-center">
            <div
              className={[
                "relative h-32 w-32 rounded-full overflow-hidden",
                "ring-2 ring-primary/20 shadow-sm transition-shadow",
                dragOver ? "ring-4 ring-primary/60 shadow-lg" : "",
              ].join(" ")}
              onDrop={onDrop}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              title={editing ? "Drag & drop a photo" : undefined}
            >
              <img
                src={
                  preview ||
                  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='128' height='128'><rect width='100%' height='100%' fill='%23f3f4f6'/></svg>"
                }
                alt="Profile"
                className="h-full w-full object-cover"
              />
            </div>

            {editing && (
              <div className="mt-3">
                <Button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="shadow-sm"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Change Photo
                </Button>
                <input
                  ref={fileInputRef}
                  id="profilePicInput"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={!editing}
                />
              </div>
            )}
          </div>

          {/* Form */}
          <form
            id="profile-form"
            onSubmit={handleSubmit(onSubmit)}
            className="pt-6 space-y-6"
          >
            <div className="grid gap-6 md:grid-cols-2">
              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  {...register("fullName", {
                    required: "Full name is required",
                  })}
                  disabled={!editing}
                />
                {errors.fullName && (
                  <p className="text-sm text-destructive">
                    {errors.fullName.message}
                  </p>
                )}
              </div>

              {/* Email (read-only) */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={profile?.email || ""}
                  disabled
                  className="bg-muted"
                />
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  inputMode="tel"
                  placeholder="10 digits or +91XXXXXXXXXX"
                  {...register("phone", {
                    onChange: onPhoneChange,
                    validate: (v) =>
                      !v ||
                      phonePattern.test(v) ||
                      "Use 10 digits or +91 followed by 10 digits",
                  })}
                  disabled={!editing}
                />
                {errors.phone && (
                  <p className="text-sm text-destructive">
                    {errors.phone.message}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Only digits. If adding a country code, it must be <b>+91</b>.
                </p>
              </div>

              {/* Batch Year */}
              <div className="space-y-2">
                <Label htmlFor="batchYear">Batch Year</Label>
                <Input
                  id="batchYear"
                  type="number"
                  placeholder="e.g., 2020"
                  {...register("batchYear", {
                    validate: (value) => {
                      if (!value) return true;
                      const n = parseInt(value, 10);
                      return (
                        n <= MAX_YEAR ||
                        `Batch year cannot be after ${MAX_YEAR}`
                      );
                    },
                  })}
                  disabled={!editing}
                />
                {errors.batchYear && (
                  <p className="text-sm text-destructive">
                    {errors.batchYear.message}
                  </p>
                )}
              </div>
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                rows={4}
                placeholder="Tell us about yourself..."
                {...register("bio")}
                disabled={!editing}
              />
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Cropper modal */}
      <Dialog
        open={cropOpen}
        onOpenChange={(o) => (o ? setCropOpen(true) : cancelCrop())}
      >
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Crop Photo</DialogTitle>
          </DialogHeader>

          <div className="relative h-80 w-full bg-muted rounded-md overflow-hidden">
            {cropSrc && (
              <Cropper
                image={cropSrc}
                crop={crop}
                zoom={zoom}
                rotation={rotation}
                aspect={1}
                onCropChange={setCrop}
                onRotationChange={setRotation}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
                cropShape="round"
                showGrid={false}
                restrictPosition
                objectFit="contain"
              />
            )}
          </div>

          {/* Controls */}
          <div className="space-y-4 pt-2">
            <div className="space-y-1">
              <Label htmlFor="zoom">Zoom</Label>
              <input
                id="zoom"
                type="range"
                min={1}
                max={3}
                step={0.01}
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="rotation">Rotation</Label>
              <input
                id="rotation"
                type="range"
                min={0}
                max={360}
                step={1}
                value={rotation}
                onChange={(e) => setRotation(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={cancelCrop}>
                Cancel
              </Button>
              <Button onClick={confirmCrop}>Use Photo</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Sticky save bar (mobile) */}
      {editing && (
        <div className="lg:hidden fixed bottom-0 inset-x-0 bg-background/80 backdrop-blur border-t p-3 flex gap-2 justify-end">
          <Button
            form="profile-form"
            type="submit"
            disabled={updateMutation.isPending || !isDirty}
          >
            <Save className="h-4 w-4 mr-2" />
            {updateMutation.isPending ? "Saving..." : "Save"}
          </Button>
          <Button variant="outline" onClick={handleCancel}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
}
