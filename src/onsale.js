import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import { useEffect, useState } from 'react'
import { Button, Card, Stack, Modal, InputGroup, FormControl   } from 'react-bootstrap'

export default function OnSale({ wallet, xcubeTokenContract, xcubeTokenAddress, saleNftTokenContract, saleNftTokenAddress, web3 }) {
  const [onSaleTokens, setOnSaleTokens] = useState([]);
  const [list, setList] = useState();
  const [orderId, setOrderId] = useState(0);
  const [nftPrice, setNftPrice] = useState(0);
  const [buyAmount, setBuyAmount] = useState(0);
  
  const [tokenURI, setTokenURI] = useState('');
  const [show, setShow] = useState(false);
  
  const handleClose = () => setShow(false)
  const handleShow = (orderId) => {
    setOrderId(orderId)
    setShow(true)
  }

  useEffect(() => {
    getList()
  }, [onSaleTokens]);

  const getOnSaleNFT = async () => {


    try {
      if (!wallet) return;
      if (!xcubeTokenContract) return;
      const response = await xcubeTokenContract.methods.getSaleOnWorks().call();
      console.log(response)
      setOnSaleTokens(response)
    } catch (error) {
      console.error(error);
    }

    
  };

  const fetchMetadata = async (ipfs) => {
    const response = await fetch('https://ipfs.io/ipfs/' + ipfs)
    if(!response.ok) {
      throw new Error(response.statusText);
    }

    const json = await response.json();

    console.log(json.image)
    if (json.image != undefined) {
      return json.image.replace('ipfs://', '')

    } else {
      return
    }

  }

  const getList = async () => {
    let sss = []
    if (onSaleTokens.length > 0) {
      for (var i = 0; i < onSaleTokens.length; i++) {
        
        let v = onSaleTokens[i]
        if (v.orderId === 0) return

        const work = await xcubeTokenContract.methods.getWorkInfos(v.workId).call();
        let ttt = await fetchMetadata(work.tokenURI.replace('ipfs://', ''))
        let imgURI = 'https://ipfs.io/ipfs/' + ttt
        console.log(imgURI)

        if(imgURI != undefined) {
          sss.push(
            <div className="bg-light border">
              <Card style={{ width: '18rem' }}>
                {/*https://ipfs.io/ipfs/QmSRf8Y2dVK7WbLVzJwLggnG5uxrFx1Fmz35HGatjUeVW5*/}
              <img
                src={imgURI}
                className='img-thumbnail'
                alt='...'
                style={{ maxWidth: '24rem' }}
              />
  
              <Card.Body>
                <Card.Title>seller : {v.seller}</Card.Title>
                <Card.Title>saleAmount : {v.saleAmount}</Card.Title>
                <Card.Title>salePrice : {web3.utils.fromWei(v.salePrice, "milliether")}</Card.Title>
                <Card.Text>
                orderId : {v.orderId}
                <br></br>
                </Card.Text>
                {wallet.toLowerCase() === v.seller.toLowerCase() ? null : <Button variant="primary" onClick={() => handleShow(v.orderId)}>buy</Button>} 
              </Card.Body>
              </Card>
          </div>
          )
        } 
      }
    }

    setList(sss)
  }

  const buyNft = async () => {
    try {
      //if (!wallet || !saleStatus) return;
      if (!wallet || !orderId || nftPrice < 0) return;
      console.log(orderId + ' / ' + web3.utils.toWei(nftPrice, "milliether"))

      
      const response = await saleNftTokenContract.methods
        .purchaseWork(
          orderId, buyAmount
        )
        .send({ from: wallet, value: web3.utils.toWei(nftPrice, "milliether") });

      if (response.status) {
        console.log(response)
        alert('success')
      }
      
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
      <Stack direction="horizontal" gap={3}>
        {list}
      </Stack>
      <Button onClick={getOnSaleNFT}>get OnSale</Button>
      
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>buy NFT</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <InputGroup className="mb-3">
            <InputGroup.Text>eth</InputGroup.Text>
            <FormControl aria-label="ehter" value={nftPrice} onChange={(e) => {setNftPrice(e.target.value)}}/>
          </InputGroup>
          <InputGroup className="mb-3">
            <InputGroup.Text>buyAmount</InputGroup.Text>
            <FormControl aria-label="ehter" value={buyAmount} onChange={(e) => {setBuyAmount(e.target.value)}}/>
          </InputGroup>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            close
          </Button>
          <Button variant="primary" onClick={buyNft}>
            buy
          </Button>
        </Modal.Footer>
      </Modal>

      </main>

    </div>
  )
}