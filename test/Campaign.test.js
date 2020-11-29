const assert = require("assert");
const ganache = require("ganache-cli");
const Web3 = require("Web3");
const web3 = new Web3(ganache.provider()); // instance of Web3

const compiledFactory = require("../ethereum/build/CampaignFactory.json");
const compiledCampaign = require("../ethereum/build/Campaign.json");
const { accessSync } = require("fs");

let accounts; // the accounts we use
let factory; // the factory contract
let campaignAddress; // the campaignAddress we gonna save into
let campaign; // the campaign

beforeEach(async () => {
  accounts = await web3.eth.getAccounts();

  factory = await new web3.eth.Contract(JSON.parse(compiledFactory.interface))
    .deploy({ data: compiledFactory.bytecode })
    .send({ from: accounts[0], gas: "1000000" });

  await factory.methods.createCampaign("100").send({
    from: accounts[0],
    gas: "1000000",
  }); // wei. trying to create a new contract.

  [campaignAddress] = await factory.methods.getDeployedCampaigns().call(); // using call() with the view function // this means we take the first element of the array to this varible
  //   compaignAddresses = address[0];
  // we are going to create a representation of the contract in the JS world.
  campaign = await new web3.eth.Contract(
    JSON.parse(compiledCampaign.interface),
    campaignAddress // this is different from the above way to deploy the contract. cuz this is a existing contract.
  );
});

describe("Campaigns", () => {
  it("deployes a factory of a campaign", () => {
    assert.ok(factory.options.address);
    assert.ok(campaign.options.address);
  });
});
