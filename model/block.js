const mongoose = require("mongoose");
//difining the schma of the block
const blockNumberSchema = new mongoose.Schema({
  blocknumber: { type: Number },
});

const Block = mongoose.model("block", blockNumberSchema);
module.exports = Block;
