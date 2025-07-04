// const mongoose = require("mongoose");

// const timeSlotSchema = new mongoose.Schema({
//   day: {
//     type: String,
//     required: true,
//     enum: [
//       "MONDAY",
//       "TUESDAY",
//       "WEDNESDAY",
//       "THURSDAY",
//       "FRIDAY",
//       "SATURDAY",
//       "SUNDAY",
//       "ALL_DAYS",
//     ],
//   },
//   startTime: { type: String, required: true },
//   endTime: { type: String, required: true },
// });

// const facultySchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   room: { type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true },
//   availability: [timeSlotSchema],
//   createdAt: { type: Date, default: Date.now },
//   updatedAt: { type: Date, default: Date.now },
// });

// module.exports = mongoose.model("Faculty", facultySchema);
const mongoose = require("mongoose");

const timeSlotSchema = new mongoose.Schema({
  day: {
    type: String,
    required: true,
    enum: [
      "MONDAY",
      "TUESDAY",
      "WEDNESDAY",
      "THURSDAY",
      "FRIDAY",
      "SATURDAY",
      "SUNDAY",
      "ALL_DAYS",
    ],
  },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
});

const facultySchema = new mongoose.Schema({
  facultyId: {
    type: String,
    required: true,
    unique: true,
    default: () => `FAC_${Date.now()}_${Math.floor(Math.random() * 1000)}`, 
  },
  name: { type: String, required: true, unique: true },
  room: { type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true },
  availability: [timeSlotSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Faculty", facultySchema);
