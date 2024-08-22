const express = require('express');
const { authMiddeware } = require('../middleware');
const { Account } = require('../db');
const { default: mongoose } = require('mongoose');

const router = express.Router()

router.get('/balance', authMiddeware, async (req, res) => {
    const account = await Account.findOne({
        userId: req.userId
    });

    res.json({
        balance: account.balance
    })
})

router.post('/transfer', authMiddeware, async (req, res) => {
    const session = await mongoose.startSession();

    try {
        session.startTransaction();
        const { amount, to } = req.body;

        const account = await Account.findOne({ userId: req.userId }).session(session);

        if (!account || account.balance < amount) {
            await session.abortTransaction();
            return res.status(400).json({
                msg: 'Insufficient Balance'
            });
        }

        const toAccount = await Account.findOne({ userId: to }).session(session);

        if (!toAccount) {
            await session.abortTransaction();
            return res.status(400).json({
                msg: "Invalid Account"
            });
        }

        // Perform the transfer
        account.balance -= amount;
        toAccount.balance += amount;

        await account.save({ session });
        await toAccount.save({ session });

        await session.commitTransaction();
        res.json({
            msg: 'Transfer Successful'
        });
    } catch (error) {
        console.error(error);
        await session.abortTransaction();
        res.status(500).json({
            msg: 'An error occurred during the transfer'
        });
    } finally {
        session.endSession();
    }
});

module.exports = router;