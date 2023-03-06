import React, { useState, useEffect } from 'react';
import * as nearAPI from 'near-api-js'

import './coin.css';
import './Main.scss';

// menu bar
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

import { Grid } from '@mui/material';
import { styled } from '@mui/material';

//slider
import Slider from '@mui/material/Slider';
import Tooltip from '@mui/material/Tooltip';
import PropTypes from 'prop-types';
import Stack from '@mui/material/Stack';

import FundModal from '../components/FundModal';
// snack bar
import Snackbar from '@mui/material/Snackbar';
import Slide from '@mui/material/Slide';
import MuiAlert from '@mui/material/Alert';

const { connect, Contract, keyStores, WalletConnection, utils } = nearAPI

import BigNumber from "bignumber.js";

import LoadingPad from '../components/LoadingPad'

const keyStore = new keyStores.BrowserLocalStorageKeyStore();

// const { connect } = nearAPI;

// const nearConfig = {
//     networkId: "mainnet",
//     keyStore,
//     contractName: 'contract-pdm.near',
//     nodeUrl: "https://rpc.mainnet.near.org",
//     walletUrl: "https://wallet.mainnet.near.org",
//     helperUrl: "https://helper.mainnet.near.org",
//     explorerUrl: "https://explorer.mainnet.near.org",
// };

const nearConfig = {
    networkId: "testnet",
    keyStore,
    contractName: 'dev-1652716876842-12734766244364',
    nodeUrl: "https://rpc.testnet.near.org",
    walletUrl: "https://wallet.testnet.near.org",
    helperUrl: "https://helper.testnet.near.org",
    explorerUrl: "https://explorer.testnet.near.org",
};

function TransitionDown(props) {
    return <Slide {...props} direction="down" />;
}

const Alert = React.forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

function ValueLabelComponent(props) {
    const { children, value } = props;

    return (
        <Tooltip enterTouchDelay={0} placement="top" title={value}>
            {children}
        </Tooltip>
    );
}

ValueLabelComponent.propTypes = {
    children: PropTypes.element.isRequired,
    value: PropTypes.number.isRequired,
};


const PrettoSlider = styled(Slider)({
    color: '#F4900C',
    height: 8,
    '& .MuiSlider-track': {
        border: 'none',
    },
    '& .MuiSlider-thumb': {
        height: 24,
        width: 24,
        backgroundColor: '#F4900C',
        border: '2px solid #E3900C',
        '&:focus, &:hover, &.Mui-active, &.Mui-focusVisible': {
            boxShadow: 'inherit',
        },
        '&:before': {
            display: 'none',
        },
    },
    '& .MuiSlider-valueLabel': {
        lineHeight: 1.2,
        fontSize: 12,
        background: 'unset',
        padding: 0,
        width: 32,
        height: 32,
        borderRadius: '50% 50% 50% 0',
        backgroundColor: '#F4900C',
        transformOrigin: 'bottom left',
        transform: 'translate(50%, -100%) rotate(-45deg) scale(0)',
        '&:before': { display: 'none' },
        '&.MuiSlider-valueLabelOpen': {
            transform: 'translate(50%, -100%) rotate(-45deg) scale(1)',
        },
        '& > *': {
            transform: 'rotate(45deg)',
        },
    },
});

const Item = styled(Paper)(({ theme }) => ({
    // backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
    // ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.secondary,
    background: 'transparent',
    boxShadow: 'none'
}));

let wallet, near

