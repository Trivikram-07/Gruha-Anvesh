const mongoose = require('mongoose');

const banditStatsSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  rent: { avg: { type: Number, default: 0 }, count: { type: Number, default: 0 } },
  size: { avg: { type: Number, default: 0 }, count: { type: Number, default: 0 } },
  location: {
    cities: { type: Map, of: { successes: Number, trials: Number }, default: () => new Map() },
    states: { type: Map, of: { successes: Number, trials: Number }, default: () => new Map() },
  },
  amenities: {
    specific: { type: Map, of: { successes: Number, trials: Number }, default: () => new Map() },
  },
  type: {
    pg: { successes: { type: Number, default: 0 }, trials: { type: Number, default: 0 } },
    bhk: { successes: { type: Number, default: 0 }, trials: { type: Number, default: 0 } },
    vacation: { successes: { type: Number, default: 0 }, trials: { type: Number, default: 0 } },
  },
});

module.exports = mongoose.model('BanditStats', banditStatsSchema);