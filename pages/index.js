import React, { Component } from "react";
import factory from "../ethereum/factory";

class CampaignIndex extends Component {
  async componentDidMount() {
    const campaign = await factory.methods.getDeployedCampaigns().call();
    console.log(campaigns);
  }

  // next top: whenever the next import a file here, it is supposed to have a react component
  render() {
    return <div> Campaigns Index! </div>;
  }
}

export default CampaignIndex;
