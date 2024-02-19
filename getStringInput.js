//=============================================================================
// getStringInput.js v1.0
//=============================================================================

/*:
 * @target MZ
 * @author Suepaphly
 * @plugindesc TextInput
 * @help TextInput
 * 
 */

(() => {
    // Ensure that the SceneManager and other required objects are available
    if (!SceneManager || !Window_Message) {
        console.error("SceneManager or Window_Message not found. The plugin might not work as expected.");
        return;
    }

    //-------------------- Create an HTML Text Box for String Input
    window.getStringInputTextBox = async function(storedInputVariableId = -1) {// default -1 to indicate not to save the password to a gameVariable
        return new Promise(resolve => {
            if (SceneManager._scene instanceof Scene_Map) {
                createHtmlTextbox(resolve, storedInputVariableId);
                
            } else {
                console.error("Not in Scene_Map. Input mode can only be activated in the map scene.");
                resolve(null);
            }
        });
    };

    function createHtmlTextbox(resolveCallback, storedInputVariableId) {
        let inputTextbox = document.createElement('input');
        inputTextbox.type = 'text';
        inputTextbox.style.position = 'absolute';
        inputTextbox.style.left = '50%';
        inputTextbox.style.top = '50%';
        inputTextbox.style.transform = 'translate(-50%, -50%)';
        inputTextbox.style.zIndex = 1000;
    
        document.body.appendChild(inputTextbox);
        inputTextbox.focus();
    
        inputTextbox.onkeydown = function(event) {
            if (event.key === 'Enter') {
                if(storedInputVariableId >= 0){
                    $gameVariables.setValue(storedInputVariableId, inputTextbox.value);
                }
                document.body.removeChild(inputTextbox);
                resolveCallback(inputTextbox.value);
            } else if (event.key === 'Backspace') {
                // Prevent default backspace behavior
                event.preventDefault();
    
                // Manually handle backspace functionality
                let cursorPos = inputTextbox.selectionStart;
                let textBeforeCursor = inputTextbox.value.substring(0, cursorPos - 1);
                let textAfterCursor = inputTextbox.value.substring(cursorPos);
                inputTextbox.value = textBeforeCursor + textAfterCursor;
    
                // Set cursor position
                inputTextbox.setSelectionRange(cursorPos - 1, cursorPos - 1);
            }
        };
    }
    
    //-------------------- Create an HTML Text Area for String Input
    window.getStringInputTextArea = async function(storedInputVariableId = -1, defaultText = '') { // Add a defaultText parameter
        return new Promise(resolve => {
            if (SceneManager._scene instanceof Scene_Map) {
                createHtmlInput('textarea', resolve, storedInputVariableId, defaultText); // Pass the default text to createHtmlInput
            } else {
                console.error("Not in Scene_Map. Input mode can only be activated in the map scene.");
                resolve(null);
            }
        });
    };
    
    function createHtmlInput(type, resolveCallback, storedInputVariableId, defaultText = '') { // Add a defaultText parameter
        let inputElement = document.createElement(type);
        if (type === 'textarea') {
            inputElement.rows = 8;
            inputElement.cols = 50;
            inputElement.value = defaultText; // Set the default text
        }
    
        inputElement.style.position = 'absolute';
        inputElement.style.left = '50%';
        inputElement.style.top = '50%';
        inputElement.style.transform = 'translate(-50%, -50%)';
        inputElement.style.zIndex = 1000;
    
        document.body.appendChild(inputElement);
        inputElement.focus();
    
        inputElement.onkeydown = function(event) {
            if (event.key === 'Enter' && !event.shiftKey) { // Prevent newline on Enter, except when Shift is held
                event.preventDefault();
                if (storedInputVariableId >= 0) {
                    $gameVariables.setValue(storedInputVariableId, inputElement.value);
                }
                document.body.removeChild(inputElement);
                resolveCallback(inputElement.value);
            } else if (event.key === 'Backspace') {
                event.preventDefault(); // Prevent default backspace behavior
    
                // Manually handle backspace functionality
                let cursorPos = inputElement.selectionStart;
                let textBeforeCursor = inputElement.value.substring(0, cursorPos - 1);
                let textAfterCursor = inputElement.value.substring(cursorPos);
                inputElement.value = textBeforeCursor + textAfterCursor;
    
                // Set cursor position
                inputElement.setSelectionRange(cursorPos - 1, cursorPos - 1);
            }
        };
    }
    

    //-------------------- Create a native RPGMakerMZ Window for String Input
    // Global function to get string input from the user
    window.getStringInputWindow = async function(storedInputVariableId = -1) {// default -1 to indicate not to save the password to a gameVariable
        return new Promise(resolve => {
            if (SceneManager._scene instanceof Scene_Map) {
                const messageWindow = SceneManager._scene._messageWindow;
                if (messageWindow && !messageWindow._isInputMode) {
                    // Activate the input mode on the message window
                    messageWindow.activateInputMode(resolve, storedInputVariableId);
                } else {
                    console.error("Message window not available or input mode already active.");
                    resolve(null);
                }
            } else {
                console.error("Not in Scene_Map. Input mode can only be activated in the map scene.");
                resolve(null);
            }
        });
    };

    // Extend Window_Message to handle input mode activation
    Window_Message.prototype.activateInputMode = function(resolveCallback, storedInputVariableId) {
        this._isInputMode = true;
        this._inputBuffer = '';
        this._inputLines = [''];
        this._inputActive = true;
        this._resolveInput = resolveCallback;
        this._storedInputVariableId = storedInputVariableId;
        this._boundHandleInput = this.handleInput.bind(this);
        document.addEventListener('keydown', this._boundHandleInput);
        this.open();
    };

    // Process the input when the player presses enter
    Window_Message.prototype.processInputEnter = function() {
        if(this._storedInputVariableId >= 0){
            $gameVariables.setValue(this._storedInputVariableId, inputText);
        }
        this._isInputMode = false;
        this._inputBuffer = '';
        this._inputLines = [];
        document.removeEventListener('keydown', this._boundHandleInput);
        this._inputActive = false;
        this.close();
        this._resolveInput(inputText);
    };

    // Handle key behavior when inputMode is active. 
    Window_Message.prototype.handleInput = function(event) {
        if (!this._isInputMode) return;
    
        const key = event.key;
        const currentLineIndex = this._inputLines.length - 1;
        let currentLine = this._inputLines[currentLineIndex];
    
        // Handling Ctrl+C (Copy)
        if (event.ctrlKey && key === 'c') {
            navigator.clipboard.writeText(this._inputLines.join('\n'));
            return;
        }
    
        // Handling Ctrl+V (Paste)
        if (event.ctrlKey && key === 'v') {
            navigator.clipboard.readText().then(pastedText => {
                let remainingSpace = 40 - currentLine.length;
                let spaceForLines = 4 - this._inputLines.length;
                let textToPaste = pastedText.substring(0, remainingSpace + spaceForLines * 40);
                this.insertText(textToPaste);
            }).catch(err => {
                console.error('Failed to read clipboard contents: ', err);
            });
            return;
        }
    
        if (key === 'Enter') {
            // When Enter is pressed, process the input or add a new line
            if (currentLine.length > 0 || this._inputLines.length === 4) {                
                this.processInputEnter();  
                $gameSwitches.setValue(6, true); // Default is set to 6, this indicates input has been entered.
            } else if (this._inputLines.length < 4) {
                this._inputLines.push('');
            }
        } else if (key === 'Backspace') {
            // Handle backspace
            if (currentLine.length > 0) {
                this._inputLines[currentLineIndex] = currentLine.slice(0, -1);
            } else if (this._inputLines.length > 1) {
                this._inputLines.pop();
            }
        } else if (key.length === 1) {
            // Add regular character input
            if (currentLine.length < 40) {
                this._inputLines[currentLineIndex] += key;
            } else if (this._inputLines.length < 4) {
                this._inputLines.push(key);
            }
        }
    
        this.refresh();
    };

    // Function to insert text at the current position
    Window_Message.prototype.insertText = function(text) {
        let lines = text.split('\n');
        for (let line of lines) {
            let currentLineIndex = this._inputLines.length - 1;
            let currentLine = this._inputLines[currentLineIndex];
            if (this._inputLines.length < 4) {
                this._inputLines[currentLineIndex] += line.substring(0, 40 - currentLine.length);
                if (line.length > 40 - currentLine.length && this._inputLines.length < 4) {
                    this._inputLines.push(line.substring(40 - currentLine.length, 40));
                }
            }
        }
        this.refresh();
    };

    // Refresh the window display
    Window_Message.prototype.refresh = function() {
        this.contents.clear();
        this.resetFontSettings();

        let textX = 0;
        if ($gameMessage.faceName()) {
            this.drawFace($gameMessage.faceName(), $gameMessage.faceIndex(), 0, 0);
            textX = 180; // Adjust for face image width
        }

        // Draw the input text or placeholder
        for (let i = 0; i < this._inputLines.length; i++) {
            this.drawText(this._inputLines[i], textX, this.lineHeight() * i, this.contentsWidth() - textX, 'left');
        }

        this.resetTextColor();
    };

})();
