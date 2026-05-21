const register = ` 
        <h1>Register</h1>
        <form>
            <label for="name">Nom:</label>
            <input type="text" id="name" name="name" autocomplete="on">

            <label for="email">Email:</label>
            <input type="email" id="email" name="email" autocomplete="on">

            <label for="password">Password:</label>
            <input type="password" id="password" name="password" autocomplete="off">

            <input type="submit" value="submit">
        </form>
        `;

    export function initRegister() {
        const form = document.querySelector("form")

        form.addEventListener("submit", function(e){
            e.preventDefault()
            
            const data = new FormData(form)
            
            console.log(data.get("name"))
            console.log(data.get("email"))
            console.log(data.get("password"))

            fetch("http://localhost:3000/auth/register", 
                {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body:
                    JSON.stringify({
                    name: data.get("name"),
                    email: data.get("email"),
                    password: data.get("password"),
                }),                       
            })
            if (res.status === 200) {
                localStorage.setItem("token", result.token)
                console.log(result.token)
            }
        })
    }

export default register