const express = require("express")
const userRoute = express.Router()
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
require('dotenv').config()
const secretKey = process.env.secretKey

const { UserModel } = require("../models/User.model")
const { ProductModel } = require("../models/Product.model")
const { TokenModel } = require("../models/Token.model")


const { roles, authentication, authorise } = require("../middleware/auth")
const { decode } = require("punycode")


userRoute.post("/signup", async (req, res) => {

    const { email, name, pass, role } = req.body
    isUser = await UserModel.findOne({ email: email })
    if (isUser) {
        return res.status(404).send({ "error": "user is already registered !" })
    }
    try {
        bcrypt.hash(pass, 5, async (err, hash) => {
            if (err) {
                return res.status(404).send({ "error": err.message })
            }
            const user = UserModel({ email, pass: hash, name, role })

            await user.save()
            return res.status(200).send({ "message": "user has been registered !" })
        })
    } catch (error) {
        return res.status(404).send({ "error": error.message })

    }
})


//  login
userRoute.post("/login", async (req, res) => {
    const { email, pass } = req.body
    isUser = await UserModel.findOne({ email: email })
    if (!isUser) {
        return res.status(404).send({ "error": "invailid crendentials!" })
    }
    bcrypt.compare(pass, isUser.pass, async (err, result) => {
        if (result) {
            let token = jwt.sign({ role: isUser.role, email }, secretKey, { expiresIn: "1" })
            let refresh_token = jwt.sign({ role: isUser.role, email }, secretKey, { expiresIn: "5m" })
            return res.status(200).send({ "message": "login successfully!", token, refresh_token })
        }
        return res.status(404).send({ "error": err.message })
    })
})



//  get product 
userRoute.get("/products", authentication, authorise("user"), async (req, res) => {

    products = await ProductModel.find()
    res.status(200).send(products)
})


userRoute.get("/products", authentication, authorise("seller"), async (req, res) => {
    products = await ProductModel.find()
    res.status(200).send(products)
})

//  add products

userRoute.post("/addproducts", authentication, authorise("seller"), async (req, res) => {
    const { title, price } = req.body
    try {
        product = ProductModel(req.body)
        await product.save();
        res.status(200).send({ "message": "One product added !" })
    } catch (error) {
        console.log(error.message)
    }
})

//  delete product
userRoute.delete("/deleteproducts/:id", authentication, authorise("seller"), async (req, res) => {
    if (req.params.id) {
        try {
            await ProductModel.findOneAndDelete({ _id: req.params.id })
            res.status(200).send({ "message": "One product deleted !" })
        } catch (error) {
            console.log(error.message)
        }
    }
    return res.status(404).send({ "error": "Product Id didn't found !" })
})


userRoute.post("/logout", authentication, async (req, res) => {
    let token = req.headers.authorization
    jwt.verify(token, secretKey, async (err, decoded) => {
        let isToken = await TokenModel.findOne({ email: decoded.email })
        if (isToken) {
            await TokenModel.updateOne({ email: decoded.email }, token)
            return res.status(200).send({ "message": "Your ar logged out" })
        }
        if (decoded) {
            let blackToken = TokenModel({ token, email: decoded.email })
            await blackToken.save()
            return res.status(200).send({ "message": "Your ar logged out" })
        }
        return res.status(404).send({ "error": err.message })
    })

})



module.exports = { userRoute }
