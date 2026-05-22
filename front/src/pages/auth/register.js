const register = ` 
        <h1>Register</h1>
        <form>
            <label for="name">Nom:</label>
            <input type="text" id="name" name="name" required minlength="2" maxlength="50" autocomplete="on">

            <label for="email">Email:</label>
            <input type="email" id="email" name="email" autocomplete="on">

            <label for="password">Password:</label>
            <input type="password" id="password" name="password" required minlength="6" maxlength="20" autocomplete="on">

            <input type="submit" value="submit">
        </form>
        <form action="/#/analystregister">
            <input type="submit" value="Register as Analyst" />
        </form>
        `;

    export function initRegister() {
        const form = document.querySelector("form");

        form.addEventListener("submit", async function (e) {
            e.preventDefault();

            const data = new FormData(form);

            console.log(data.get("name"));
            console.log(data.get("email"));
            console.log(data.get("password"));

            const response = await fetch("http://localhost:3000/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: data.get("name"),
                    email: data.get("email"),
                    password: data.get("password"),
                }),
            });

            const result = await response.json()

            if (response.status === 200) {
                localStorage.setItem("token", result.token);
                console.log(result.token)
            }
        });
}

export default register