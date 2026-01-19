export const NFT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
export const MARKETPLACE_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

export const NFT_ABI = [
  "function mint(string uri) returns (uint256)",
  "function tokenCount() view returns (uint256)",
  "function ownerOf(uint256) view returns (address)",
  "function tokenURI(uint256) view returns (string)",
  "function approve(address,uint256)"
];

export const MARKETPLACE_ABI = [
  "function listItem(address nft,uint256 tokenId,uint256 price)",
  "function buyItem(uint256 index) payable",
  "function cancelListing(uint256 index)",
  "function updatePrice(uint256 index,uint256 newPrice)",
  "function getSales() view returns (tuple(address seller,address buyer,address nft,uint256 tokenId,uint256 price,uint256 timestamp)[])",
  "function getAllListings() view returns (tuple(address seller,uint256 price,address nft,uint256 tokenId)[])",
  "function isSold(address nft,uint256 tokenId) view returns (bool)"
];