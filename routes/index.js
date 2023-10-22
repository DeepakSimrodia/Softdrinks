var express = require('express');
var router = express.Router();
const User = require("../model/userschema")
const Admin=require("../model/adminschema")
const passport = require('passport')
const LocalStreategy = require('passport-local');
passport.use(new LocalStreategy(User.authenticate( )))
// passport.use(new LocalStreategy(Admin.authenticate()))
const { v4: uuidv4, stringify } = require('uuid');
const nodemailer=require("nodemailer")
var cart=[];
/* GET home page. */

router.get('/', function (req, res, next) {
  res.render('index', { title: 'Hella Hopes' ,isLoggedIn: req.user ? true : false, user: req.user});
});


/* GET CART */

router.get('/addcart',isLoggedIn,function(req,res){
  res.render('addcart',{title:'Hella Hopes | Cart',isLoggedIn: req.user ? true : false, user: req.user,task:cart})
})

/* GET PROFILE */

router.get("/profile",isLoggedIn,function(req,res){
  res.render("profile",{
    title:"Profile Page",
    isLoggedIn:req.user?true:false,
  user: req.user})

})

/* POST USERUPDATE */

router.post("/updateuser/:id", async function (req, res, next) {
  await User.findByIdAndUpdate(req.params.id, req.body);
  await User.findOneAndUpdate(req.params.email,req.body.email)
  res.redirect("/profile");
});

/* POST CARTDATA STORE */

router.post('/',isLoggedIn,function(req,res){
  const cartData={
    id:uuidv4(),
    productName:req.body.productName,
    productPrize:req.body.productPrize,
    productImg:req.body.productImg,
  }
  cart.push(cartData)
  res.redirect('/addcart')
})
/* GET DELETE CART */

router.get("/del/:id",function(req,res){
  cart=cart.filter((task)=>task.id !== req.params.id)
  res.redirect("/addcart")
})

/* GET SIGNIN page. */

router.get('/signin', function (req, res) {
  res.render('signin', { title: 'Hella Hopes | Signin' ,isLoggedIn: req.user ? true : false, user: req.user})
})


/* POST SIGNIN page. */

router.post("/signin",passport.authenticate("local",{
  successRedirect:"/",
  failureRedirect:"/signin",
}),
function(req,res,next){}
);

/* GET SIGNUP page. */

router.get('/signup', function (req, res) {
  res.render('signup', { title: 'Hella Hopes | Signup' ,isLoggedIn: req.user ? true : false, user: req.user})
})

/* POST SIGNUP page. */

router.post('/signup', function (req, res) {
 
  const { username, contact, email, address, password } = req.body
  User.register({ username, contact, email,address }, password)
    .then((user) => {
      res.redirect("/signin")
    })
    .catch((err) => {
      res.send(err)
    })
})




// POST SEND IN DB
router.post("/addindb",function(req,res){
  const Data=req.body
  res.send(Data)
})




/* GET Forget password page. */
router.get('/forget-Password', function (req, res, next) {
  res.render('forget', { title: 'Forget Password', isLoggedIn: req.user ? true : false, user: req.user });
});



/* post send mail */
router.post("/send-mail", async function (req, res, next) {
  const user = await User.findOne({ email: req.body.email });
  if (!user) return res.send("User is not found");
  const mailUrl = `${req.protocol}://${req.get("host")}/forget-password/${
    user._id
  }`;

  /*--------------- Node mailer code ---------------- */

  const transport = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 465,
    auth: {
      user: "dsimrodia@gmail.com",
        pass: "qtuzfqypzplhcuwr",
    },
  });

  const mailOptions = {
    from: "Temp Mail Pvt. Ltd.<master.temp@gmail.com>",
    to: req.body.email,
    subject: "Password Reset Link",
    text: "Do not share this link to anyone.",
    html: `<a href=${mailUrl}>Password Reset Link</a>`,
  };

  transport.sendMail(mailOptions, (err, info) => {
    if (err) return res.send(err);
    console.log(info);

    return res.send(
      "<h1 style='text-align:center;color: tomato; margin-top:10%'><span style='font-size:60px;'>✔</span> <br />Email Sent! Check your inbox , <br/>check spam in case not found in inbox.</h1> <br> <a href='/signin'>Signin</a>"
    );
  });
});

/* Get getpassword page */
router.get("/forget-password/:id", async function (req, res, next) {
  const user = await User.findById(req.params.id);

  try {
    res.render("getpassword", {
      title: "Get password ",
      isloggedIn: req.user ? true : false,
      id: user.id,
    });
  } catch (error) {
    console.log(error);
  }
});

/* post getpassword */
router.post("/forget-password/:id", async function (req, res, next) {
  try {
    const user = await User.findById(req.params.id);
    await user.setPassword(req.body.password);
    await user.save();
    res.redirect("/signin");
  } catch (error) {
    console.log(err);
  }
});


/* GET RESET PASSWORD */

router.get('/reset-password',isLoggedIn,function(req,res){
  res.render('resetpassword',{title:'Hella Hopes | Reset Password', isLoggedIn: req.user ? true : false, user: req.user})
})


/* POST Reset Passsword */

router.post("/reset-password",function(req,res){
  const {oldpassword,newpassword}=req.body

  req.user.changePassword(oldpassword,newpassword,function(err,user){
    if(err){
      res.send(err)
    }
    res.redirect('/')
  })
})


/* GET BEER */

router.get('/Cocacola',isLoggedIn,function(req,res){
  res.render('beer',{ title: 'Hella Hopes | Coca Cola',isLoggedIn: req.user ? true : false, user: req.user})
})

/* GET WINE */

router.get('/Sprite',isLoggedIn,function(req,res){
  res.render('wine',{ title: 'Hella Hopes | Sprite',isLoggedIn: req.user ? true : false, user: req.user})
})

/* GET BEERCAN */

router.get('/ThumsUp',isLoggedIn,function(req,res){
  res.render('beercan',{title:'Hella Hopes | ThumsUp',isLoggedIn: req.user ? true : false, user: req.user})
})

/* GET LOGOUT */

router.get('/logout',isLoggedIn,function(req,res){
  req.logOut(()=>{
    res.redirect('/')
  })
})




/* isLoggedIn FUNCTION */

function isLoggedIn(req,res,next){
  if(req.isAuthenticated()){
    next();
  }
  else{
    res.redirect("/signin")
  }
}



module.exports = router;