const Main = () => {
    const [playVal, setPlayVal] = useState('0.1')
    const [side, setSide] = useState('heads')
    const [fundType, setFundType] = useState('')
    const [open, setOpen] = useState(false);
    const [history, setHistory] = useState([])
    const [times, setTimes] = useState([])

    // snack
    const [snackOpen, setSnackOpen] = useState(false)
    const [transition, setTransition] = React.useState(undefined);
    const vertical = 'top'
    const horizontal = 'center'
    const [alert, setAlert] = useState({ type: '', message: '' })
    // web3 state val
    const [accountId, setAccountId] = useState(localStorage.getItem('account') || '')
    const [contract, setContract] = useState()
    // const [wallet, setWallet] = useState()
    const [connectBtnCaption, setConnectionBtnCaption] = useState('Connect Wallet')
    const [bettable, setBettable] = useState('0')
    const [userBalance, setUserBalance] = useState(0)
    const [walletBalance, setWalletBalance] = useState('0')
    const [loading, setLoading] = useState(false)

    let victorySound = new Audio('/assets/musics/sounds_victory.ogg')
    let lostSound = new Audio('/assets/musics/sounds_loose.mp3')

    const handleOpen = (type, Transition) => {
        if (connectBtnCaption === 'Connect Wallet') {
            // alert('Connect wallet!')
            setAlert({ type: 'warning', message: "Your wallet are not connected!" })
            setTransition(() => Transition);
            setSnackOpen(true);
            return
        }
        setOpen(true)
        setFundType(type)
    }
    const handleClose = () => setOpen(false);

    const onClickSide = (type) => {
        setSide(type)
    }

    const handleSliderChange = (event, newValue) => {
        setPlayVal(newValue);
    };

    const setSpecialVal = (newValue) => {
        setPlayVal(newValue)
    }

    const getPreciseValue = val => {
        if (BigNumber(val).isGreaterThan(BigNumber(BigNumber(val).toFixed(0)))) {
            return BigNumber(val).toFixed(0)
        } else {
            return BigNumber(val).minus(BigNumber(1)).toFixed(0)
        }
    }

    const initContract = async () => {
        // Initialize connection to the NEAR testnet
        near = await connect(nearConfig)

        const account = new nearAPI.Account(near.connection, nearConfig.contractName);
        const readableContract = await new Contract(account, nearConfig.contractName, {
            viewMethods: ['get_history', 'get_times', 'get_current_timestamp'],
            changeMethods: [],
            sender: nearConfig.contractName
        })
        console.log('contract:', readableContract)
        const hstr = (await readableContract.get_history()).reverse().slice(0, 10)
        setHistory([...hstr])
        const tms = (await readableContract.get_times()).reverse().slice(0, 10)
        const timestamp = await readableContract.get_current_timestamp()
        let newTimes = []
        tms.map(tm => {
            const diff = BigNumber(timestamp).minus(BigNumber(tm)).dividedBy('1000000000')
            if (diff.isGreaterThan(BigNumber(86400))) {
                const days = getPreciseValue(diff.dividedBy(BigNumber(86400)).toString())
                const hours = getPreciseValue(diff.modulo(BigNumber(86400)).dividedBy(BigNumber(3600)).toString())
                newTimes.push(`${days}D ${hours}H`)
            } else if (diff.isGreaterThan(BigNumber(3600))) {
                const hours = getPreciseValue(diff.dividedBy(BigNumber(3600)).toString())
                const minutes = getPreciseValue(diff.modulo(BigNumber(3600)).dividedBy(BigNumber(60)).toString())
                newTimes.push(`${hours}H ${minutes}M`)
            } else if (diff.isGreaterThan(BigNumber(60))) {
                const minutes = getPreciseValue(diff.dividedBy(BigNumber(60)).toString())
                const seconds = getPreciseValue(diff.modulo(BigNumber(60)).toString())
                newTimes.push(`${minutes}M ${seconds}S`)
            } else {
                newTimes.push(`${getPreciseValue(diff.toString())}S`)
            }
        })
        setTimes([...newTimes])
        wallet = new WalletConnection(near)

        const accountIdTemp = wallet.getAccountId()
        setAccountId(accountIdTemp)
        localStorage.setItem('account', accountIdTemp)
        console.log('accountId: ', accountIdTemp)
    }

    const onConnectClick = async () => {
        if (connectBtnCaption !== 'Connect Wallet') {
            localStorage.clear()
            setConnectionBtnCaption('Connect Wallet')
            setUserBalance('0')
            setWalletBalance('0')
            setBettable('0')
            return
        }
        if (wallet?.isSignedIn()) {
            console.log("You are already signed:", wallet.getAccountId())
            const account = await near.account(wallet.getAccountId())
            const blnc = await account.getAccountBalance()
            setWalletBalance(blnc.available)
            const blncStr = BigNumber(blnc.available).dividedBy(BigNumber(10).exponentiatedBy(24)).toFixed(2)
            const readableContract = await new Contract(account, nearConfig.contractName, {
                viewMethods: ['get_user_balance'],
                changeMethods: [],
                sender: nearConfig.contractName
            })
            const user_balance = await readableContract.get_user_balance({ user_id: wallet.getAccountId() })

            const playing = localStorage.getItem('playing')
            console.log("playing:", { playing })
            if (playing === 'true') {
                const amnt = localStorage.getItem('amount')
                const prevBlnc = localStorage.getItem('userBalance')
                if (BigNumber(user_balance).isGreaterThan(BigNumber(prevBlnc))) {
                    setAlert({ type: 'success', message: `Won ${Number(amnt) * 1.94} NEAR` })
                    setTransition(() => TransitionDown);
                    setSnackOpen(true);
                    victorySound.play()
                } else {
                    setAlert({ type: 'warning', message: `Lost ${amnt} NEAR` })
                    setTransition(() => TransitionDown);
                    setSnackOpen(true);
                    lostSound.play()
                }
                localStorage.removeItem('playing')
                localStorage.removeItem('amount')
                localStorage.removeItem('userBalance')
            }

            setConnectionBtnCaption(`${wallet.getAccountId().substr(0, 6)}...${wallet.getAccountId().substr(wallet.getAccountId().length - 4, 4)}(${blncStr}NEAR)`)

            const contractTemp = await new Contract(wallet.account(), nearConfig.contractName, {
                viewMethods: ['get_user_balance', 'get_history', 'get_times', 'get_current_timestamp'],
                changeMethods: ['flip', 'user_deposit', 'user_withdraw'],
                sender: wallet.account()
            })
            setContract(contractTemp)
            console.log('contract: ', contractTemp)
        } else {
            wallet?.requestSignIn(nearConfig.contractName)
        }
    }

    const userDeposit = async (amount) => {
        setOpen(false)
        if (BigNumber(amount).multipliedBy(BigNumber(10).exponentiatedBy(24)).isGreaterThan(BigNumber(walletBalance))) {
            setAlert({ type: 'warning', message: "Insufficient fund to deposit!" })
            setTransition(() => TransitionDown);
            setSnackOpen(true);
            return
        }
        localStorage.setItem('notification', `Deposited ${amount} NEAR to your account`)
        await contract.user_deposit({},
            "300000000000000", // attached GAS (optional)
            utils.format.parseNearAmount(amount.toString()))
    }

    const userWithdraw = async (amount) => {
        setOpen(false)
        console.log('my id: ', accountId)
        console.log('amount: ', typeof amount)
        console.log('amount *1', typeof amount * 1)
        if (BigNumber(amount).multipliedBy(BigNumber(10).exponentiatedBy(24)).isGreaterThan(BigNumber(userBalance))) {
            setAlert({ type: 'warning', message: "Insufficient fund to withdraw!" })
            setTransition(() => TransitionDown);
            setSnackOpen(true);
            return
        }
        // console.log('withdraw money: ', Big(amount || '0').times(10 ** 24).toFixed())
        // console.log('current param:', Big('10000000000000000000000').toFixed())
        localStorage.setItem('notification', `Withdrew ${amount} NEAR to your wallet`)
        setLoading(true)
        await contract.user_withdraw({
            to: accountId,
            amount: utils.format.parseNearAmount(amount)
        })
        setAlert({ type: 'success', message: `Withdrew ${amount} NEAR to your wallet` })
        setTransition(() => TransitionDown);
        setSnackOpen(true);
        //loading history
        const user_balance = await contract.get_user_balance({ user_id: accountId })
        console.log('user balance: ', user_balance)
        setUserBalance(user_balance)

        console.log('my wallet:', wallet.getAccountId)
        const account = await near.account(wallet.getAccountId())
        const blnc = await account.getAccountBalance()
        console.log('balance:', blnc)
        setWalletBalance(blnc.available)

        const blncStr = BigNumber(blnc.available).dividedBy(BigNumber(10).exponentiatedBy(24)).toFixed(2)
        setConnectionBtnCaption(`${wallet.getAccountId().substr(0, 6)}...${wallet.getAccountId().substr(wallet.getAccountId().length - 4, 4)}(${blncStr}NEAR)`)

        const hstr = (await contract.get_history()).reverse().slice(0, 10)
        setHistory([...hstr])
        const tms = (await contract.get_times()).reverse().slice(0, 10)
        const timestamp = await contract.get_current_timestamp()
        let newTimes = []
        tms.map(tm => {
            const diff = BigNumber(timestamp).minus(BigNumber(tm)).dividedBy('1000000000')
            if (diff.isGreaterThan(BigNumber(86400))) {
                const days = getPreciseValue(diff.dividedBy(BigNumber(86400)).toString())
                const hours = getPreciseValue(diff.modulo(BigNumber(86400)).dividedBy(BigNumber(3600)).toString())
                newTimes.push(`${days}D ${hours}H`)
            } else if (diff.isGreaterThan(BigNumber(3600))) {
                const hours = getPreciseValue(diff.dividedBy(BigNumber(3600)).toString())
                const minutes = getPreciseValue(diff.modulo(BigNumber(3600)).dividedBy(BigNumber(60)).toString())
                newTimes.push(`${hours}H ${minutes}M`)
            } else if (diff.isGreaterThan(BigNumber(60))) {
                const minutes = getPreciseValue(diff.dividedBy(BigNumber(60)).toString())
                const seconds = getPreciseValue(diff.modulo(BigNumber(60)).toString())
                newTimes.push(`${minutes}M ${seconds}S`)
            } else {
                newTimes.push(`${getPreciseValue(diff.toString())}S`)
            }
        })
        setTimes([...newTimes])
        //loaded history
        setLoading(false)
    }

    const onClickFlip = async (Transition) => {
        if (connectBtnCaption === 'Connect Wallet') {
            // alert('Connect wallet!')
            setAlert({ type: 'warning', message: "Your wallet are not connected!" })
            setTransition(() => Transition);
            setSnackOpen(true);
            return
        }
        if (BigNumber(playVal).multipliedBy(BigNumber(10).exponentiatedBy(24)).isGreaterThan(BigNumber(userBalance))) {
            setAlert({ type: 'warning', message: "Insufficient account balance to flip!" })
            setTransition(() => Transition);
            setSnackOpen(true);
            return
        }
        if (BigNumber(playVal).multipliedBy(BigNumber(10).exponentiatedBy(24)).isGreaterThan(BigNumber(bettable))) {
            setAlert({ type: 'warning', message: "Insufficient reward fund!" })
            setTransition(() => Transition);
            setSnackOpen(true);
            return
        }

        console.log('starting play')
        setLoading(true)
        localStorage.setItem('playing', 'true')
        localStorage.setItem('amount', playVal.toString())
        localStorage.setItem('userBalance', userBalance.toString())
        let res = await contract.flip({
            head: side === 'heads',
            amount: utils.format.parseNearAmount(playVal.toString())
        })
        if (res === true) {
            setAlert({ type: 'success', message: `Won ${Number(playVal) * 1.94} NEAR` })
            setTransition(() => Transition);
            setSnackOpen(true);
            victorySound.play()
            // localStorage.setItem('notification', `Won ${Number(playVal) * 1.94} NEAR`)
        } else {
            setAlert({ type: 'warning', message: `Lost ${playVal} NEAR` })
            setTransition(() => Transition);
            setSnackOpen(true);
            lostSound.play()
            // localStorage.setItem('notification', `Lost ${playVal} NEAR`)
        }
        const user_balance = await contract.get_user_balance({ user_id: accountId })
        console.log('user balance: ', user_balance)
        setUserBalance(user_balance)

        const contractAccount = await near.account(nearConfig.contractName)
        const contractBlnc = await contractAccount.getAccountBalance()
        console.log('bettable:', contractBlnc.available)
        setBettable(contractBlnc.available)

        //loading history
        const hstr = (await contract.get_history()).reverse().slice(0, 10)
        setHistory([...hstr])
        const tms = (await contract.get_times()).reverse().slice(0, 10)
        const timestamp = await contract.get_current_timestamp()
        let newTimes = []
        tms.map(tm => {
            const diff = BigNumber(timestamp).minus(BigNumber(tm)).dividedBy('1000000000')
            if (diff.isGreaterThan(BigNumber(86400))) {
                const days = getPreciseValue(diff.dividedBy(BigNumber(86400)).toString())
                const hours = getPreciseValue(diff.modulo(BigNumber(86400)).dividedBy(BigNumber(3600)).toString())
                newTimes.push(`${days}D ${hours}H`)
            } else if (diff.isGreaterThan(BigNumber(3600))) {
                const hours = getPreciseValue(diff.dividedBy(BigNumber(3600)).toString())
                const minutes = getPreciseValue(diff.modulo(BigNumber(3600)).dividedBy(BigNumber(60)).toString())
                newTimes.push(`${hours}H ${minutes}M`)
            } else if (diff.isGreaterThan(BigNumber(60))) {
                const minutes = getPreciseValue(diff.dividedBy(BigNumber(60)).toString())
                const seconds = getPreciseValue(diff.modulo(BigNumber(60)).toString())
                newTimes.push(`${minutes}M ${seconds}S`)
            } else {
                newTimes.push(`${getPreciseValue(diff.toString())}S`)
            }
        })
        setTimes([...newTimes])
        //loaded history
        setLoading(false)
    }
    const onSnackClose = () => {
        setSnackOpen(false)
    }
    useEffect(async () => {
        const message = localStorage.getItem('notification')
        if (!!message) {
            setAlert({ type: 'success', message: localStorage.getItem('notification') })
            setTransition(() => TransitionDown);
            setSnackOpen(true);
            localStorage.removeItem('notification')
        }
        await initContract()
        const accnt = localStorage.getItem('account')
        if (!!accnt) {
            onConnectClick()
        }
    }, [])

    useEffect(async () => {
        if (contract) {
            const account = await near.account(accountId)
            console.log('account:', account)
            const state = await account.state()
            console.log('state: ', state)

            console.log('my account id: ', accountId)

            const user_balance = await contract.get_user_balance({ user_id: accountId })
            console.log('user balance: ', user_balance)
            setUserBalance(user_balance)

            const contractAccount = await near.account(nearConfig.contractName)
            const contractBlnc = await contractAccount.getAccountBalance()
            console.log('bettable:', contractBlnc.available)
            setBettable(contractBlnc.available)
        }
    }, [contract])
    console.log("bettable:", bettable)
    return (
        <div className='body'>
            {loading && <LoadingPad />}
            <AppBar position="static" sx={{ backgroundColor: '#1C1F25' }}>
                <Toolbar>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1, display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
                        <img src='/assets/logo.png' alt='flip'
                            style={{ width: '50px', height: '50px', cursor: 'pointer' }}
                        />
                        <div className='menuItem'>COINFLIP</div>
                        <div className='menuItem'>COINFLIP (PVP)</div>
                        <div className='menuItem'>FAQ</div>
                        <div className='menuItem'>LEADERBOARD</div>
                    </Typography>

                    <Button onClick={onConnectClick} color='secondary' variant="outlined" sx={{ color: 'white' }}>{connectBtnCaption}</Button>
                </Toolbar>
            </AppBar>
            <div className='container'>
                <Box
                    sx={{ flexGrow: 1, mt: 5, pb: 5, pt: 5 }}
                >
                    <Grid
                        container rowSpacing={3} direction='row' justifyContent='space-between'
                        sx={{ flexWrap: 'wrap-reverse' }}
                    >
                        <Grid item xs={12} sm={5}
                            sx={{
                                backgroundColor: '#1C1F25',
                                borderRadius: '15px',
                                p: 3
                            }}
                        >
                            <Item
                                sx={{ color: 'wheat', fontSize: '35px', fontWeight: 'bold' }}
                            >
                                Recent Flips
                            </Item>
                            {
                                history.map((content, index) => <div style={{ display: 'flex', justifyContent: 'space-between', color: 'wheat' }} key={index}>
                                    <h4 style={{ color: 'wheat' }}>{content}</h4>
                                    <h4 style={{ marginLeft: '20px', color: 'yellow', minWidth: '60px' }}>{times[index]}</h4>
                                </div>)
                            }

                        </Grid>
                        <Grid
                            item
                            xs={12}
                            sm={7}
                            sx={{
                                borderRadius: '15px',
                                p: 3
                            }}
                        >
                            <div style={{ width: '100%', marginLeft: '0%' }}>
                                <Item
                                // sx={{ backgroundImage: 'linear-gradient(180deg, #b4ded8, #0b473f)' }}
                                >
                                    {/* <div id="coin" className={result} >
                                        <div className="side-a">
                                            <h2>TAIL</h2>
                                        </div>
                                        <div className="side-b">
                                            <h2>HEAD</h2>
                                        </div>
                                    </div> */}
                                    {
                                        side === 'heads' ? (
                                            <img src='/assets/heads.png' alt='front' style={{ width: '225px', height: '225px' }} />
                                        ) : (
                                            <img src='/assets/tails.png' alt='front' style={{ width: '225px', height: '225px' }} />
                                        )
                                    }
                                </Item>
                                <Grid item container direction='row' justifyContent='space-between' sx={{ mt: 5 }}>
                                    <Button color='secondary' onClick={() => onClickSide('heads')} variant={side == 'heads' ? 'contained' : 'outlined'}
                                        sx={{
                                            width: '45%',
                                            height: '50px',
                                            fontWeight: 'bold',
                                            color: 'white',
                                            fontSize: '20px'
                                        }}>
                                        Head
                                    </Button>
                                    <Button color='secondary' onClick={() => onClickSide('tails')} variant={side == 'tails' ? 'contained' : 'outlined'}
                                        sx={{
                                            width: '45%',
                                            fontWeight: 'bold',
                                            color: 'white',
                                            height: '50px',
                                            fontSize: '20px'
                                        }}
                                    >
                                        Tail
                                    </Button>
                                </Grid>

                                <Item sx={{ mt: 5 }}>
                                    <Stack spacing={4} direction="row" sx={{ mb: 1, mt: 1, color: 'white', fontSize: '20px' }} alignItems="center">
                                        <div style={{ fontSize: '20px' }}>0.1N</div>
                                        <PrettoSlider
                                            valueLabelDisplay="auto"
                                            aria-label="pretto slider"
                                            defaultValue={2}
                                            onChange={handleSliderChange}
                                            value={typeof playVal === 'number' ? playVal : 0}
                                            min={0.1}
                                            max={5}
                                            step={0.1}
                                        />
                                        <div style={{ fontSize: '20px' }}>5N</div>
                                    </Stack>
                                    <Stack spacing={3} direction="row" sx={{ mb: 1, mt: 2 }} alignItems="center" justifyContent="center">
                                        <Button color='secondary' variant={playVal == 1 ? 'contained' : 'outlined'} onClick={() => setSpecialVal(1)} sx={{ width: '20%', fontSize: '20px' }}>1N</Button>
                                        <Button color='secondary' variant={playVal == 2 ? 'contained' : 'outlined'} onClick={() => setSpecialVal(2)} sx={{ width: '20%', fontSize: '20px' }}>2N</Button>
                                        <Button color='secondary' variant={playVal == 5 ? 'contained' : 'outlined'} onClick={() => setSpecialVal(5)} sx={{ width: '20%', fontSize: '20px' }}>5N</Button>
                                    </Stack>
                                </Item>
                                <Button
                                    variant='contained'
                                    onClick={() => onClickFlip(TransitionDown)}
                                    sx={{ width: '100%', fontSize: '20px', width: '100%', mt: 5, color: 'white' }}
                                    color='secondary'
                                    size='large'
                                    className='Button'
                                >
                                    Flip&nbsp;<font style={{ color: 'yellow', fontSize: '20px' }}>{playVal}({BigNumber(userBalance).dividedBy(BigNumber(10).exponentiatedBy(24)).toFixed(2)}NEAR)</font>
                                </Button>
                                {/* <Item sx={{ mt: 5 }}>
                                    
                                </Item> */}
                                <Grid item container direction='row' justifyContent='space-between' sx={{ mt: 5, p: 0 }}>
                                    <Button onClick={() => handleOpen('deposit', TransitionDown)} color='secondary' variant='contained' sx={{ width: '45%', height: '50px', fontSize: '20px', color: 'white' }}>Deposit</Button>
                                    <Button onClick={() => handleOpen('withdraw', TransitionDown)} color='secondary' variant='contained' sx={{ width: '45%', height: '50px', fontSize: '20px', color: 'white' }}>Withdraw</Button>
                                </Grid>
                            </div>
                        </Grid>
                    </Grid>

                    {/* <Grid item xs={12} container justifyContent='center' sx={{ mt: 7, }}>
                        <Grid
                            item
                            xs={9}
                            container
                            direction="row"
                            justifyContent="space-around"
                            alignItems="center"
                            sx={{
                                backgroundColor: 'rgba(255,255,100, 0.2)',
                                borderRadius: 2
                            }}
                        >
                            <Button sx={{ fontWeight: '20px', color: 'white', textTransform: 'none', fontSize: '17px' }}>
                                Flip<br />Responsibly</Button>
                            <Button sx={{ fontWeight: '20px', color: 'white', textTransform: 'none', fontSize: '17px' }}>
                                How To <br />Play</Button>
                            <Button sx={{ fontWeight: '20px', color: 'white', textTransform: 'none', fontSize: '17px' }}>
                                FAQ</Button>
                        </Grid>
                    </Grid> */}
                    <Grid item xs={12} container justifyContent='center' sx={{ mt: 7 }} >
                        <Grid
                            item
                            xs={10}
                            sm={4}
                            md={3}
                            container
                            direction="row"
                            justifyContent="space-around"
                            alignItems="center"
                        >
                            <a href='https://twitter.com/PandamilNFT'><img src='/assets/twitter.png' style={{ width: '30px', height: '30px' }} alt='link icon' /></a>
                            <a href='https://discord.gg/mQnZuysV4n'><img src='/assets/discord.png' style={{ width: '30px', height: '30px' }} alt='link icon' /></a>
                            <a href='https://pandamillionaires.club/'><img src='/assets/panda.png' style={{ width: '35px', height: '30px' }} alt='link icon' /></a>
                        </Grid>
                    </Grid>
                </Box>
                <Snackbar
                    open={snackOpen}
                    onClose={onSnackClose}
                    TransitionComponent={transition}
                    key={transition ? transition.name : ''}
                    autoHideDuration={6000}
                    anchorOrigin={{ vertical, horizontal }}
                >
                    <Alert onClose={onSnackClose} severity={alert.type} sx={{ width: '100%' }}>
                        {alert.message}
                    </Alert>
                </Snackbar>
                {/* <Alert severity="error">This is an error message!</Alert>
                <Alert severity="warning">This is a warning message!</Alert>
                <Alert severity="info">This is an information message!</Alert>
                <Alert severity="success">This is a success message!</Alert> */}
                <FundModal open={open} handleClose={handleClose} type={fundType} deposit={userDeposit} withdraw={userWithdraw} />
            </div>
        </div >
    )
}

export default Main