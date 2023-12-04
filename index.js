import { createPublicClient, createWalletClient, http, parseGwei } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { shibarium } from 'viem/chains'
import { wallet } from './wallet.js'

const maxGasPrice = '200' // gas price上限
const txCount = 10 // 一次打几笔交易
const frequency = 2000 // 几秒跑一次，1000是一秒

const pubClient = createPublicClient({
  chain: shibarium,
  transport: http(),
})

const client = createWalletClient({
  chain: shibarium,
  transport: http(),
})

const main = async () => {
  let gasPrice = await pubClient.getGasPrice()
  if (gasPrice > parseGwei(maxGasPrice)) { // gas price限制
    console.log('Gas Price too high.')
    return
  }
  wallet.forEach(async v => {
    let privateKey = v
    if(!v.startsWith('0x')) privateKey = `0x${privateKey}`
    const account = privateKeyToAccount(privateKey)
    const address = account.address
    const nonce = await pubClient.getTransactionCount({address})
    for(let i = 0; i < txCount; ++i){
      client.sendTransaction({
        account,
        to: address,
        gas: 22008,
        maxFeePerGas: parseGwei(maxGasPrice),
        data: '0x646174613a2c7b2270223a227372632d3230222c226f70223a226d696e74222c227469636b223a2273686962222c22616d74223a223130303030303030227d',
        value: 0,
        nonce: nonce + i
      })
    }
  })
}

setInterval(main, frequency)

process
  .on('unhandledRejection', (reason, p) => {
    console.error(reason, 'Unhandled Rejection at Promise', p)
  })
  .on('uncaughtException', err => {
    console.error(err, 'Uncaught Exception thrown')
  })