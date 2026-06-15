export default function updateForm() {
    return `
        <h2>Update Your Profil</h2>
        <form id="user-update-form">
            <label for="name">Nom:</label>
            <input type="text" id="user-name" name="name" required minlength="2" maxlength="50" autocomplete="on">

            <label for="email">Email:</label>
            <input type="email" id="user-email" name="email" autocomplete="on">

            <label for="password">Password:</label>
            <input type="password" id="user-password" name="password" minlength="6" maxlength="20" autocomplete="on">

            <input type="submit" value="update">
        </form>
    `
}