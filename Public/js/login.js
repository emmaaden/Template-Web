$(document).ready(function () {
    $("#loginForm").submit(function (e) {
        e.preventDefault()
        login()
    })
})

async function login() {

    const email = $("#email").val().trim()
    const password = $("#password").val().trim()

    if (!email || !password) {
        $("#error").text("Completa todos los campos")
        return
    }

    try {
        const res = await fetch("/api/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password })
        })

        const data = await res.json()

        if (data.success) {

            localStorage.setItem("token", data.token)
            window.location.href = "/admin"

        } else {

            $("#error").text(data.message)

        }

    } catch (error) {

        $("#error").text("Error de conexión")

    }

}