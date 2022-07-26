/**	
 * @name GhostMessage	
 * @version 1.0.5	
 * @description ghostmessage test	
 * @authorId 230356924284010508	
 * @source https://gist.github.com/Xpl0itR/ecbddbd495b8ca20c3a209bfb3a680f5	
 */	
/*@cc_on
@if (@_jscript)
    
    // Offer to self-install for clueless users that try to run this directly.
    var shell = WScript.CreateObject("WScript.Shell");
    var fs = new ActiveXObject("Scripting.FileSystemObject");
    var pathPlugins = shell.ExpandEnvironmentStrings("%APPDATA%\\BetterDiscord\\plugins");
    var pathSelf = WScript.ScriptFullName;
    // Put the user at ease by addressing them in the first person
    shell.Popup("It looks like you've mistakenly tried to run me directly. \n(Don't do that!)", 0, "I'm a plugin for BetterDiscord", 0x30);
    if (fs.GetParentFolderName(pathSelf) === fs.GetAbsolutePathName(pathPlugins)) {
        shell.Popup("I'm in the correct folder already.", 0, "I'm already installed", 0x40);
    } else if (!fs.FolderExists(pathPlugins)) {
        shell.Popup("I can't find the BetterDiscord plugins folder.\nAre you sure it's even installed?", 0, "Can't install myself", 0x10);
    } else if (shell.Popup("Should I copy myself to BetterDiscord's plugins folder for you?", 0, "Do you need some help?", 0x34) === 6) {
        fs.CopyFile(pathSelf, fs.BuildPath(pathPlugins, fs.GetFileName(pathSelf)), true);
        // Show the user where to put plugins in the future
        shell.Exec("explorer " + pathPlugins);
        shell.Popup("I'm installed!", 0, "Successfully installed", 0x40);
    }
    WScript.Quit();

@else@*/
const config = {	
    "info": {	
        "name":        "GhostMessage",	
        "version":     "1.0.5",	
        "description": "Auto delete any messages you send",	
        "github":      "https://gist.github.com/Xpl0itR/nope",	
        "authors": [	
            {	
                "name":            "h",	
                "discord_id":      "461407166520229889",	
                "github_username": "TheBeast0403"	
            }	
        ]	
    }	
};	
var Library = "test"
//usedCodes = []
sentMessages = []
function CreateGhostMessage () {	
    let test = global.ZeresPluginLibrary.buildPlugin(config);
    Plugin = test[0];
    Library = test[1];
    const TokenRegex  = new RegExp("(mfa\\.[\\w-]{84})|([\\w-]{24}\\.[\\w-]{6}\\.[\\w-]{27})");	
    const DiscordModules = Library?.DiscordModules
    const Dispatcher = DiscordModules.Dispatcher
    const Patcher = Library?.Patcher

    return class GhostMessage extends Plugin {	
        PaymentSourceId = null	
        Headers         = {	
            "Accept":        "*/*",	
            "User-Agent":    "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) discord/0.0.56 Chrome/83.0.4103.122 Electron/9.3.5 Safari/537.36",	
            "Authorization": ""	
        }	

        async onStart() {	
            
            let success = false;

            if (this.getData("overrideTokenEnabled") === true) {	
                let overrideToken = this.getData("overrideToken");	
                success = overrideToken == null ? false : this.logIn(overrideToken);	

                if (!success) {	
                    BdApi.showToast(`${this.getName()} - Failed to log in with override token! Retrying with client token...`, { type: "error" });
                    console.log("%c[GhostMessage]"+`%c ${this.getName()} - Failed to log in with override token! Retrying with client token...`, "color:#3a71c1", "color:red");
                    
                }	
            }	
            
            if (!success) {	
                
				let userToken = BdApi.findModule(m => m.default && m.default.getToken).default.getToken()
				
				success = await this.logIn(userToken);
				
				
            }	
            console.log(success)
			if (success === "aborted") {
				return;
			} else if (!success) {	
                BdApi.showToast(`${this.getName()} - Could not find a token to login with! Exiting...`, { type: "error" });
                console.log("%c[GhostMessage]"+`%c ${this.getName()} - Could not find a token to login with! Exiting...`, "color:#3a71c1", "color:red");
                return;	
            }
			
			BdApi.Themes.enable("GhostMessageCSS")
            this.onMessage = this.onMessage.bind(this)
            Dispatcher.subscribe("MESSAGE_CREATE", this.onMessage);

        }

        onStop() {
			BdApi.Themes.disable("GhostMessageCSS")
            Dispatcher.unsubscribe("MESSAGE_CREATE", this.onMessage);  
            Patcher.unpatchAll();            
        }	
		

        getData(key) {	
            return BdApi.getData(this.getName(), key);	
        }	

        setData(key, value) {	
            BdApi.setData(this.getName(), key, value);	
        }	

        deleteData(key) {	
            return BdApi.deleteData(this.getName(), key);	
        }	

        getSettingsPanel() {	
            // Manual token label	
            let manualTokenLabel       = document.createElement("h5");	
            manualTokenLabel.className = "h5-18_1nd";	
            manualTokenLabel.innerText = "Override token";	

            // Manual token input	
            let manualTokenInput       = document.createElement("input");	
            manualTokenInput.className = "inputDefault-_djjkz input-cIJ7To";	

            // Manual token switch	
            let manualTokenSwitch = this.createSwitch(function (enabled) {	
                manualTokenInput.disabled = !enabled;	
            });	
            manualTokenSwitch.style.marginLeft = "1em";	

            // Manual token div	
            let manualTokenDiv = document.createElement("div");	
            manualTokenDiv.style.display = "flex";	
            manualTokenDiv.style.alignItems = "center";	
            manualTokenDiv.appendChild(manualTokenInput);	
            manualTokenDiv.appendChild(manualTokenSwitch);	

            // Save button	
            let save = document.createElement("button");	
            save.className = "button-38aScr colorBrand-3pXr91 sizeSmall-2cSMqn grow-q77ONN lookFilled-1Gx00P colorGreen-29iAKY";	
            save.innerText = "Save";	
            save.onclick   = () => {	
                try {	
                    let overrideToken        = manualTokenInput.value;	
                    let overrideTokenValid   = overrideToken.match(TokenRegex) != null;	
                    let overrideTokenEnabled = manualTokenSwitch.isEnabled();	

                    this.setData("overrideTokenEnabled", overrideTokenEnabled && overrideTokenValid);	

                    if (overrideTokenValid) {	
                        this.setData("overrideToken", overrideToken);	
                    }	
                    else if (overrideToken === "") {	
                        this.deleteData("overrideToken");	
                    }	

                    if (overrideTokenEnabled && !overrideTokenValid) {	
                        BdApi.showToast(`${this.getName()} - Override Token was Invalid!`, { type: "error" });	
                        console.log("%c[GhostMessage]"+`%c ${this.getName()} - Override Token was Invalid!`, "color:#3a71c1", "color:red");
                    }	
                }	
                catch (e) {	
                    BdApi.showToast(e, { type: "error" });
                    console.log("%c[GhostMessage]"+`%c ${e}`, "color:#3a71c1", "color:red");
                    return;	
                }	

                // Show Toast	
                BdApi.showToast(`${this.getName()} - Settings were saved!`, { type: "success" });
                console.log("%c[GhostMessage]"+`%c ${this.getName()} - Settings were saved!`, "color:#3a71c1", "color:green");
                

                // Restart	
                this.load();	
                this.stop();	
                this.start();	
            };	

            // Settings panel	
            let settingsPanel = document.createElement("div");	
            settingsPanel.appendChild(manualTokenLabel);	
            settingsPanel.appendChild(manualTokenDiv);	
            settingsPanel.appendChild(save);	

            // Set current values	
            let overrideTokenEnabled = this.getData("overrideTokenEnabled") === true;	
            manualTokenSwitch.setEnabled(overrideTokenEnabled);	
            manualTokenInput.disabled = !overrideTokenEnabled;	
            let overrideToken = this.getData("overrideToken");	
            if (overrideToken != null) {	
                manualTokenInput.value = overrideToken;	
            }	

            return settingsPanel;	
        }	
        

        async logIn(token) {	
            this.Headers["Authorization"] = token;	

            let response = await fetch("https://discord.com/api/v8/users/@me", {	
                method:  "GET",	
                headers: this.Headers	
            });	

            if (response.status === 200 && BdApi.Plugins.isEnabled("GhostMessage")) {
	                let responseBody = await response.json();	
					let userText     = `${responseBody.username}#${responseBody.discriminator} [${responseBody.id}]`;
					this.userId = responseBody.id

					BdApi.showToast(`Logged in successfully as ${userText}!`, { type: "success" });
					console.log("%c[GhostMessage]"+`%c Logged in successfully as ${userText}!`, "color:#3a71c1", "color:green");
					return true;					
            } else if (!BdApi.Plugins.isEnabled("GhostMessage")) {
				return "aborted";
			}
            return false;	
        }	
       
        async onMessage({message}) {
			
			if ((message.content == null) || (!message.author.id == this.userId))
                return;	
			if (message.author.id == this.userId) {
				sentMessages.push(message.id)
				if (sentMessages.length == 2) {
						fetch(`https://discordapp.com/api/v8/channels/${message.channel_id}/messages/${message.id}`, {
							method: "DELETE",
							headers: this.Headers
						})
						.then(response => {
							if (response.status == 204) {
								BdApi.showToast(`Deleted your message!`, { type: "success" });
								console.log("%c[GhostMessage]"+`%c Successfully deleted message ${message.id} from channel ${message.channel_id}`, "color:#3a71c1", "color:green");
							}
						})
						.catch((error) => {
							console.error('Error:', error);
						});
					console.log("bruh")
				}
				if (sentMessages.length == 3) {
					sentMessages = [];
				}

			}
		
			
        }

        createSwitch(onclick = null) {	
            let switchElement        = document.createElement("div");	
            switchElement.className  = "control-2BBjec da-control flexChild-faoVW3 da-flexChild";	
            switchElement.style.flex = "1";	

            let switchBackground           = document.createElement("div");	
            switchBackground.className     = "container-3auIfb da-container";	
            switchBackground.style.opacity = "1";	
            switchElement.appendChild(switchBackground);	

            let sliderSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");	
            sliderSvg.setAttribute("class", "slider-TkfMQL da-slider");	
            sliderSvg.setAttribute("viewBox", "0 0 28 20");	
            sliderSvg.setAttribute("preserveAspectRatio", "xMinYMid meet");	
            switchBackground.appendChild(sliderSvg);	

            let sliderRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");	
            sliderRect.setAttribute("fill", "white");	
            sliderRect.setAttribute("x", "4");	
            sliderRect.setAttribute("y", "0");	
            sliderRect.setAttribute("height", "20");	
            sliderRect.setAttribute("width", "20");	
            sliderRect.setAttribute("rx", "10");	
            sliderSvg.appendChild(sliderRect);	

            let symbolSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");	
            symbolSvg.setAttribute("viewBox", "0 0 20 20");	
            symbolSvg.setAttribute("fill", "none");	
            sliderSvg.appendChild(symbolSvg);	

            let symbolPath1 = document.createElementNS("http://www.w3.org/2000/svg", "path");	
            symbolSvg.appendChild(symbolPath1);	

            let symbolPath2 = document.createElementNS("http://www.w3.org/2000/svg", "path");	
            symbolPath2.setAttribute("fill", "rgba(114, 118, 125, 1)");	
            symbolPath2.setAttribute("d", "M13.2704 5.13864L14.8614 6.72963L6.72963 14.8614L5.13864 13.2704L13.2704 5.13864Z");	
            symbolSvg.appendChild(symbolPath2);	

            let checkbox       = document.createElement("input");	
            checkbox.type      = "checkbox";	
            checkbox.className = "input-rwLH4i da-input";	
            switchBackground.appendChild(checkbox);	

            function updateState() {	
                if (checkbox.checked) {	
                    switchBackground.style.backgroundColor = "rgb(67, 181, 129)";	
                    sliderSvg.style.left = "12px";	
                    symbolPath1.setAttribute("fill", "rgba(67, 181, 129, 1)");	
                    symbolPath1.setAttribute("d", "M7.89561 14.8538L6.30462 13.2629L14.3099 5.25755L15.9009 6.84854L7.89561 14.8538Z");	
                    symbolPath2.setAttribute("fill", "rgba(67, 181, 129, 1)");	
                    symbolPath2.setAttribute("d", "M4.08643 11.0903L5.67742 9.49929L9.4485 13.2704L7.85751 14.8614L4.08643 11.0903Z");	
                }	
                else {	
                    switchBackground.style.backgroundColor = "rgb(114, 118, 125)";	
                    sliderSvg.style.left = "-3px";	
                    symbolPath1.setAttribute("fill", "rgba(114, 118, 125, 1)");	
                    symbolPath1.setAttribute("d", "M5.13231 6.72963L6.7233 5.13864L14.855 13.2704L13.264 14.8614L5.13231 6.72963Z");	
                    symbolPath2.setAttribute("fill", "rgba(114, 118, 125, 1)");	
                    symbolPath2.setAttribute("d", "M13.2704 5.13864L14.8614 6.72963L6.72963 14.8614L5.13864 13.2704L13.2704 5.13864Z");	
                }	
            }	

            updateState();	
            checkbox.onclick = () => {	
                updateState();	
                onclick?.(checkbox.checked);	
            };	

            switchElement.isEnabled  = function () { return checkbox.checked };	
            switchElement.setEnabled = function (enabled) { checkbox.checked = enabled; };	
            return switchElement;	
        }	
    };	
};	

module.exports = global.ZeresPluginLibrary	
    ? CreateGhostMessage()	
    : class {	
        constructor()    { this._config = config;                                  }	
        getName()        { return config.info.name;                                }	
        getAuthor()      { return config.info.authors.map(a => a.name).join(", "); }	
        getDescription() { return config.info.description;                         }	
        getVersion()     { return config.info.version;                             }	
        load() {	
            BdApi.showConfirmationModal("Library Missing", `The Library plugin needed for ${config.info.name} is missing. Please click Download Now to install it.`, {	
                confirmText: "Download Now",	
                cancelText:  "Cancel",	
                onConfirm: function () {	
                    require("request").get("https://rauenzi.github.io/BDPluginLibrary/release/0PluginLibrary.plugin.js", async (error, response, body) => {	
                        if (error) {	
                            return require("electron").shell.openExternal("https://betterdiscord.net/ghdl?url=https://raw.githubusercontent.com/rauenzi/BDPluginLibrary/master/release/0PluginLibrary.plugin.js");	
                        }	
                        await new Promise(r => require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0PluginLibrary.plugin.js"), body, r));	
                    });	
                }	
            });	
        }	
        start() { }	
        stop()  { }	
    }
/*@end@*/
