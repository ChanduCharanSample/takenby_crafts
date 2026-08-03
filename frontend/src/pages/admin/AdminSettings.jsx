import React, { useState } from "react";
import { contentService } from "../../services";
import { getMessage } from "../../services/api";
import { getImageUrl } from "../../utils/helpers";
import { useToast } from "../../context/ToastContext";
import { useContent } from "../../context/ContentContext";

const AdminSettings = () => {
  const { settings, refresh } = useContent();
  const { showToast } = useToast();
  const [form, setForm] = useState({
    websiteName: settings?.websiteName || "TakenBy_Crafts",
    tagline: settings?.tagline || "",
    primaryColor: settings?.primaryColor || "#c77b5a",
    accentColor: settings?.accentColor || "#8a9a7b",
    font: settings?.font || "",
    phone: settings?.phone || "",
    whatsapp: settings?.whatsapp || "",
    email: settings?.email || "",
    instagramUsername: settings?.instagramUsername || "",
    addressStreet: settings?.address?.street || "",
    addressCity: settings?.address?.city || "",
    addressState: settings?.address?.state || "",
    addressPincode: settings?.address?.pincode || "",
    mapsEmbed: settings?.mapsEmbed || "",
    deliveryCharges: settings?.deliveryCharges ?? 40,
    freeDeliveryLimit: settings?.freeDeliveryLimit ?? 999,
    upiId: settings?.upiId || "",
    upiName: settings?.upiName || "",
    businessHours: settings?.businessHours || "",
    ownerName: settings?.ownerName || "",
    about: settings?.about || "",
    copyrightText: settings?.copyrightText || "",
  });
  const [logoFile, setLogoFile] = useState(null);
  const [faviconFile, setFaviconFile] = useState(null);
  const [qrFile, setQrFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      const payload = {
        websiteName: form.websiteName,
        tagline: form.tagline,
        primaryColor: form.primaryColor,
        accentColor: form.accentColor,
        font: form.font,
        phone: form.phone,
        whatsapp: form.whatsapp,
        email: form.email,
        instagramUsername: form.instagramUsername,
        address: {
          street: form.addressStreet,
          city: form.addressCity,
          state: form.addressState,
          pincode: form.addressPincode,
        },
        mapsEmbed: form.mapsEmbed,
        deliveryCharges: Number(form.deliveryCharges) || 0,
        freeDeliveryLimit: Number(form.freeDeliveryLimit) || 0,
        upiId: form.upiId,
        upiName: form.upiName,
        businessHours: form.businessHours,
        ownerName: form.ownerName,
        about: form.about,
        copyrightText: form.copyrightText,
      };
      fd.append("data", JSON.stringify(payload));
      if (logoFile) fd.append("logo", logoFile);
      if (faviconFile) fd.append("favicon", faviconFile);
      if (qrFile) fd.append("qrCode", qrFile);
      await contentService.updateSettings(fd);
      await refresh();
      showToast("Settings saved", "success");
    } catch (err) {
      showToast(getMessage(err, "Could not save settings"), "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="dash-content">
      <h1>Store Settings</h1>
      <p className="dash-sub">Branding, contact and payment preferences.</p>

      <form onSubmit={handleSubmit}>
        <div className="dash-panel">
          <h3>Branding</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Website Name *</label>
              <input value={form.websiteName} onChange={(e) => set("websiteName", e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Tagline</label>
              <input value={form.tagline} onChange={(e) => set("tagline", e.target.value)} />
            </div>
            <div className="form-group">
              <label>Primary Color</label>
              <input type="color" value={form.primaryColor} onChange={(e) => set("primaryColor", e.target.value)} />
            </div>
            <div className="form-group">
              <label>Accent Color</label>
              <input type="color" value={form.accentColor} onChange={(e) => set("accentColor", e.target.value)} />
            </div>
            <div className="form-group">
              <label>Font</label>
              <input value={form.font} onChange={(e) => set("font", e.target.value)} placeholder="e.g. Playfair Display + Jost" />
            </div>
            <div className="form-group">
              <label>Owner Name</label>
              <input value={form.ownerName} onChange={(e) => set("ownerName", e.target.value)} />
            </div>
            <div className="form-group">
              <label>Logo</label>
              {settings?.logo && <img src={getImageUrl(settings.logo)} alt="Logo" className="form-image-preview small" />}
              <label className="file-upload-btn">
                {logoFile ? "Change Logo" : "Upload Logo"}
                <input type="file" accept="image/*" hidden onChange={(e) => setLogoFile(e.target.files[0])} />
              </label>
            </div>
            <div className="form-group">
              <label>Favicon</label>
              <label className="file-upload-btn">
                {faviconFile ? "Change Favicon" : "Upload Favicon"}
                <input type="file" accept="image/*" hidden onChange={(e) => setFaviconFile(e.target.files[0])} />
              </label>
            </div>
          </div>
        </div>

        <div className="dash-panel">
          <h3>Contact & Social</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Phone</label>
              <input value={form.phone} onChange={(e) => set("phone", e.target.value)} />
            </div>
            <div className="form-group">
              <label>WhatsApp Number (digits only)</label>
              <input value={form.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} placeholder="919876543210" />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input value={form.email} onChange={(e) => set("email", e.target.value)} />
            </div>
            <div className="form-group">
              <label>Instagram Username</label>
              <input value={form.instagramUsername} onChange={(e) => set("instagramUsername", e.target.value)} />
            </div>
            <div className="form-group">
              <label>Street / Area</label>
              <input value={form.addressStreet} onChange={(e) => set("addressStreet", e.target.value)} />
            </div>
            <div className="form-group">
              <label>City</label>
              <input value={form.addressCity} onChange={(e) => set("addressCity", e.target.value)} />
            </div>
            <div className="form-group">
              <label>State</label>
              <input value={form.addressState} onChange={(e) => set("addressState", e.target.value)} />
            </div>
            <div className="form-group">
              <label>Pincode</label>
              <input value={form.addressPincode} onChange={(e) => set("addressPincode", e.target.value)} />
            </div>
            <div className="form-group full">
              <label>Maps Embed URL</label>
              <input value={form.mapsEmbed} onChange={(e) => set("mapsEmbed", e.target.value)} />
            </div>
            <div className="form-group">
              <label>Business Hours</label>
              <input value={form.businessHours} onChange={(e) => set("businessHours", e.target.value)} />
            </div>
            <div className="form-group full">
              <label>About (short)</label>
              <textarea rows="3" value={form.about} onChange={(e) => set("about", e.target.value)} />
            </div>
            <div className="form-group">
              <label>Copyright Text</label>
              <input value={form.copyrightText} onChange={(e) => set("copyrightText", e.target.value)} />
            </div>
          </div>
        </div>

        <div className="dash-panel">
          <h3>Payments & Delivery</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Delivery Charges (₹)</label>
              <input type="number" min="0" value={form.deliveryCharges} onChange={(e) => set("deliveryCharges", e.target.value)} />
            </div>
            <div className="form-group">
              <label>Free Delivery Above (₹)</label>
              <input type="number" min="0" value={form.freeDeliveryLimit} onChange={(e) => set("freeDeliveryLimit", e.target.value)} />
            </div>
            <div className="form-group">
              <label>UPI ID</label>
              <input value={form.upiId} onChange={(e) => set("upiId", e.target.value)} placeholder="takenbycrafts@upi" />
            </div>
            <div className="form-group">
              <label>UPI Display Name</label>
              <input value={form.upiName} onChange={(e) => set("upiName", e.target.value)} />
            </div>
            <div className="form-group full">
              <label>UPI QR Code</label>
              {settings?.qrCode && <img src={getImageUrl(settings.qrCode)} alt="QR" className="form-image-preview small" />}
              <label className="file-upload-btn">
                {qrFile ? "Change QR" : "Upload QR Code"}
                <input type="file" accept="image/*" hidden onChange={(e) => setQrFile(e.target.files[0])} />
              </label>
            </div>
          </div>
        </div>

        <div className="dash-actions">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminSettings;
