var emailInput = false

document.getElementById("subscribeButton").onclick = function () {
  if (!emailInput) {
    document.getElementById("userEmailText").style.display = 'none'

    var inputField = document.getElementById("userEmailInput")
    inputField.style.display = 'block'
    inputField.focus()

    document.getElementById("userSubscribe").style.visibility = 'visible'
  }
}