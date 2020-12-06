import web3 from "./web3";
import CampaignFactory from "./build/CampaignFactory.json";

const instance = new web3.eth.Contract(
  JSON.parse(CampaignFactory.interface),
  "0x51Dd12A2b7A2E7793A04E103De83F2909Dba432a"
);

export default instance;
