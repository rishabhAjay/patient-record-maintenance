function keyP() {
  $(document).keypress(function () {
var ran = Math.floor((Math.random() * 4) + 1);
   var l1 = $(".button-" + ran);
   $(l1).fadeOut("fast").fadeIn();
  });
}
function clickP() {

$(".button").click(function () {


});

}
