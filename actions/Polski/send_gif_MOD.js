module.exports = {

//---------------------------------------------------------------------
// Action Name
//
// This is the name of the action displayed in the editor.
//---------------------------------------------------------------------

name: "Wyślij GIF",

//---------------------------------------------------------------------
// Action Section
//
// This is the section the action will fall into.
//---------------------------------------------------------------------

section: "Edycja obrazów",

//---------------------------------------------------------------------
// Action Subtitle
//
// This function generates the subtitle displayed next to the name.
//---------------------------------------------------------------------

subtitle: function(data) {
	const channels = ['Ten sam kanał', 'Autor komendy', 'Wspomniany użytkownik', 'Wspomniany kanał', 'Domyślny kanał', 'Zmienna tymczasowa', 'Zmienna serwerowa', 'Zmienna globalna'];
	return `${channels[parseInt(data.channel)]} ${data.channel < 5 ? "" : `- ${data.varName2}`}`;
},

//---------------------------------------------------------------------
	 // DBM Mods Manager Variables (Optional but nice to have!)
	 //
	 // These are variables that DBM Mods Manager uses to show information
	 // about the mods for people to see in the list.
	 //---------------------------------------------------------------------

	 // Who made the mod (If not set, defaults to "DBM Mods")
	 author: "MrGold",

	 // The version of the mod (Defaults to 1.0.0)
	 version: "1.9.4", //Added in 1.9.4

	 // A short description to show on the mod line for this mod (Must be on a single line)
	 short_description: "Sends a GIF",

	 // If it depends on any other mods by name, ex: WrexMODS if the mod uses something from WrexMods
     

	 //---------------------------------------------------------------------

//---------------------------------------------------------------------
// Action Fields
//
// These are the fields for the action. These fields are customized
// by creating elements with corresponding IDs in the HTML. These
// are also the names of the fields stored in the action's JSON data.
//---------------------------------------------------------------------

fields: ["storage", "varName", "channel", "varName2", "message"],

//---------------------------------------------------------------------
// Command HTML
//
// This function returns a string containing the HTML used for
// editting actions. 
//
// The "isEvent" parameter will be true if this action is being used
// for an event. Due to their nature, events lack certain information, 
// so edit the HTML to reflect this.
//
// The "data" parameter stores constants for select elements to use. 
// Each is an array: index 0 for commands, index 1 for events.
// The names are: sendTargets, members, roles, channels, 
//                messages, servers, variables
//---------------------------------------------------------------------

html: function(isEvent, data) {
	return `
<div id ="wrexdiv" style="width: 550px; height: 350px; overflow-y: scroll;">
<div>
    <p>
        <u>Informacje o modzie:</u><br>
	    Stworzony przez MrGold
    </p>
</div><br>
<div>
	<div style="float: left; width: 35%;">
		Źródło - GIF:<br>
		<select id="storage" class="round" onchange="glob.refreshVariableList(this)">
			${data.variables[1]}
		</select>
	</div>
	<div id="varNameContainer" style="float: right; width: 60%;">
		Nazwa zmiennej:<br>
		<input id="varName" class="round" type="text" list="variableList"><br>
	</div>
</div><br><br><br>
<div style="padding-top: 8px;">
	<div style="float: left; width: 35%;">
		Wyślij do:<br>
		<select id="channel" class="round" onchange="glob.sendTargetChange(this, 'varNameContainer2')">
			${data.sendTargets[isEvent ? 1 : 0]}
		</select>
	</div>
	<div id="varNameContainer2" style="display: none; float: right; width: 60%;">
		Nazwa zmiennej:<br>
		<input id="varName2" class="round" type="text"><br>
	</div>
</div><br><br><br>
<div style="padding-top: 8px;">
	Wiadomość:<br>
	<textarea id="message" rows="8" placeholder="Tutaj wstaw wiadomość... (Opcjonalne)" style="width: 508px; font-family: monospace; white-space: nowrap; resize: none;"></textarea>
</div><br><br>`
},

//---------------------------------------------------------------------
// Action Editor Init Code
//
// When the HTML is first applied to the action editor, this code
// is also run. This helps add modifications or setup reactionary
// functions for the DOM elements.
//---------------------------------------------------------------------

init: function() {
	const {glob, document} = this;

    glob.refreshVariableList(document.getElementById('storage'));
	glob.sendTargetChange(document.getElementById('channel'), 'varNameContainer2');
},

//---------------------------------------------------------------------
// Action Bot Function
//
// This is the function for the action within the Bot's Action class.
// Keep in mind event calls won't have access to the "msg" parameter, 
// so be sure to provide checks for variable existance.
//---------------------------------------------------------------------

action: function(cache) {
	const data = cache.actions[cache.index];
	const storage = parseInt(data.storage);
	const varName = this.evalMessage(data.varName, cache);
	const image = this.getVariable(storage, varName, cache);

	if(!image) {
		this.callNextAction(cache);
		return;
	}

	const channel = parseInt(data.channel);
	const varName2 = this.evalMessage(data.varName2, cache);
	const target = this.getSendTarget(channel, varName2, cache);

	if(Array.isArray(target)) {
		this.callListFunc(target, 'send', [this.evalMessage(data.message, cache), {
			files: [image]
		}]).then(function() {
			this.callNextAction(cache);
		}.bind(this)).catch(this.displayError.bind(this, data, cache));
	} else if(target && target.send) {
		target.send(this.evalMessage(data.message, cache), {
			files: [image]
		}).then(function() {
			this.callNextAction(cache);
		}.bind(this)).catch(this.displayError.bind(this, data, cache));
	} else {
		this.callNextAction(cache);
	}
},

//---------------------------------------------------------------------
// Action Bot Mod
//
// Upon initialization of the bot, this code is run. Using the bot's
// DBM namespace, one can add/modify existing functions if necessary.
// In order to reduce conflictions between mods, be sure to alias
// functions you wish to overwrite.
//---------------------------------------------------------------------

mod: function(DBM) {
}

}; // End of module