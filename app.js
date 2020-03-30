'use strict';
const express = require('express');

function makeid(length) {
   var result           = '';
   var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
   var charactersLength = characters.length;
   for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
   }
   return result;
}
function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

const hash_len = 5;
const x_opts = ['A', 'B', 'C', 'D'];
const y_opts = [1,2,3,4];
var roll_num = 0;
var room_size = 0;
var slots = [];

var app = express.Router();
function sendOkStyled(res, content){
  const header = `
  <meta name="viewport" content="width=device-width, initial-scale=1"><style>
  body{margin:40px auto;padding:0 10px;max-width:650px;
    line-height:1.6;font-size:18px;font-family:sans-serif;color:#444}
  h1,h2,h3{line-height:1.2}</style><h2>`;
  const footer = `</h2>`
  res.status(200).send(header+content+footer);
}
app.get('/', async function(req, res){
  const link = "<a href='/join'>Join</a>";
  sendOkStyled(res,"Welcome to the chameleon dice roll, join the current room: " + link);
});
app.get('/join', async function(req, res){
  var user_hash = 0;
  for(var i=0;i<slots.length;i++){
    if(slots[i].user == 0){
      slots[i].user = makeid(hash_len);
      res.redirect("/room/"+roll_num+"/"+slots[i].user);
      return;
    }
  }
  if(user_hash ==0){
    const link = "<a href='/join'>Try Again</a>";
    sendOkStyled(res,"Unable to join, room busy. " + link);
  }
});
app.get('/room/:roll/:hash', async function(req, res){
  const this_roll = parseInt(req.params.roll);
  var next_roll = this_roll;
  const this_hash = req.params.hash;
  if(this_roll==roll_num){
    next_roll = this_roll+1;
  }
  for(var i=0;i<slots.length;i++){
    if(slots[i].user == this_hash){
      slots[i].reset = false;
      const next_link = "<a href='/room/"+ next_roll + "/" + slots[i].next +"'>Next</a>";
      sendOkStyled(res,"Roll "+ roll_num +" is " + (slots[i].value||"You are the Chameleon") + ". "+next_link);
      return;
    }
    else if(slots[i].next == this_hash){
      const next_link = "<a href='/room/"+ next_roll + "/" + slots[i].next +"'>Next</a>";
      sendOkStyled(res,"Next Roll not ready! Roll "+ roll_num +" is " + (slots[i].value||"You are the Chameleon") + ". "+next_link);
      return;
    }
  }
  sendOkStyled(res,"You have been kicked. Go back to <a href='/'>Home</a>");

});
app.get('/reroll/:size/:exclude', async function(req, res){
  roll_num++;
  const game_size = parseInt(req.params.size);
  const excl_size = parseInt(req.params.exclude);
  const card_ids = shuffle([...Array(game_size).keys()]);
  const roll = x_opts[getRandomInt(0,3)]+y_opts[getRandomInt(0,3)];
  slots = card_ids.map((item, idx)=>{
    return {
      user:(slots[idx]==null||slots[idx].reset)?0:slots[idx].next,
      next:makeid(hash_len),
      reset:true,
      value:(item<excl_size)?0:roll,
    }
  });
  sendOkStyled(res,'Rolled for '+game_size +' people with '+excl_size+' chameleons.');
})

module.exports = app; //Perhaps not the best way to do this
// see: https://stackoverflow.com/questions/42205271/node-js-express-module-exports
