var myId, yourId, conn;
var peer = new Peer();
var myAction, yourAction;
var zanCnt = 0;
var armor = 0;
const actions = ['zan', 'defense', 'sbo', 'mbo', 'lbo']
const actionMap = {
  zan: '攒',
  defense: '防',
  sbo: '小波',
  mbo: '中波',
  lbo: '大波',
}
const actionScore = {
  zan: 0,
  defense: 0,
  sbo: 1,
  mbo: 2,
  lbo: 3,
}

peer.on('open', function(id) {
  $("#myId").text(`My ID: ${id}`);
});

peer.on('connection', function(thisCon){
  init_connection(thisCon);
});

jQuery(function($) {
  $("#connectBtn").click(function(el){
    const peerId = $('#connection-id')[0].value;
    init_connection(peer.connect(peerId));
  });

  actions.forEach(function(action){
    $(`#${action}`).click(function(el){
      const selectedAction = el.target.id;
      if (validate_action(selectedAction)) {
        myAction = selectedAction;
        paint();
        conn.send(selectedAction, armor);
        update_status();
      } else {
        window.alert('invalid action');
      }
    })
  })

});

function init_connection(thisCon) {
  conn = thisCon;
  $('#connectForm').remove();
  $('#p1').text("Me: ");
  $('#p2').text(`${conn.peer}: `);
  attach_receive_handler();
  console.log("connection received");
}

function validate_action(action){
  if (action === 'sbo' && zanCnt < 1) {
    return false
  } else if (action == 'mbo' && zanCnt < 2) {
    return false
  } else if (action == 'lbo' && zanCnt < 3) {
    return false
  }
  return true
}

function attach_receive_handler() {
  conn.on('data', function(data, armorClass) {
    yourAction = data;
    yourArmor = armorClass;
    console.log('Received', data, armorClass);
    update_status();
  });
}

function update_status() {
  if (myAction && yourAction) {
    console.log(`${myAction}, ${yourAction}`);
    paint();

    if (myAction === 'zan') {
      update_zancnt(1);
    } else if (myAction === 'sbo') {
      update_zancnt(-1);
    } else if (myAction === 'mbo') {
      update_zancnt(-2);
    } else if (myAction === 'lbo') {
      update_zancnt(-3);
    }

    if (myAction === 'defense') {
      update_defense(1);
    }

    const myArmor = armor;

    const myScore = myArmor - actionScore[yourAction];
    const yourScore = yourArmor - actionScore[myAction];

    battle_sum(myScore);
        
    if(yourScore < 0 && myScore < 0) die_together();
    if(myScore < 0) i_lose();
    if(yourScore < 0) i_win();
    setTimeout(clear_actions, 1200);
  }
}

function paint(){
  $('#p1Action').text(myAction ? actionMap[myAction] : '');
  $('#p2Action').text(yourAction ? actionMap[yourAction] : '');
}

function update_zancnt(change){
  if (change > 0) {
    zanCnt += change;
  } else if (change < 0) {
    zanCnt += change;
  } else {
    zanCnt = 0;
  }
  $('#zanCnt').text(zanCnt);
}

function update_defense(change) {
  if (change) {
    armor += change + Math.floor(Math.random() * 2);
  } else {
    armor = 0;
  }
  $('#armor').text(armor);
}

function battle_sum(change) {
  if (change === armor) {
    return ;
  } else {
    armor = change;
    $('#armor').text(armor);
  }
}

function clear_actions() {
  myAction = null;
  yourAction = null;
  paint();
}

function i_win(){
  window.alert('You win!');
  clear_actions();
  update_zancnt(null);
  update_defense(null);
}

function i_lose() {
  window.alert('You lost!');
  clear_actions();
  update_zancnt(null);
  update_defense(null);
}

function die_together() {
  window.alert('Perish together!')
  clear_action();
  update_zancnt(null);
  update_defense(null);
}
