An rpgmaker plugin for text input from the user. Comes in three flavors: classic rpgmaker window, html textbox, html textarea. 


Here is an example of it's use: 
![image](https://github.com/Suepaphly/inputStringVariable/assets/2719634/aad21d3f-6fe7-40a1-8b3d-b2f69a12dfb1)


Here is a code snippet for "handleNewGame()". 

async function handleNewGame(passphrase, passwordProtect) {        
    // Define the variable IDs

    if (passwordProtect) {
        // If password protected, prompt for a password and save the encrypted passphrase        
        $gameSwitches.setValue(passwordProtectSwitch, true);
        const publicKey = await get_Lisk32AddressfromPassphrase(passphrase);
        let confirmedPassphrase = false;
        $gameVariables.setValue(publicKeyVariableId, publicKey);

        while (!confirmedPassphrase) {

            
            
            const passwordLabel = showLabelText('Enter your Password');
            const password = await window.getStringInputTextBox(-1);
            encryptPassphrase(passphrase, password, passphraseVariableId);


            SceneManager._scene.removeChild(passwordLabel);
            const passwordLabelConfirm = showLabelText('Confirm your Password');
            const confirmPassword = await window.getStringInputTextBox(-1);
            confirmedPassphrase = await decryptPassphrase(confirmPassword, passphraseVariableId);
            SceneManager._scene.removeChild(passwordLabelConfirm);

            if (!confirmedPassphrase) {
                // Notify the user about the mismatch and restart the process
                alert('Password confirmation failed. Please try again.');
                continue;
            }

            navigator.clipboard.writeText(confirmedPassphrase);
        }        
        
        showPassphraseOnStart();

    } else {
        $gameSwitches.setValue(passwordProtectSwitch, false);
        // If not password protected, save the public key
        const publicKey = await get_Lisk32AddressfromPassphrase(passphrase);
        $gameVariables.setValue(publicKeyVariableId, publicKey);
        showPassphraseOnStart();
    }
}

This example is from the Faet.io project, but should be simple enough to serve as a template for your project. 
