pragma solidity ^0.4.17;

contract CampaignFactory {
    address[] public deployedCampaigns; // an array of addresses of all deployed campaigns

    // when you deploy a public varible it automatically generate a method to get the value. it is called as the same name as the varible.

    function createCampaign(uint256 minimun) public {
        address newCampaign = new Campaign(minimun, msg.sender); // this creates a new contract to the blockchain.
        deployedCampaigns.push(newCampaign);
    }

    // another gocha: when we use a contract to create a new contract the msg.sender in the below contract will be the contract address not the creator who created it. so we need to change it.
    function getDeployedCampaigns() public view returns (address[]) {
        // view menas no data inside the contract is modified by the function. public means anyone can call the function.
        return deployedCampaigns;
    }
}

contract Campaign {
    // create some varibles
    address public manager;
    uint256 public minimumContribution;
    // address[] public approvers;
    mapping(address => bool) public approvers;
    // create a request struct
    uint256 public approversCount;
    struct Request {
        //this is a struct definition and it is not a instance. It is a new type (definition)
        string description; // semi colon here be careful
        uint256 value;
        address recipient;
        bool complete;
        uint256 approvalCount;
        mapping(address => bool) approvals; // reference type does not need to be initialized. reference type is like object or array. value type is some primitive types like number etc
    }

    Request[] public requests;

    modifier restricted() {
        // put the modifier  above the constructor function.
        require(msg.sender == manager);
        _;
    }

    constructor(uint256 minimum, address creator) public {
        manager = creator;
        // msg.sender  is the creator of this contract and it is always available in any solidity contract
        minimumContribution = minimum;
    }

    function contribute() public payable {
        // here we set a requirement for the contract contribution: it must be over how much ETH value.
        require(msg.value > minimumContribution);

        // approvers.push(msg.sender);
        approvers[msg.sender] = true; // the approvers mapping does not store the address
        approversCount++;
    }

    function createRequest(
        string description,
        uint256 value,
        address recipient
    ) public restricted {
        // we make it callable for the extrenal account so we use "public". we also restrict it!
        // require(approvers[msg.sender]); // Although approvers does not store the address, it can check if the address exists or not very easily. that's why we use mapping instead of looping throught it. cose less gas
        Request memory newRequest = Request({ // left-side: storing the value -- we created a varible which belongs to type "Request" we defined beforehand. Right-side:create an instance of Request.
            description: description,
            value: value,
            recipient: recipient,
            complete: false, // when we carete a struct we have to define all of the data inside it to instantiate it. // we should use this way of key-value defining way to define a struct. do not use other easy ways, they can be confusing. // like this: Reqeust(description, value, recipient, false); // struct Request { bool ,bool, bool, bool}; if this is the case, we cannot know if anything went wrong when we change the sequence of the struct.
            approvalCount: 0
        });

        requests.push(newRequest);
    }

    function approveRequest(uint256 index) public {
        Request storage request = requests[index];

        require(approvers[msg.sender]); // if he is a approver it will be true,
        require(!request.approvals[msg.sender]); // if the user has already voted then here his address will be put into the approvals and it is true, then use !true

        request.approvals[msg.sender] = true;
        request.approvalCount++;
    }

    function finalizeRequest(uint256 index) public restricted {
        Request storage request = requests[index];

        require(request.approvalCount > (approversCount / 2));
        require(!request.complete);
        request.recipient.transfer(request.value);
        request.complete = true;
    }
}
