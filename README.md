# little-dragon
Software for the Little Dragon performance at the New Museum



# OSC messages

## Keys

1. /keys_range_1 
	- {"start":0.193,"stop":0.566}
1. /keys_multislider_1 
	- {"0":0.33,"list":{"0":0.33,"1":0.604,"2":0.342,"3":0.596,"4":0.521}}
1. /keys_keyboard_2 
	- {"on":0,"note":50,"midi":"50 0"}
	- {"on":64,"note":50,"midi":"50 1"}
	- 7 keys, note range 48->54
1. /keys_keyboard_3 
	- {"on":74,"note":52,"midi":"52 1"}
	- {"on":0,"note":52,"midi":"52 0"}
	- 7 keys, note range 48->54
1. /keys_button_1
	- {"press":1}
	- {"press":0}
1. /keys_tilt_1
	- {"x":-0.007,"y":0.107,"z":217.27}
	- y range only - 0.5 (resting) to 0 (fully tilted)

## Bass
1. /bass_multislider_1
	- {"0":0.471,"list":{"0":0.471,"1":0.429}}
1. /bass_keyboard_1
	- {"on":74,"note":50,"midi":"50 1"}
	- {"on":0,"note":50,"midi":"50 0"}
	- 3 notes 48->50
1. /bass_keyboard_2
	- {"on":42,"note":48,"midi":"48 1"}
	- {"on":0,"note":48,"midi":"48 0"}
	- 4 notes 48->51
1. /bass_keyboard_3
	- {"on":58,"note":48,"midi":"48 1"}
	- {"on":0,"note":49,"midi":"49 0"}
	- 3 notes 48->50
1. /bass_keyboard_4
	- {"on":85,"note":49,"midi":"49 1"}
	- {"on":0,"note":49,"midi":"49 0"}
	- 4 keys 48->51
1. /bass_tilt_1
	- {"x":0.008,"y":-0.017,"z":219.049}
	- y range only - 0.5 (resting) to 0 (fully tilted)
		
## Drums
1. /drums_toggle_0
	- {"value":1}
	- {"value":0}
1. /drums_keyboard_1
	- {"on":115,"note":49,"midi":"49 1"}
	- {"on":0,"note":49,"midi":"49 0"}
	- 5 notes 48->52
1. /drums_keyboard_2
	- {"on":74,"note":48,"midi":"48 1"}
	- {"on":0,"note":48,"midi":"48 0"}
	- 2 notes 48->49
1. /drums_keyboard_3
	- {"on":60,"note":49,"midi":"49 1"}
	- {"on":0,"note":49,"midi":"49 0"}
	- 2 notes 48->49
1. /drums_keyboard_4
	- {"on":58,"note":49,"midi":"49 1"}
	- {"on":0,"note":48,"midi":"48 0"}
	- 2 keys 48->49
1. /drums_tilt_1
	- {"x":0.082,"y":0.187,"z":207.468}
	- y range only - 0.5 (resting) to 0 (fully tilted)

