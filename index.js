var myId, yourId, conn;
var peer = new Peer();
var myAction, yourAction;
var zanCnt = 0;
const actions = ['zan', 'sDef', 'mDef', 'lDef', 'sbo', 'mbo', 'lbo']
const actionMap = {
  zan: '攒',
  sDef: '小防',
  mDef: '中防',
  lDef: '大防',
  sbo: '小波',
  mbo: '中波',
  lbo: '大波',
}
const actionScore = {
  zan: -2,
  sDef: -1,
  mDef: -2,
  lDef: -3,
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
        conn.send(selectedAction);
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
  if ((action === 'sbo' || action === 'sDef') && zanCnt < 1) {
    return false
  } else if ((action == 'mbo' || action === 'mDef') && zanCnt < 2) {
    return false
  } else if ((action == 'lbo' || action === 'lDef') && zanCnt < 3) {
    return false
  }
  return true
}

function attach_receive_handler() {
  conn.on('data', function(data) {
    yourAction = data;
    console.log('Received', data);
    update_status();
  });
}

function update_status() {
  if (myAction && yourAction) {
    console.log(`${myAction}, ${yourAction}`);
    paint();

    if (myAction === 'zan') {
      update_zancnt(1);
    } else if (myAction === 'sbo' || myAction === 'sDef') {
      update_zancnt(-1);
    } else if (myAction === 'mbo' || myAction === 'mDef') {
      update_zancnt(-2);
    } else if (myAction === 'lbo' || myAction === 'lDef') {
      update_zancnt(-3);
    }

    const myScore = actionScore[myAction];
    const yourScore = actionScore[yourAction];
    if (
      (myScore < 0 && yourScore < 0) ||
      (myScore === yourScore) ||
      (myScore + yourScore === 0)
    ) {
      setTimeout(clear_actions, 1200);
    } else {
      myScore > yourScore ? i_win() : i_lose();
    }
  }
}

function paint(){
  $('#p1Action').text(myAction ? actionMap[myAction] : '');
  $('#p2Action').text(yourAction ? actionMap[yourAction] : '');
}

function update_zancnt(change){
  if (change) {
    zanCnt += change;
  } else {
    zanCnt = 0;
  }
  $('#zanCnt').text(zanCnt);
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
}

function i_lose() {
  window.alert('You lost!');
  clear_actions();
  update_zancnt(null);
}
