document.addEventListener('DOMContentLoaded', () => {

  const $accordionNav = $('#accordionNav li')
  $accordionNav.on('show.bs.collapse', function () {
    $(this).find('[data-fa-i2svg]').addClass('fa-caret-down').removeClass('fa-caret-right')
  })
  $accordionNav.on('hide.bs.collapse', function () {
    $(this).find('[data-fa-i2svg]').addClass('fa-caret-right').removeClass('fa-caret-down')
  })
})

$('.anchor').popover({
  trigger: 'focus'
})
