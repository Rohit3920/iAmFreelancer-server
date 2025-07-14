const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const addressSchema = new mongoose.Schema({
    street: { type: String },
    city: { type: String },
    state: { type: String },
    zipCode: { type: String },
    country: { type: String },
    addressType: {
        type: String,
        enum: ['Permanent', 'Current']
    }
});

const basicSchema = new mongoose.Schema({
    dob: { type: Date },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other']
    },
    language: [{ type: String }],
    contactNo: { type: String },
});

const DomainSchema = new mongoose.Schema({
    description: {
        type: String,
        trim: true,
        maxlength: 1000
    },
    freelancerDomain: { type: String },
    domainExperience: { type: Number },
    technologies: [{ type: String }],
});

const educationSchema = new mongoose.Schema({
    institutionName: { type: String, required: true },
    degree: { type: String, required: true },
    fieldOfStudy: { type: String },
    // startDate: { type: Date },
    // endDate: { type: Date },
    graduationYear: { type: Date },
    percentage: { type: Number, min: 0, max: 100 },
    description: { type: String, maxlength: 500 },
});

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
    },
    profilePicture: {
        type: String,
        default: 'https://jrursuvjlrsjqmaqizto.supabase.co/storage/v1/object/public/freelancer//noavatar-image.jpg',
    },
    userRole: {
        type: String,
        enum: ['user', 'admin', 'freelancer'],
        default: 'user',
    },

    address: [addressSchema],
    basic: [basicSchema],
    DomainDetail: [DomainSchema],
    education: [educationSchema],

    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);