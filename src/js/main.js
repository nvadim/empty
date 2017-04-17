/**
 * Created by Donskov Maksim on 19.12.2016.
 * contact E-mail: senator92@bk.ru
 */
wow = new WOW();
$(function () {
    wow.init();

    // скролл к якорю
    $(".js__scroll_to").on("click", function (event) {
        event.preventDefault();
        var id = $(this).attr('href'),
            top = $(id).offset().top;
        $('body,html').animate({scrollTop: top}, 250);
    });
});