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

  it("marks caller as the campaign manager", async () => {
    const manager = await campaign.methods.manager().call();

    assert.equal(accounts[0], manager);
  });

  it("alows people to contribute money, and marks them as approvers.", async () => {
    await campaign.methods.contribute().send({
      value: 200,
      from: accounts[1],
    });
    const isContributor = await campaign.methods.approvers(accounts[1]).call(); // use the approvers function in the contract
    assert(isContributor);
  });

  it("requires a minimum contribution", async () => {
    try {
      await campaign.methods.contribute().send({
        value: "5",
        from: accounts[1],
      });
      assert(false);
    } catch (err) {
      assert(err);
    }
  });

  it("allows a manager to make a payment request", async () => {
    await campaign.methods
      .createRequest("Buy Batteries", "100", accounts[1])
      .send({ from: accounts[0], gas: "1000000" });
    const request = await campaign.methods.requests(0).call();
    assert.equal("Buy Batteries", request.description);
  });

  it("processes the request", async () => {
    await campaign.methods.contribute().send({
      from: accounts[0],
      value: web3.utils.toWei("10", "ether"),
    });
    await campaign.methods
      .createRequest("A", web3.utils.toWei("5", "ether"), accounts[1])
      .send({
        from: accounts[0],
        gas: "1000000",
      });
    await campaign.methods.approveRequest(0).send({
      from: accounts[0],
      gas: "1000000",
    });

    await campaign.methods.finalizeRequest(0).send({
      from: accounts[0],
      gas: "1000000",
    });
    let balance = await web3.eth.getBalance(accounts[1]);
    balance = web3.utils.fromWei(balance, "ether");
    balance = parseFloat(balance); // change string into a decimal num
    console.log(balance);
    assert(balance > 104);
  });
});
