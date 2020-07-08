const express = require('express');
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const router = express.Router();
const User = require('../../models/User');
const keys = require('../../config/keys');
const validateRegisterInput = require('../../validations/register');
const validateLoginInput = require('../../validations/login');
const validateMessage = require('../../validations/messages');


// @route   POST api/users/register
// @desc    Register user
// @access  Public 
router.post('/register', (req, res) => {
  //Validation
  const {errors, isValid} = validateRegisterInput(req.body);

  if (!isValid) {
    return res.status(400).json(errors);
  }

User.findOne({email: req.body.email})
.then(user => {
  if (user){
    return res.status(400).json({email: 'Email already exists'});
  } 
  // Check if handle already taken
  User.findOne({handle: req.body.handle})
        .then(user => {
          if(user){
            return res.json({handle: 'Handle already taken. Choose another handle'})
          }
      
      //create an avatar
    const avatar = gravatar.url(req.body.email, {
      s: '200',
      r: 'pg',
      d: 'mm'
    });

    const newUser = new User({
      name: req.body.name,
      email: req.body.email,
      handle: req.body.handle,
      avatar,
      password: req.body.password
    });

    //generate a key for hashing the password
    bcrypt.genSalt(10, (err, salt) => {
      if (err) throw err;

      bcrypt.hash(newUser.password, salt, (err, hash) => {
        if (err) throw err;
        newUser.password = hash;
        newUser
        .save()
        .then((user) => res.json(user))
        .catch((err) => console.log(err));
      });
    });
    
  })
    
})
.catch(err => console.log(err));
})


/**
 * Get users names matching to userName criteria
 * @route GET /api/users/search
 * @group Users
 * @param {string} userName.query.required - username or email - eg: syam
 * @returns {object} 200 - An array of user info
 * @returns {Error}  default - 500
 */
// Search the users matching the name to be shown on the UI
// @route   get api/users/search 
// @desc    search user
// @access  Public 
router.get('/search/:userName', 
  passport.authenticate('jwt', {
  session: false
  }),
  (req, res) => {
    const {userName} = req.params;

    //validation
    const {errors, isValid} = validateMessage(req.body);
    if(!isValid){
      return res.status(500).json(errors);
    }
    Users.findOne({name: req.param.name})
    .then(user => {
       if(!user){
         return res.status(400).json({errors: 'no user not found with the name '});
       }
       console.log(user);
    })
    .catch(err =>  console.log(`failed to get the user info ${err}`));
    return res.status(200).send(`{msg: searching user ${userName}}`);
});



/**
 * Get Random list of People info
 * @route GET /api/users/showPeople
 * @group Users
 * @param {string} userName.query.required - username or email - eg: syam
 * @returns {object} 200 - An array of user info
 * @returns {Error}  default - 500
 */
// @route   get api/users/showPeople
// @desc    showPeople
// @access  Public 
router.get('/showPeople', (req, res) => {
    return res.status(200).send(`{msg: respond with all people info}`);
});


/**
 * Get users names matching criteria of age group, same hobbies
 * @route GET /api/users/showMatches
 * @group Users
 * @param {string} userName.query.required - username or email - eg: syam
 * @returns {object} 200 - An array of user info
 * @returns {Error}  default - 500
 */
// @route   get api/users/showMatches
// @desc    show Matches
// @access  Public 
router.get('/showMatches', (req, res) => {
  
  return res.status(200).send(`{msg: respond with matching people}`);
});



/**
 * Post a message fromUser to different User
 * @route Post api/users/messages/:id
 * @group Users
 * @param {string} fromId.query.required - username or email - eg: syam
 * @param {string} toId.query.required - username or email - eg: deepika
 * @param {string} message.required - username or email - eg: how are you
 * @returns {object} 200 - An array of user info
 * @returns {Error}  default - 500
 */
// // @route   post api/users/messages/:id
// // @desc    post a message to a user by user id
// // @access  private 
// router.post('/messages/:id',passport.authenticate('jwt', {session: false}) , (req, res) => {

// //validation
// const {errors, isValid} = validateMessage(req.body);
//   if(!isValid){
//     return res.json(errors);
//   }
// //code
// User.findOne({_id:req.params.id})
//     .then(user => {
//       if(!user){
//         return res.status(400).json({errors: 'user not found. Check the post id.'})
//       }
//       //create a new message

//       const newMessage ={
//         fromUserId: req.user.id,//comes from token
//         fromUserName:req.user.name,//comes from token
//         toUser: req.params.id,
//         msg:req.body.msg
//       }
//       console.log(`from user id is ${req.user.id}`);
//       console.log(`from user name is ${req.user.name}`);
//       user.messages.unshift(newMessage);
//       //save in db
//       user.save()
//       .then(user, res.json(user))
//       .catch(err => console.log(err));
//     })
//     .catch(err=> console.log(err));
// })

// @route   delete api/users/messages[]
// @desc    delete all the messages of a user by user id
// @access  Public

/**
 * Get a message fromUser to different User
 * @route get api/users/messages
 * @group Users
 * @param {string} fromId.query.required - username or email - eg: syam
 * @param {string} toId.query.required - username or email - eg: deepika
 * @param {string} message.required - username or email - eg: how are you
 * @returns {object} 200 - An array of user info
 * @returns {Error}  default - 500
 */
// @route   get api/users/messages
// @desc    post message to a user
// @access  Public 
router.get('/messages', (req, res) => {
  return res.status(200).send(`{msg: get Messages from others}`);
});

// @route   POST api/users/test
// @desc    Register user
// @access  Public 
router.get('/test', (req, res) => {
    return res.status(200).send('{msg: user test}')
  });

// @route   POST api/users/login
// @desc    Login user/returning a token
// @access  Public 
router.post('/login', (req, res) => {
//Validation
const {errors, isValid} = validateLoginInput(req.body);

if (!isValid) {
  return res.status(400).json(errors);
}

  const email = req.body.email;
  
  const password = req.body.password;

  //Find user by email
  User.findOne({email})
    .then(user => {
      console.log('email is'+ req.body.email);
      if (!user){
        return res.status(404).json({email: 'User not found'});
      }

      //Check password
      bcrypt.compare(password, user.password)
        .then(isMatch => {
          if (isMatch){
            //Payload
            const payload = {id: user.id, name: user.name, avatar: user.avatar};
            //sign token
            jwt.sign(
              payload, 
              keys.secretOrKey,
              {expiresIn: 3600},
              (err, token) => {
                return res.json({
                token: 'Bearer ' + token
              });
              })
           
          } else {
            return res.status(400).json({password: 'Password incorrect'});
          }
        })        
    })
    .catch();
});

// @route   GET api/users/current
// @desc    Return current user
// @access  Private
router.get('/current', 
passport.authenticate('jwt', {session:false}),
(req,res) => {
  return res.json(req.user);
})


/**
 * Delete a user
 * @route Delete api/users/messages/:id
 * @group Users
 * @returns {object} 200 - User Deleted
 * @returns {Error}  default - 500
 */
// @route   Delete api/users/delete
// @desc    Delete user
// @access  private  
router.post('/delete', passport.authenticate('jwt', {session:false}), function(req, res){
    
const successMessage = `User has been deleted.`;
const errorMessage = `User has not been deleted!`;
req.user.remove()
  .then(( ) => res.status(200).json({message: successMessage}))
  .catch(( ) => res.status(400).json({message: errorMessage}))
    })
module.exports = router;