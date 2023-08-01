const mongoose = require("mongoose");
//difining the schma of the address
const addressWatchSchema = new mongoose.Schema({
  address: { type: String },
  transaction: { type: [] },
});

const Address = mongoose.model("address", addressWatchSchema);
module.exports = Address;
