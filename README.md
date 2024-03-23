
Develop a game titled *Bidding War*.

## Game Mechanics

1. The bidding starts with 0 NRG and 60 minutes countdown.
2. Every next bid has to be higher than the previous one.
3. For each bid, the time extends for 10 minutes.
4. When the time runs out, the winner is the last bidder.
5. The reward is all the funds that were accumulated.

**Important:** _Each successful bid will take 5% commission in order to fund the game operations._

## Task

Your task is to write a smart contract in solidity and deploy it to `Energi Testnet`. Then, write
an API in golang or nodejs that communicates with the smart contract and

- serves endpoints for an external web app (you don't need to create a website)
- logs all events
- pays out the winners
- restarts the game when the timer has expired

Use the [Testnet Faucet](https://faucet.energi.network/) to get some test NRG.

- JSON RPC `https://nodeapi.test.energi.network/v1/jsonrpc`
- WebSockets `wss://nodeapi.test.energi.network/ws`




-----------------------------------------------------------------------------------------------------------------------------

## Solution By Gajendra Pal(error0180): 

## Refer to this doc for detailed game mechanics:
[Game Mechanics Doc](https://docs.google.com/document/d/1SaXMYNabUkwojN32nffYyaxlTfbYy3oUS3ggJnmW_VY/edit?usp=sharing)

## Deployed Contract Address : 
0x6DfFF22588BE9b3ef8cf0aD6Dc9B84796F9fB45f

## Contract Transactions:
[Contract Transactions](https://explorer.test.energi.network/address/0x6DfFF22588BE9b3ef8cf0aD6Dc9B84796F9fB45f/transactions)
