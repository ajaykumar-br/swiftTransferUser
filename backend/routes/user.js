const express = require('express')
const z = require('zod');
const jwt = require('jsonwebtoken');
const { User, Account } = require('../db')
const { JWT_SECRET } = require('../config');
const { authMiddeware } = require('../middleware');

const router = express.Router();

const signupSchema = z.object({
    username: z.string().email(),
    password: z.string(),
    firstName: z.string(),
    lastName: z.string()
})

router.post('/signup', async (req, res) => {
    const { success } = signupSchema.safeParse(req.body);

    if (!success) {
        return res.status(411).json({
            msg: 'Email already taken / Incorrect inputs'
        })
    }

    const user = await User.findOne({
        username: req.body.username
    })

    if (user) {
        return res.json({
            msg: 'Email already taken / Incorrect inputs'
        })
    }

    const dbUser = await User.create({
        username: req.body.username,
        password: req.body.password,
        firstName: req.body.firstName,
        lastName: req.body.lastName
    });

    const userAccount = await Account.create({
        userId: dbUser._id,
        balance: 1 + Math.random() * 10000
    });

    const token = jwt.sign({
        userId: dbUser._id
    }, JWT_SECRET);

    res.json({
        msg: "User created successfully",
        token: token
    })
})

const signinBody = z.object({
    username: z.string().email(),
    password: z.string()
})

router.post('/signin', async (req, res) => {
    const { success } = signinBody.safeParse(req.body);

    if (!success) {
        return res.status(411).json({
            msg: 'Incorrect Inputs'
        })
    }

    const user = await User.findOne({
        username: req.body.username,
        password: req.body.password
    });

    if (user) {
        const token = jwt.sign({
            userId: user._id
        }, JWT_SECRET);

        res.json({
            token: token
        });
        return;
    }

    res.status(411).json({
        msg: 'Error while logging in'
    })
})

const updateBody = z.object({
    password: z.string().optional(),
    firstName: z.string().optional(),
    lastName: z.string().optional()
})

router.put('/', authMiddeware, async (req, res) => {
    const { success } = updateBody.safeParse(req.body);
    if (!success) {
        res.status(411).json({
            msg: 'Error while updating information'
        })
    }

    await User.updateOne(req.body, {
        id: req.userId
    })

    res.json({
        msg: 'Updated Successfully'
    })
})

router.get('/bulk', authMiddeware, async (req, res) => {
    const filter = req.params.filter || "";

    const users = await User.find({
        $or: [
            {
                firstName:
                    { "$regex": filter }
            },
            {
                lastName:
                    { "$regex": filter }
            }
        ]
    })

    res.json({
        users: users.map(user => ({
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            _id: user._id
        }))
    })
})



module.exports = router;