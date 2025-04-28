import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['percentage', 'fixed'],
    required: true
  },
  value: {
    type: Number,
    required: true,
    min: 0
  },
  minPurchase: {
    type: Number,
    default: 0
  },
  maxDiscount: {
    type: Number,
    default: null
  },
  validFrom: {
    type: Date,
    default: Date.now
  },
  validUntil: {
    type: Date,
    required: true
  },
  usageLimit: {
    type: Number,
    default: null
  },
  usageCount: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  applicableTours: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tour'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Method to check if coupon is valid
couponSchema.methods.isValid = function() {
  const now = new Date();
  return (
    this.isActive &&
    now >= this.validFrom &&
    now <= this.validUntil &&
    (this.usageLimit === null || this.usageCount < this.usageLimit)
  );
};

// Method to calculate discount amount
couponSchema.methods.calculateDiscount = function(subtotal) {
  if (!this.isValid() || subtotal < this.minPurchase) {
    return 0;
  }

  let discount = 0;
  if (this.type === 'percentage') {
    discount = subtotal * (this.value / 100);
    if (this.maxDiscount !== null && discount > this.maxDiscount) {
      discount = this.maxDiscount;
    }
  } else if (this.type === 'fixed') {
    discount = this.value;
  }

  return discount;
};

const Coupon = mongoose.model('Coupon', couponSchema);

export default Coupon;
