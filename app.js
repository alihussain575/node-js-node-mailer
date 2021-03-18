const express = require('express')
const bodyParser = require('body-parser')
const exphbs = require('express-handlebars')
const path = require('path')
const fs = require('fs')
const nodemailer = require("nodemailer")
const { finished } = require('stream')
const { response } = require('express')

const data = fs.readFileSync('productData.json')



const productData = JSON.parse(data)
// console.log(productData)





const app = express()

app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

app.use('/public', express.static(path.join(__dirname, 'public')))


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/', (req, res) => {

     res.render("home", { title: "home", products: productData.products })
})
app.post('/', async (req, res) => {
    const json = require("./productData.json");
    const inputData = req.body;
    json.products.push({
        ...inputData,
        id: json.products.length + 1
    });

    await fs.unlinkSync("productData.json");
    await fs.writeFileSync('productData.json', JSON.stringify(json), finished)
    res.redirect('/')


})

app.get('/about', (req, res) => {
    res.render('about', { title: "about" })
})

app.get('/add', (req, res) => {
    res.render("add-product", { title: "add-product" })
})

app.post("/send-product/:id", function (req, res) {
    res.json({
        product: req.body.id,
        email: req.body.email,
        buyer: req.body.buyer,
        password: req.body.password
    })
    let id = req.body.id;

    let dataIsTrue = productData.products.find((jsonData) => {
        return jsonData.id === +id;
        // console.log(jsonData.id)
    })
    console.log(dataIsTrue)
        const output = `
    <p>you have a new contact request</p>
    <h3>Contact Details</h3>
    <ul>
        <li>product : ${dataIsTrue.title}</li>
        <li>product details : ${dataIsTrue.details}</li>
    </ul>
        `
        let transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: `${req.body.buyer}`, // generated ethereal user
                pass: `${req.body.password}`  // generated ethereal password
            },
            tls: {
                rejectUnauthorized: false
            }
        });
        let mailOptions = {
            from: req.body.buyer, // sender address
            to: `${req.body.email}`, // list of receivers
            subject: 'description', // Subject line
            text: `details:`, // plain text body
            html: output
        };
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return console.log(error);
            }
            console.log('Message sent: %s', info.messageId);
            console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
        });

    // res.render('contact', {msg:'Email has been sent'});
})

app.get('/product/:id', (req, res) => {
    const json = require('./productData.json')
    const id = req.params.id
    const product = json.products.find((c) => {
        // console.log(c.id, id);
        return c.id === +id
    });
    if (product) {
        res.render("details", { title: "product-details", products: product })
    } else {
        res.status(404).json({
            message: "not found"
        })
    }


})

app.post('/product', (req, res) => {
    console.log(req.body)
})

app.get('/email-form', (req, res) => {
    res.render('email', { title: "buy" })
})


app.listen(3000, () => {
    console.log('server runnig on port 3000')
})