import React, { useState, useEffect } from 'react';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

import Input from '@mui/material/Input';
import FilledInput from '@mui/material/FilledInput';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import InputAdornment from '@mui/material/InputAdornment';
import FormHelperText from '@mui/material/FormHelperText';
import FormControl from '@mui/material/FormControl';
import TextField from '@mui/material/TextField';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

import '../page/Main.scss'

const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #350994',
    boxShadow: 24,
    p: 4,
    borderRadius: '15px'
};

const FundModal = ({ type, deposit, withdraw, ownerDeposit, open, handleClose }) => {
    const [successFlag, setSuccessFlag] = useState(false)
    const [amount, setAmount] = useState('')

    const onClickFunds = async () => {
        if (type == 'deposit') {
            if (!(amount >= 0.1)) {
                alert('Deposit amount must over 0.1N')
                return
            }
            await deposit(amount)
            setSuccessFlag(true)
            setTimeout(() => {
                setSuccessFlag(false)
            }, 1000)
            // clearTimeout(timer)
            // setSuccessFlag(false)
        } else if (type === 'withdraw') {
            if (!(amount >= 0.1)) {
                alert('Withdraw amount must over 0.1N')
                return
            }
            await withdraw(amount)
        }
        setAmount('')
    }

    console.log('success: ', successFlag)
    return (
        <div>
            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx={modalStyle}>
                    <Typography id="modal-modal-title" variant="h6" component="h2">
                        {
                            type == 'deposit' ? 'Deposit' : (type === 'withdraw' ? 'Withdraw' : 'Deposit to Contract')
                        }
                    </Typography>
                    {
                        type === 'deposit' &&
                        <img src='/assets/money.gif' alt='get money' className='money' style={{ display: successFlag ? 'block' : 'none' }} />
                    }

                    <FormControl fullWidth sx={{ mt: 2 }} variant="filled">
                        <InputLabel htmlFor="filled-adornment-amount">Amount</InputLabel>
                        <FilledInput
                            id="filled-adornment-amount"
                            value={amount}
                            onChange={e => setAmount(e.target.value)}
                            startAdornment={<InputAdornment position="start">Ⓝ</InputAdornment>}
                        />
                        <Button
                            color='secondary' variant='contained' sx={{ mt: 2 }}
                            onClick={() => onClickFunds()}
                        >
                            {
                                type == 'deposit' ? 'Deposit' : (type === 'withdraw' ? 'Withdraw' : 'Deposit to Contract')
                            }
                        </Button>
                    </FormControl>
                </Box>
            </Modal>
        </div>
    )
}

export default FundModal