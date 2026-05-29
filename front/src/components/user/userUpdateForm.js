export default function updateForm() {
    return `
        <h1>Update Your Profile</h1>
        <form id="register-form">
            <label for="name">Nom:</label>
            <input type="text" id="name" name="name" required minlength="2" maxlength="50" autocomplete="on">

            <label for="email">Email:</label>
            <input type="email" id="email" name="email" autocomplete="on">

            <label for="password">Password:</label>
            <input type="password" id="password" name="password" minlength="6" maxlength="20" autocomplete="on">

            <input type="submit" value="submit">
        </form>
    `
}