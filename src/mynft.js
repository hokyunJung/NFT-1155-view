import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import { useEffect, useState } from 'react'
import { Button, Card, Stack, Modal, InputGroup, FormControl   } from 'react-bootstrap'

export default function MyNft({ wallet, xcubeTokenContract, xcubeTokenAddress, saleNftTokenContract, saleNftTokenAddress, web3 }) {
  const [myNftTokens, setMyNftTokens] = useState([]);
  const [list, setList] = useState();
  const [workId, setWorkId] = useState(0);
  const [nftPrice, setNftPrice] = useState(0);
  const [salePrice, setSalePrice] = useState(0);
  const [saleAmount, setSaleAmount] = useState(0);
  const [show, setShow] = useState(false);
  const [isApprove, setIsApprove] = useState(false);

  const handleClose = () => setShow(false)
  const handleShow = (workId) => {
    setWorkId(workId)
    setShow(true)
  }

  const getIsApprovedForAll = async () => {
    try {
      const response = await xcubeTokenContract.methods
        .isApprovedForAll(wallet, saleNftTokenAddress)
        .call();

      console.log(response)
      setIsApprove(response)
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getList()
  }, [myNftTokens, isApprove]);

  const getNFTTokens = async () => {
    try {
      if (!wallet) return;
      if (!xcubeTokenContract) return;
      
      //const balanceLength = await xcubeTokenContract.methods.balanceOf(wallet).call();
      //console.log(balanceLength)

      //if (balanceLength === "0") return;
      //console.log(wallet)
      
      const result = await xcubeTokenContract.methods.getWorkOfOwner(wallet).call();
      //const result = await xcubeTokenContract.methods.getSaleOnNfts().call();
      console.log(result)
       
      setMyNftTokens(result)
      
    } catch (error) {
      console.error(error);
    }

    
  };

  const setIsApprovedForAll = async () => {
    try {
      if (!wallet) return;

      const response = await xcubeTokenContract.methods
        .setApprovalForAll(saleNftTokenAddress, !isApprove)
        .send({ from: wallet });
      
      setIsApprove(!isApprove)
    } catch (error) {
      console.error(error);
    }
  };

  const fetchMetadata = async (ipfs) => {
    //const response = await fetch('https://ipfs.io/ipfs/' + ipfs)
    const response = await fetch('https://gateway.pinata.cloud/ipfs/' + ipfs)
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
    if (myNftTokens.length > 0) {
      for (var i = 0; i < myNftTokens.length; i++) {
        
        let v = myNftTokens[i]
        if (v.workId === 0) return

      const work = await xcubeTokenContract.methods.getWorkInfos(v.workId).call();
      console.log(work)

        let ttt = await fetchMetadata(work.tokenURI.replace('ipfs://', ''))
        //let imgURI = 'https://ipfs.io/ipfs/' + ttt
        let imgURI = 'https://gateway.pinata.cloud/ipfs/' + ttt
        
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
                <Card.Title>category : {work.category}</Card.Title>
                <Card.Title>creater : {work.creater}</Card.Title>
                <Card.Title>subject : {work.subject}</Card.Title>
                <Card.Title>total : {work.totalAmount}</Card.Title>
                <Card.Title>owner : {v.owner}</Card.Title>
                <Card.Title>currentHaveAmount : {v.currentHaveAmount}</Card.Title>
                <Card.Title>currentPrice : {web3.utils.fromWei(v.currentPrice, "milliether")}</Card.Title>
                <Card.Text>
                {work.tokenURI}
                </Card.Text>
                {isApprove ? <Button variant="primary" onClick={() => handleShow(v.workId)}>sall</Button> : null}
                
              </Card.Body>
              </Card>
          </div>
          )
        } 
      }
    }

    setList(sss)
  }

  const sellNft = async () => {
    try {
      //if (!wallet || !saleStatus) return;
      if (!wallet || !workId || saleAmount < 0 || salePrice < 0) return;
      
      const response = await saleNftTokenContract.methods
        .setForSaleWork(
          workId, saleAmount,
          web3.utils.toWei(salePrice, "milliether")
        )
        .send({ from: wallet });

      if (response.status) {
        console.log(response)
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
      <Button onClick={getNFTTokens}>get MyNfts</Button>
      <br></br>
      <Button onClick={getIsApprovedForAll}>isApproval</Button>
      <br></br>
      <Button onClick={setIsApprovedForAll}>toggleApproval</Button>

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>sale NFT</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <InputGroup className="mb-3">
            <InputGroup.Text>saleAmount</InputGroup.Text>
            <FormControl aria-label="saleAmount" value={saleAmount} onChange={(e) => {setSaleAmount(e.target.value)}}/>
          </InputGroup>
          <InputGroup className="mb-3">
            <InputGroup.Text>salePrice</InputGroup.Text>
            <FormControl aria-label="milliether" value={salePrice} onChange={(e) => {setSalePrice(e.target.value)}}/>
          </InputGroup>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            close
          </Button>
          <Button variant="primary" onClick={sellNft}>
            sall
          </Button>
        </Modal.Footer>
      </Modal>

      </main>

    </div>
  )
}
