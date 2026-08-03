const mongoose = require("mongoose");

const festivalCampaignSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Campaign name is required"],
      trim: true,
    },
    banner: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      default: "",
    },
    offerText: {
      type: String,
      default: "",
    },
    couponCode: {
      type: String,
      default: "",
      trim: true,
      uppercase: true,
    },
    buttonText: {
      type: String,
      default: "Shop Now",
    },
    buttonUrl: {
      type: String,
      default: "",
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
      default: null,
    },
    enabled: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

festivalCampaignSchema.virtual("derivedStatus").get(function () {
  if (!this.enabled) return "draft";
  const now = new Date();
  if (this.startDate && this.startDate > now) return "scheduled";
  if (this.endDate && this.endDate < now) return "expired";
  return "active";
});

festivalCampaignSchema.set("toJSON", { virtuals: true });
festivalCampaignSchema.set("toObject", { virtuals: true });

const FestivalCampaign = mongoose.model("FestivalCampaign", festivalCampaignSchema);
module.exports = FestivalCampaign;
