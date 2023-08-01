// importing user context
const express = require("express");
const Address = require("./address");
const router = express.Router();
const {
  getBlocktransactions,
  checkWatchaddressesTransactions,
  getlatestBlocknumber,
} = require("../functions");

//function to check if the address already exist in the database or not
async function checkDatabaseifexists(address) {
  const existingAddress = await Address.findOne({ address: address });
  if (existingAddress) {
    return true;
  } else {
    return false;
  }
}
// Api to add address to the database
router.post("/add", async (req, res) => {
  const { address } = req.body;
  const check = await checkDatabaseifexists(address);
  if (!check) {
    let Addressobject = {
      address: address,
      transaction: [],
    };

    const newAddress = new Address(Addressobject);
    await newAddress.save();
    res.status(200).send({ message: "Success" });
  } else {
    res.status(400).send({ message: "Address already exists" });
    //getlatestBlocknumber();
    //getBlocktransactions();
    //checkWatchaddressesTransactions();
  }
});
//Api to get address transactions from the database
router.get("/get", async (req, res) => {
  const { address } = req.body;
  const check = await checkDatabaseifexists(address);
  if (check) {
    const addressTransactions = await Address.findOne({ address: address });
    res.status(200).send({ message: addressTransactions });
  } else {
    res
      .status(400)
      .send({ message: "Address does not exists in the watch list" });
  }
});
module.exports = router;
