const { ethers } = require("ethers");
//Block schema from block.js
const Block = require("./model/block");
//Address schema from address.js
const Address = require("./model/address");
const { default: axios } = require("axios");
//Alchemy API key
const apiKey =
  "https://eth-goerli.g.alchemy.com/v2/NkmRnh8V2iHm99YDqMc7a51JpySUdkHD";
//connecting to the provider
const provider = new ethers.providers.JsonRpcProvider(apiKey);

//event listner which listens to the event block, which is emitted when a new block is mined on the chain.
provider.on("block", (blockNumber) => {
  console.log("new block added");
  console.log(blockNumber);
  updateBlocks(blockNumber);
});

//function to send notification to slack Webhooks are used
async function sendNotificationtoSlack(transactionObject) {
  //Formating of the message to be send to slack
  const slackMessage = {
    blocks: [
      {
        type: "section",
        text: {
          type: "plain_text",
          text: "A transaction has been performed by one of your watched addresses",
          emoji: true,
        },
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*Transaction from:* ${transactionObject.from} , *Transaction to: * ${transactionObject.to}, and <https://goerli.etherscan.io/tx/${transactionObject.transactionHash}|Link to transaction>`,
        },
      },
    ],
  };
  const slackWebhook =
    "https://hooks.slack.com/services/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";
  try {
    //sending message to the slack
    await axios.post(slackWebhook, slackMessage);
    console.log("Notifications successfully send");
  } catch (error) {
    console.log("notifications unsuccessfull");
    console.log(error);
  }
}
//Checking to see if there are any transaction of the watched address in the newly added block.
//if there transaction is present add it to the back end.
async function checkWatchaddressesTransactions(transactions) {
  //getting address which we have added to watch.
  const watchedAddresses = await Address.find({});
  for (let i = 0; i < watchedAddresses.length; i++) {
    transactions.filter(async function (currenttransaction) {
      //if transaction found in the new block.
      if (currenttransaction.from === watchedAddresses[i].address) {
        console.log("transaction found");
        //getting receipt of thr transaction.
        const transactionReceipt = await provider.getTransactionReceipt(
          currenttransaction.hash
        );
        //checking status of the transaction if status 1 transation is successfull, 0 transaction unsuccessfull.
        if (transactionReceipt.status == 1) {
          console.log("found successfull transaction");
          let type;
          //checking the type of transaction.
          if (transactionReceipt.logs.length === 0) {
            type = "Normal transaction";
          } else {
            type = "ERC-20";
          }
          //creating a transaction object to add to database.
          const transactionObject = {
            transactionType: type,
            from: currenttransaction.from,
            to: currenttransaction.to,
            transactionHash: currenttransaction.hash,
          };
          //sending notification to slack
          sendNotificationtoSlack(transactionObject);
          //finding the address in the database and updating its transaction property.
          await Address.findOneAndUpdate(
            { address: watchedAddresses[i].address },
            { $push: { transaction: transactionObject } }
          );
        } else {
          console.log("Failed transaction");
        }
      }
    });
  }
}

//main function which runs periodically check for new block.
async function updateBlocks(number) {
  const transactions = await getBlocktransactions(number);
  checkWatchaddressesTransactions(transactions);
}
//getting the transactions of the of the newly added block through blocknumber.
async function getBlocktransactions(number) {
  const transactions = await provider.getBlockWithTransactions(number);
  return transactions.transactions;
}

module.exports = {
  getBlocktransactions,
  checkWatchaddressesTransactions,
  updateBlocks,
};
