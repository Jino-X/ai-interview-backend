const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, select: false },
    googleId: { type: String },
    avatar: { type: String },
    role: { type: String, enum: ['candidate', 'interviewer', 'admin'], default: 'candidate' },
    isEmailVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    bio: { type: String },
    skills: [{ type: String }],
    experience: { type: Number, default: 0 },
    resumeUrl: { type: String },
    resumeParsed: {
      skills: [String],
      education: [mongoose.Schema.Types.Mixed],
      experience: [mongoose.Schema.Types.Mixed],
      summary: String,
    },
    totalInterviews: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0 },
    refreshToken: { type: String, select: false },
    passwordResetToken: { type: String },
    passwordResetExpires: { type: Date },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.refreshToken;
  delete obj.passwordResetToken;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
