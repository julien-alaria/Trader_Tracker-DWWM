export default function analystUpdateForm() {
    return `
                <h2>Update Your Profil</h2>
                <form method="post" id="analyst-update-form">
                    <label for="name">Analyst Name:</label>
                    <input type="text" id="analyst-name" name="name" required minlength="2" maxlength="50" autocomplete="on">

                    <label for="email">Analyst Email:</label>
                    <input type="email" id="analyst-email" name="email" required autocomplete="on">

                    <label for="password">Analyst Password:</label>
                    <input type="password" id="password" name="password" minlength="6" maxlength="20" autocomplete="on">

                    <label for="company">Analyst Company:</label>
                    <input type="text" id="analyst-company" name="company" maxlength="1000" autocomplete="on">

                    <label for="bio">Analyst Biography:</label>
                    <textarea id="analyst-bio" name="bio" rows="5" cols="33" maxlength="100"></textarea>

                    <input type="hidden" id="role" name="role" value="analyst" />

                    <input type="submit" value="update">
                </form>
`
}