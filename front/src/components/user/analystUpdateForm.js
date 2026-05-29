export default function analystUpdateForm() {
    return `
                <form method="post" id="analyst-form">
                    <label for="name">Analyst Name:</label>
                    <input type="text" id="name" name="name" required minlength="2" maxlength="50" autocomplete="on">

                    <label for="email">Analyst Email:</label>
                    <input type="email" id="email" name="email" required autocomplete="on">

                    <label for="password">Analyst Password:</label>
                    <input type="password" id="password" name="password" required minlength="6" maxlength="20" autocomplete="on">

                    <label for="company">Analyst Company:</label>
                    <input type="text" id="company" name="company" maxlength="1000" autocomplete="on">

                    <label for="bio">Analyst Biography:</label>
                    <textarea id="bio" name="bio" rows="5" cols="33" maxlength="100"></textarea>

                    <input type="hidden" id="role" name="role" value="analyst" />

                    <fieldset>
                        <p>Select your asset type:&nbsp;:</p>
                        <div>
                            <input type="radio" id="asset-type1" name="analyst_type_id" value="1" required />
                            <label for="asset-type1">Forex</label>

                            <input type="radio" id="asset-type2" name="analyst_type_id" value="2" required />
                            <label for="asset-type2">Nasdaq</label>

                            <input type="radio" id="asset-type3" name="analyst_type_id" value="3" required />
                            <label for="asset-type3">Comex</label>
                        </div>
                    </fieldset>
                    <input type="submit" value="submit">
                </form>
                `
}